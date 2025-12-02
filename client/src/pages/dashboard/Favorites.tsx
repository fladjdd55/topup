import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Star, Plus, Trash2, Phone, Edit2, X, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import type { Favorite } from '@shared/schema';
import { insertFavoriteSchema } from '@shared/schema';
import { z } from 'zod';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Favorites() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    phoneNumber: '',
    nickname: '',
    operatorCode: '',
  });

  const { data: favorites, isLoading } = useQuery<Favorite[]>({
    queryKey: ['/api/favorites'],
  });

  const addMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiRequest('POST', '/api/favorites', data);
    },
    onMutate: async (data) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['/api/favorites'] });

      // Snapshot previous value
      const previousFavorites = queryClient.getQueryData<Favorite[]>(['/api/favorites']);

      // Create optimistic favorite
      const optimisticFavorite: Favorite = {
        id: Date.now(), // Temporary ID
        userId: 0, // Will be set by server
        phoneNumber: data.phoneNumber,
        nickname: data.nickname || null,
        operatorCode: data.operatorCode || null,
        createdAt: new Date().toISOString(),
      };

      // Optimistically add to cache
      queryClient.setQueryData<Favorite[]>(['/api/favorites'], (old) =>
        old ? [optimisticFavorite, ...old] : [optimisticFavorite]
      );

      return { previousFavorites };
    },
    onSuccess: () => {
      toast({
        title: t('favorites.added'),
        description: t('favorites.added_desc'),
      });
      setOpen(false);
      setFormData({ phoneNumber: '', nickname: '', operatorCode: '' });
    },
    onError: (error: Error, _data, context) => {
      // Rollback on error
      if (context?.previousFavorites) {
        queryClient.setQueryData(['/api/favorites'], context.previousFavorites);
      }
      toast({
        variant: 'destructive',
        title: t('favorites.error'),
        description: error.message,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/favorites/${id}`, undefined);
    },
    onMutate: async (id: number) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['/api/favorites'] });

      // Snapshot previous value
      const previousFavorites = queryClient.getQueryData<Favorite[]>(['/api/favorites']);

      // Optimistically update
      queryClient.setQueryData<Favorite[]>(['/api/favorites'], (old) =>
        old ? old.filter((fav) => fav.id !== id) : []
      );

      return { previousFavorites };
    },
    onSuccess: () => {
      toast({
        title: t('favorites.deleted'),
        description: t('favorites.deleted_desc'),
      });
    },
    onError: (error: Error, _id, context) => {
      // Rollback on error
      if (context?.previousFavorites) {
        queryClient.setQueryData(['/api/favorites'], context.previousFavorites);
      }
      toast({
        variant: 'destructive',
        title: t('favorites.error'),
        description: error.message,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validated = insertFavoriteSchema.parse(formData);
      addMutation.mutate(validated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          variant: 'destructive',
          title: t('favorites.error'),
          description: error.errors[0].message,
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold lg:text-3xl" data-testid="title-favorites">{t('favorites.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('favorites.subtitle')}</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-favorite">
              <Plus className="mr-2 h-4 w-4" />
              {t('favorites.add')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{t('favorites.dialog_title')}</DialogTitle>
                <DialogDescription>
                  {t('favorites.dialog_desc')}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">{t('recharge.phone_number_label')}</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder="+509 1234 5678"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    data-testid="input-phone-number"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nickname">{t('favorites.nickname_label')}</Label>
                  <Input
                    id="nickname"
                    placeholder={t('favorites.nickname_placeholder')}
                    value={formData.nickname}
                    onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                    data-testid="input-nickname"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="operatorCode">{t('favorites.operator_label')}</Label>
                  <Input
                    id="operatorCode"
                    placeholder={t('favorites.operator_placeholder')}
                    value={formData.operatorCode}
                    onChange={(e) => setFormData({ ...formData, operatorCode: e.target.value })}
                    data-testid="input-operator-code"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  {t('favorites.cancel')}
                </Button>
                <Button type="submit" disabled={addMutation.isPending} data-testid="button-submit-favorite">
                  {addMutation.isPending ? t('common.loading') : t('favorites.add')}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : favorites && favorites.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {favorites.map((favorite) => (
            <Card key={favorite.id} data-testid={`favorite-card-${favorite.id}`}>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gradient-to-br from-primary to-purple-600">
                    <Star className="h-5 w-5 text-white" />
                  </div>
                  <CardTitle className="text-base">
                    {favorite.nickname || 'Favori'}
                  </CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteMutation.mutate(favorite.id)}
                  disabled={deleteMutation.isPending}
                  data-testid={`button-delete-${favorite.id}`}
                  className="h-8 w-8"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="font-mono">{favorite.phoneNumber}</span>
                  </div>
                  {favorite.operatorCode && (
                    <div className="text-xs text-muted-foreground">
                      {t('recharge.operator_detected')}: {favorite.operatorCode}
                    </div>
                  )}
                  <Button
                    className="w-full"
                    size="sm"
                    onClick={() => {
                      localStorage.setItem('recharge_phone', favorite.phoneNumber);
                      setLocation('/dashboard/recharge');
                    }}
                    data-testid={`button-recharge-${favorite.id}`}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    {t('favorites.recharge_now')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Star className="mb-4 h-16 w-16 text-muted-foreground/50" />
            <h3 className="mb-2 text-lg font-semibold">{t('favorites.no_favorites')}</h3>
            <p className="mb-6 text-center text-sm text-muted-foreground">
              {t('favorites.no_favorites_desc')}
            </p>
            <Button onClick={() => setOpen(true)} data-testid="button-add-first-favorite">
              <Plus className="mr-2 h-4 w-4" />
              {t('favorites.add_favorite')}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
