import jsPDF from 'jspdf';
import type { Transaction } from '@shared/schema';
import { format } from 'date-fns';
import { fr, enUS, es } from 'date-fns/locale';
import type { Language } from '@/contexts/LanguageContext';

const receiptTranslations = {
  fr: {
    title: 'TapTopLoad',
    subtitle: 'Reçu de Recharge',
    date: 'Date',
    transactionDetails: 'Détails de la transaction',
    transactionId: 'ID Transaction',
    phoneNumber: 'Numéro de téléphone',
    operator: 'Opérateur',
    rechargeAmount: 'Montant de la recharge',
    commission: 'Frais de service',
    totalPaid: 'Total payé',
    paymentMethod: 'Méthode de paiement',
    status: 'Statut',
    totalAmount: 'Montant Total',
    thankYou: 'Merci d\'utiliser TapTopLoad',
    proofOfPayment: 'Ce reçu est généré automatiquement et constitue une preuve de paiement.',
    footer: 'TapTopLoad - Service de recharge mobile',
    generatedOn: 'Généré le',
    statusLabels: {
      pending: 'En attente',
      processing: 'En cours',
      completed: 'Terminée',
      failed: 'Échouée',
      cancelled: 'Annulée',
      awaiting_delivery: 'En attente de livraison',
      pending_confirmation: 'En attente de confirmation',
    }
  },
  en: {
    title: 'TapTopLoad',
    subtitle: 'Top-up Receipt',
    date: 'Date',
    transactionDetails: 'Transaction details',
    transactionId: 'Transaction ID',
    phoneNumber: 'Phone number',
    operator: 'Operator',
    rechargeAmount: 'Top-up amount',
    commission: 'Service fee',
    totalPaid: 'Total paid',
    paymentMethod: 'Payment method',
    status: 'Status',
    totalAmount: 'Total Amount',
    thankYou: 'Thank you for using TapTopLoad',
    proofOfPayment: 'This receipt is automatically generated and serves as proof of payment.',
    footer: 'TapTopLoad - Mobile top-up service',
    generatedOn: 'Generated on',
    statusLabels: {
      pending: 'Pending',
      processing: 'Processing',
      completed: 'Completed',
      failed: 'Failed',
      cancelled: 'Cancelled',
      awaiting_delivery: 'Awaiting delivery',
      pending_confirmation: 'Pending confirmation',
    }
  },
  ht: {
    title: 'TapTopLoad',
    subtitle: 'Resi Rechaj',
    date: 'Dat',
    transactionDetails: 'Detay tranzaksyon',
    transactionId: 'ID Tranzaksyon',
    phoneNumber: 'Nimewo telefòn',
    operator: 'Operatè',
    rechargeAmount: 'Montan rechaj',
    commission: 'Frè sèvis',
    totalPaid: 'Total peye',
    paymentMethod: 'Metòd peman',
    status: 'Estati',
    totalAmount: 'Total',
    thankYou: 'Mèsi pou itilize TapTopLoad',
    proofOfPayment: 'Resi sa a kreye otomatikman e li sèvi kòm prèv peman.',
    footer: 'TapTopLoad - Sèvis rechaj mobil',
    generatedOn: 'Kreye',
    statusLabels: {
      pending: 'An atant',
      processing: 'Ap trete',
      completed: 'Fini',
      failed: 'Echwe',
      cancelled: 'Anile',
      awaiting_delivery: 'An atant livrezon',
      pending_confirmation: 'An atant konfirmasyon',
    }
  },
  es: {
    title: 'TapTopLoad',
    subtitle: 'Recibo de Recarga',
    date: 'Fecha',
    transactionDetails: 'Detalles de la transacción',
    transactionId: 'ID de Transacción',
    phoneNumber: 'Número de teléfono',
    operator: 'Operador',
    rechargeAmount: 'Monto de recarga',
    commission: 'Tarifa de servicio',
    totalPaid: 'Total pagado',
    paymentMethod: 'Método de pago',
    status: 'Estado',
    totalAmount: 'Monto Total',
    thankYou: 'Gracias por usar TapTopLoad',
    proofOfPayment: 'Este recibo se genera automáticamente y sirve como comprobante de pago.',
    footer: 'TapTopLoad - Servicio de recarga móvil',
    generatedOn: 'Generado el',
    statusLabels: {
      pending: 'Pendiente',
      processing: 'Procesando',
      completed: 'Completada',
      failed: 'Fallida',
      cancelled: 'Cancelada',
      awaiting_delivery: 'Esperando entrega',
      pending_confirmation: 'Esperando confirmación',
    }
  }
};

const dateLocales = {
  fr: fr,
  en: enUS,
  ht: enUS, // Use English locale for Haitian Creole
  es: es
};

export function generateReceipt(transaction: Transaction, language: Language = 'fr') {
  const doc = new jsPDF();
  const t = receiptTranslations[language];
  
  console.log('📄 [Receipt Generator] Starting...', {
    language,
    title: t.title,
    subtitle: t.subtitle,
    transaction: transaction,
    transactionId: transaction.transactionId,
    phoneNumber: transaction.phoneNumber,
    amount: transaction.amount,
    currency: transaction.currency,
    status: transaction.status,
    operatorCode: transaction.operatorCode,
    paymentMethod: transaction.paymentMethod,
    commission: transaction.commission,
    totalReceived: transaction.totalReceived
  });
  
  const pageWidth = doc.internal.pageSize.width;
  
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text(t.title, pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'normal');
  doc.text(t.subtitle, pageWidth / 2, 30, { align: 'center' });
  
  doc.setDrawColor(99, 102, 241);
  doc.setLineWidth(0.5);
  doc.line(20, 35, pageWidth - 20, 35);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const dateFormat = language === 'en' ? 'MMMM dd, yyyy \'at\' HH:mm' : 'dd MMMM yyyy à HH:mm';
  const receiptDate = transaction.createdAt 
    ? format(new Date(transaction.createdAt), dateFormat, { locale: dateLocales[language] })
    : format(new Date(), dateFormat, { locale: dateLocales[language] });
  doc.text(`${t.date}: ${receiptDate}`, pageWidth - 20, 45, { align: 'right' });
  
  let yPosition = 60;
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(t.transactionDetails, 20, yPosition);
  yPosition += 10;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const currency = transaction.currency || 'USD';
  
  const details = [
    { label: t.transactionId, value: String(transaction.transactionId || 'N/A') },
    { label: t.phoneNumber, value: String(transaction.phoneNumber || 'N/A') },
    { label: t.operator, value: String(transaction.operatorCode || 'N/A') },
    { label: t.rechargeAmount, value: `${transaction.amount || '0'} ${currency}` },
  ];
  
  if (transaction.commission && parseFloat(transaction.commission) > 0) {
    details.push({ label: t.commission, value: `+${parseFloat(transaction.commission).toFixed(2)} ${currency}` });
  }
  
  if (transaction.totalReceived && parseFloat(transaction.totalReceived) > 0) {
    details.push({ label: t.totalPaid, value: `${parseFloat(transaction.totalReceived).toFixed(2)} ${currency}` });
  }
  
  details.push(
    { label: t.paymentMethod, value: String(transaction.paymentMethod || 'N/A') },
    { label: t.status, value: String(t.statusLabels[transaction.status as keyof typeof t.statusLabels] || transaction.status || 'N/A') }
  );
  
  details.forEach((detail) => {
    doc.setFont('helvetica', 'bold');
    doc.text(String(detail.label) + ':', 25, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(String(detail.value), 85, yPosition);
    yPosition += 8;
  });
  
  yPosition += 10;
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(20, yPosition, pageWidth - 20, yPosition);
  yPosition += 15;
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  const totalAmount = transaction.totalReceived || transaction.amount;
  doc.text(t.totalAmount + ':', 20, yPosition);
  doc.text(`${parseFloat(totalAmount).toFixed(2)} ${currency}`, pageWidth - 20, yPosition, { align: 'right' });
  
  yPosition += 20;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100, 100, 100);
  doc.text(t.thankYou, pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 10;
  doc.setFont('helvetica', 'normal');
  doc.text(t.proofOfPayment, pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition = doc.internal.pageSize.height - 20;
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(t.footer, pageWidth / 2, yPosition, { align: 'center' });
  const genDateFormat = language === 'en' ? 'MM/dd/yyyy \'at\' HH:mm' : 'dd/MM/yyyy à HH:mm';
  doc.text(`${t.generatedOn} ${format(new Date(), genDateFormat, { locale: dateLocales[language] })}`, pageWidth / 2, yPosition + 5, { align: 'center' });
  
  const fileName = `receipt_${transaction.transactionId}_${format(new Date(), 'yyyyMMdd_HHmmss')}.pdf`;
  doc.save(fileName);
}
