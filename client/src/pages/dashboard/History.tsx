import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { fr, enUS, es } from 'date-fns/locale';
import { Check, Clock, X, AlertTriangle, Download, RefreshCw, Search, Filter } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/contexts/LanguageContext'; // ✅ IMPORT CONTEXT
import type { Transaction } from '@shared/schema';
import { generateReceipt } from '@/utils/receiptGenerator';
import { useState } from 'react';

export default function History() {
  const { t, language } = useLanguage(); // ✅ GET LANGUAGE
  const [searchTerm, setSearchTerm] = useState('');

  // Determine date locale
  const dateLocale = language === 'fr' ? fr : language === 'es' ? es : enUS;

  const { data: transactions, isLoading } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions'],
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <Check className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'processing': return <RefreshCw className="h-4 w-4 animate-spin" />;
      case 'failed': return <X className="h-4 w-4" />;
      case 'cancelled': return <X className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-100/80';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 hover:bg-yellow-100/80';
      case 'processing': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-100/80';
      case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-100/80';
      case 'cancelled': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-100/80';
      default: return 'secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    // ✅ USE TRANSLATION KEYS
    return t(`status.${status}`) || status;
  };

  const filteredTransactions = transactions?.filter(tx => 
    tx.phoneNumber.includes(searchTerm) || 
    tx.transactionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.amount.toString().includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold lg:text-3xl">{t('history.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('history.subtitle')}</p>
        </div>
        
        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder={t('recharge.placeholder')} 
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardHeader className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{t('overview.recent_transactions')}</CardTitle>
            <Button variant="outline" size="sm" className="hidden sm:flex">
              <Filter className="mr-2 h-4 w-4" /> Filtrer
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-4 p-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          ) : filteredTransactions && filteredTransactions.length > 0 ? (
            <div className="relative w-full overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('recharge_page.transaction_id')}</TableHead>
                    <TableHead>{t('recharge_page.phone_number')}</TableHead>
                    <TableHead>{t('recharge_page.amount')}</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id} className="hover:bg-muted/50">
                      <TableCell className="font-mono text-xs">
                        <div className="flex flex-col">
                          <span className="font-medium">{transaction.transactionId}</span>
                          <span className="text-muted-foreground text-[10px]">
                            {format(new Date(transaction.createdAt || ''), 'dd MMM yyyy, HH:mm', { locale: dateLocale })}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{transaction.phoneNumber}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-bold">
                          {transaction.amount} {transaction.currency}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`gap-1 pr-2.5 ${getStatusColor(transaction.status)} border-0`}>
                          {getStatusIcon(transaction.status)}
                          {getStatusLabel(transaction.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {transaction.status === 'completed' && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                            onClick={() => generateReceipt(transaction, language)}
                            title={t('history.download_receipt')}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-4 mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">{t('history.no_transactions')}</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                {t('history.no_transactions_desc')}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
