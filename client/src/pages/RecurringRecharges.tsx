import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Clock, Plus, Trash2, Play, Pause, Zap } from "lucide-react";
import type { RecurringRecharge } from "@shared/schema";
import { CURRENCY_NAMES, isAmountValid, getMinimumAmountMessage } from "@shared/currencyRates";
import { validatePhoneNumber } from "@shared/phoneValidation";

export default function RecurringRecharges() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({
    phoneNumber: "",
    amount: "",
    operatorCode: "",
    frequency: "monthly",
    dayOfMonth: 1,
    currency: "USD",
  });

  // Auto-detect currency from phone number
  useEffect(() => {
    if (!formData.phoneNumber || formData.phoneNumber.length < 4) {
      return;
    }
    
    try {
      const validation = validatePhoneNumber(formData.phoneNumber);
      if (validation.isValid && validation.currency) {
        setFormData(prev => ({
          ...prev,
          currency: validation.currency || 'USD',
          operatorCode: validation.operator || "",
        }));
      }
    } catch (error) {
      console.error('Error detecting currency:', error);
    }
  }, [formData.phoneNumber]);

  // Fetch recurring recharges
  const { data: recharges = [], isLoading } = useQuery<RecurringRecharge[]>({
    queryKey: ["/api/recurring-recharges"],
  });

  // Create recurring recharge
  const createMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/recurring-recharges", formData);
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/recurring-recharges"] });
      
      // 🆕 Check if we need to launch the initial recharge
      if (data.needsInitialRecharge) {
        console.log('[Recurring Recharge] Redirecting to recharge page for initial transaction');
        
        // Store the recurring recharge data in sessionStorage for the recharge page
        sessionStorage.setItem('initialRecharge', JSON.stringify({
          recurringRechargeId: data.id,
          phoneNumber: data.phoneNumber,
          amount: data.amount,
          currency: data.currency,
          operatorCode: data.operatorCode,
        }));
        
        toast({
          title: t("success"),
          description: "Configuration créée ! Veuillez maintenant effectuer la première recharge.",
        });
        
        setIsCreateOpen(false);
        
        // Redirect to recharge page
        window.location.href = '/dashboard/recharge';
      } else {
        toast({
          title: t("success"),
          description: "Recharge récurrente créée avec succès",
        });
        setIsCreateOpen(false);
        setFormData({
          phoneNumber: "",
          amount: "",
          operatorCode: "",
          frequency: "monthly",
          dayOfMonth: 1,
          currency: "USD",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: t("error"),
        description: error.message || "Erreur lors de la création",
        variant: "destructive",
      });
    },
  });

  // Toggle active status
  const toggleMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      const res = await apiRequest("PUT", `/api/recurring-recharges/${id}`, { isActive: !isActive });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recurring-recharges"] });
      toast({
        title: t("success"),
        description: "Statut mis à jour",
      });
    },
    onError: (error: any) => {
      // 🛡️ Si l'erreur indique qu'il faut effectuer la première recharge
      if (error.needsInitialRecharge) {
        toast({
          variant: 'destructive',
          title: 'Première recharge requise',
          description: error.message || 'Vous devez effectuer la première recharge avant d\'activer cette configuration.',
          duration: 6000,
        });
      } else {
        toast({
          variant: 'destructive',
          title: t("error"),
          description: error.message || "Erreur lors de la mise à jour",
        });
      }
    },
  });

  // Delete recurring recharge
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/recurring-recharges/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recurring-recharges"] });
      toast({
        title: t("success"),
        description: "Recharge récurrente supprimée",
      });
    },
  });

  const getFrequencyLabel = (frequency: string) => {
    const labels: Record<string, string> = {
      daily: "Quotidien",
      weekly: "Hebdomadaire",
      monthly: "Mensuel",
      yearly: "Annuel",
    };
    return labels[frequency] || frequency;
  };

  const handleCreateClick = () => {
    const amount = parseFloat(formData.amount);
    
    // Valider le montant minimum
    if (!isAmountValid(amount, formData.currency)) {
      toast({
        variant: 'destructive',
        title: 'Montant trop petit',
        description: getMinimumAmountMessage(formData.currency),
        duration: 5000,
      });
      return;
    }

    // Si validation OK, créer la recharge récurrente
    createMutation.mutate();
  };

  // 🆕 Gérer le clic sur "Effectuer la première recharge"
  const handleInitialRecharge = (recharge: RecurringRecharge) => {
    console.log('[Recurring Recharge] User wants to complete initial recharge:', recharge);
    
    // Stocker les données dans sessionStorage pour la page de recharge
    sessionStorage.setItem('initialRecharge', JSON.stringify({
      recurringRechargeId: recharge.id,
      phoneNumber: recharge.phoneNumber,
      amount: recharge.amount,
      currency: recharge.currency,
      operatorCode: recharge.operatorCode,
    }));
    
    // Rediriger vers la page de recharge
    window.location.href = '/dashboard/recharge';
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-1/3"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">{t("recurringRecharges")}</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2">
            Automatisez vos recharges avec des paiements récurrents
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-recurring" className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle recharge
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Créer une recharge récurrente</DialogTitle>
              <DialogDescription>
                Configurez une recharge automatique pour ce numéro
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <Label htmlFor="phoneNumber">Numéro de téléphone</Label>
                <Input
                  id="phoneNumber"
                  data-testid="input-phone"
                  placeholder="+1234567890"
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, phoneNumber: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="amount">Montant ({formData.currency})</Label>
                <Input
                  id="amount"
                  data-testid="input-amount"
                  type="number"
                  placeholder="50.00"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="currency">Devise</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) =>
                    setFormData({ ...formData, currency: value })
                  }
                >
                  <SelectTrigger id="currency" data-testid="select-currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {Object.entries(CURRENCY_NAMES).map(([code, name]) => (
                      <SelectItem key={code} value={code}>
                        {code} - {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="frequency">Fréquence</Label>
                <Select
                  value={formData.frequency}
                  onValueChange={(value) =>
                    setFormData({ ...formData, frequency: value })
                  }
                >
                  <SelectTrigger id="frequency" data-testid="select-frequency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Quotidien</SelectItem>
                    <SelectItem value="weekly">Hebdomadaire</SelectItem>
                    <SelectItem value="monthly">Mensuel</SelectItem>
                    <SelectItem value="yearly">Annuel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {formData.frequency === "monthly" && (
                <div>
                  <Label htmlFor="dayOfMonth">Jour du mois (1-28)</Label>
                  <Input
                    id="dayOfMonth"
                    data-testid="input-day-of-month"
                    type="number"
                    min="1"
                    max="28"
                    value={formData.dayOfMonth}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        dayOfMonth: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
              )}
              <Button
                data-testid="button-submit-recurring"
                className="w-full"
                onClick={handleCreateClick}
                disabled={
                  createMutation.isPending ||
                  !formData.phoneNumber ||
                  !formData.amount
                }
              >
                {createMutation.isPending ? "Création..." : "Créer"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {recharges.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Aucune recharge récurrente
            </h3>
            <p className="text-muted-foreground mb-4">
              Créez votre première recharge automatique
            </p>
            <Button
              variant="outline"
              onClick={() => setIsCreateOpen(true)}
              data-testid="button-create-first"
            >
              <Plus className="w-4 h-4 mr-2" />
              Créer une recharge
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {recharges.map((recharge) => (
            <Card key={recharge.id} data-testid={`card-recharge-${recharge.id}`}>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                  <div className="flex-1">
                    <CardTitle className="text-lg sm:text-xl break-all">
                      {recharge.phoneNumber}
                    </CardTitle>
                    <CardDescription className="mt-1 text-xs sm:text-sm">
                      {recharge.amount} {recharge.currency}
                      {' '}•{' '}
                      {getFrequencyLabel(recharge.frequency)}
                    </CardDescription>
                  </div>
                  <Badge
                    variant={(recharge.isActive ?? true) ? "default" : "secondary"}
                    data-testid={`badge-status-${recharge.id}`}
                    className="self-start"
                  >
                    {(recharge.isActive ?? true) ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                  {recharge.lastExecutionDate && (
                    <span className="truncate">
                      Dernière: {new Date(recharge.lastExecutionDate).toLocaleDateString()}
                    </span>
                  )}
                  {recharge.nextExecutionDate && (recharge.isActive ?? true) && (
                    <span className="truncate">
                      • Prochaine: {new Date(recharge.nextExecutionDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
                {recharge.failureCount && recharge.failureCount > 0 && (
                  <p className="text-xs sm:text-sm text-destructive mb-3 sm:mb-4">
                    {recharge.failureCount} échec(s) consécutif(s)
                  </p>
                )}
                <div className="flex flex-col sm:flex-row gap-2">
                  {/* 🆕 Si needsInitialRecharge, afficher bouton pour effectuer première recharge */}
                  {recharge.needsInitialRecharge ? (
                    <Button
                      variant="default"
                      size="sm"
                      data-testid={`button-initial-recharge-${recharge.id}`}
                      onClick={() => handleInitialRecharge(recharge)}
                      className="w-full sm:w-auto"
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Effectuer la première recharge
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      data-testid={`button-toggle-${recharge.id}`}
                      onClick={() =>
                        toggleMutation.mutate({
                          id: recharge.id,
                          isActive: recharge.isActive ?? true,
                        })
                      }
                      disabled={toggleMutation.isPending}
                      className="w-full sm:w-auto"
                    >
                      {(recharge.isActive ?? true) ? (
                        <>
                          <Pause className="w-4 h-4 mr-2" />
                          Désactiver
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Activer
                        </>
                      )}
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    data-testid={`button-delete-${recharge.id}`}
                    onClick={() => deleteMutation.mutate(recharge.id)}
                    disabled={deleteMutation.isPending}
                    className="w-full sm:w-auto"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Supprimer
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
