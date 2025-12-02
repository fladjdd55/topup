import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLanguage } from "@/contexts/LanguageContext";
import { Award, TrendingUp, Gift, Crown, DollarSign } from "lucide-react";
import type { LoyaltyPoints, LoyaltyTier, LoyaltyTransaction } from "@shared/schema";

interface LoyaltyData {
  points: LoyaltyPoints | null;
  tier: LoyaltyTier | null;
  transactions: LoyaltyTransaction[];
  nextTier: LoyaltyTier | null;
}

export default function Loyalty() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [pointsToRedeem, setPointsToRedeem] = useState('');

  const { data, isLoading } = useQuery<LoyaltyData>({
    queryKey: ["/api/loyalty"],
  });

  const redeemMutation = useMutation({
    mutationFn: async (points: number) => {
      const res = await apiRequest('POST', '/api/loyalty/redeem', { points });
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "✅ Points échangés",
        description: data.message,
      });
      setPointsToRedeem('');
      queryClient.invalidateQueries({ queryKey: ['/api/loyalty'] });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: "❌ Erreur",
        description: error.message,
      });
    },
  });

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case "platinum":
        return <Crown className="w-6 h-6 text-purple-500" />;
      case "gold":
        return <Award className="w-6 h-6 text-yellow-500" />;
      case "silver":
        return <Award className="w-6 h-6 text-gray-400" />;
      default:
        return <Award className="w-6 h-6 text-orange-600" />;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "platinum":
        return "bg-purple-500/10 text-purple-700 dark:text-purple-400";
      case "gold":
        return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400";
      case "silver":
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400";
      default:
        return "bg-orange-500/10 text-orange-700 dark:text-orange-400";
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="grid gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-1/3"></div>
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const points = data?.points?.points || 0;
  const tier = data?.tier;
  const nextTier = data?.nextTier;
  const transactions = data?.transactions || [];

  // Calculate progress to next tier
  const pointsToNextTier = nextTier ? nextTier.minPoints - points : 0;
  const progressPercentage = nextTier
    ? Math.min(((points - (tier?.minPoints || 0)) / (nextTier.minPoints - (tier?.minPoints || 0))) * 100, 100)
    : 100;

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{t("loyaltyProgram")}</h1>
        <p className="text-muted-foreground mt-2">
          Gagnez des points et profitez d'avantages exclusifs
        </p>
      </div>

      {/* Current Tier Card */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-3">
                {tier && getTierIcon(tier.name)}
                Niveau {tier?.name || "Bronze"}
              </CardTitle>
              <CardDescription className="mt-2">
                Profitez d'avantages exclusifs et de réductions
              </CardDescription>
            </div>
            <Badge className={getTierColor(tier?.name || "bronze")} data-testid="badge-tier">
              {tier?.commissionRate}% Commission
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Total des points</span>
                <span className="text-2xl font-bold" data-testid="text-points">
                  {points.toLocaleString()}
                </span>
              </div>
              {nextTier && (
                <>
                  <Progress value={progressPercentage} className="h-2" />
                  <p className="text-sm text-muted-foreground mt-2">
                    {pointsToNextTier} points pour atteindre le niveau {nextTier.name}
                  </p>
                </>
              )}
              {!nextTier && (
                <p className="text-sm text-muted-foreground">
                  Vous avez atteint le niveau maximum!
                </p>
              )}
            </div>

            {/* Benefits */}
            {tier && (
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <Gift className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Commission</p>
                    <p className="text-xs text-muted-foreground">
                      {tier.commissionRate}% sur chaque recharge
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Avantages</p>
                    <p className="text-xs text-muted-foreground">
                      {typeof tier.benefits === 'string' ? tier.benefits : "Accès exclusif"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Available Tiers */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Tous les niveaux</CardTitle>
          <CardDescription>
            Augmentez vos points pour débloquer de meilleurs avantages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className={`flex items-center gap-4 p-4 rounded-lg ${getTierColor("bronze")}`}>
              {getTierIcon("bronze")}
              <div className="flex-1">
                <p className="font-semibold">Bronze</p>
                <p className="text-sm">0+ points • 3% cashback</p>
              </div>
            </div>
            <div className={`flex items-center gap-4 p-4 rounded-lg ${getTierColor("silver")}`}>
              {getTierIcon("silver")}
              <div className="flex-1">
                <p className="font-semibold">Silver</p>
                <p className="text-sm">1,000+ points • 2.5% cashback</p>
              </div>
            </div>
            <div className={`flex items-center gap-4 p-4 rounded-lg ${getTierColor("gold")}`}>
              {getTierIcon("gold")}
              <div className="flex-1">
                <p className="font-semibold">Gold</p>
                <p className="text-sm">5,000+ points • 2% cashback</p>
              </div>
            </div>
            <div className={`flex items-center gap-4 p-4 rounded-lg ${getTierColor("platinum")}`}>
              {getTierIcon("platinum")}
              <div className="flex-1">
                <p className="font-semibold">Platinum</p>
                <p className="text-sm">10,000+ points • 1.5% cashback</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Redeem Points */}
      {points >= 100 && (
        <Card className="mb-6 border-primary/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Échanger vos points
            </CardTitle>
            <CardDescription>
              Convertissez vos points en crédit de recharge (100 points = $1)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <Award className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Points disponibles</p>
                  <p className="text-2xl font-bold">{points.toLocaleString()}</p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-sm text-muted-foreground">Valeur maximale</p>
                  <p className="text-xl font-semibold text-primary">
                    ${(points / 100).toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="points-redeem">Nombre de points à échanger (min. 100)</Label>
                <Input
                  id="points-redeem"
                  type="number"
                  min="100"
                  step="100"
                  placeholder="100"
                  value={pointsToRedeem}
                  onChange={(e) => setPointsToRedeem(e.target.value)}
                  data-testid="input-redeem-points"
                />
                <p className="text-sm text-muted-foreground">
                  {pointsToRedeem && parseInt(pointsToRedeem) >= 100
                    ? `Vous recevrez $${(parseInt(pointsToRedeem) / 100).toFixed(2)} de crédit`
                    : "Entrez un montant valide"}
                </p>
              </div>

              <Button
                onClick={() => redeemMutation.mutate(parseInt(pointsToRedeem))}
                disabled={!pointsToRedeem || parseInt(pointsToRedeem) < 100 || parseInt(pointsToRedeem) > points || redeemMutation.isPending}
                className="w-full"
                data-testid="button-redeem"
              >
                {redeemMutation.isPending ? "Traitement..." : "Échanger les points"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>Historique des points</CardTitle>
          <CardDescription>
            Toutes vos transactions de points
          </CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8">
              <Award className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Aucune transaction de points pour le moment
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                  data-testid={`transaction-${tx.id}`}
                >
                  <div>
                    <p className="font-medium">{tx.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : "N/A"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-semibold ${
                        tx.type === "earned"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {tx.type === "earned" ? "+" : "-"}
                      {tx.points}
                    </p>
                    <Badge variant={tx.type === "earned" ? "default" : "secondary"}>
                      {tx.type === "earned" ? "Gagné" : "Utilisé"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
