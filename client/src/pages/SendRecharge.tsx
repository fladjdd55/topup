import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, Gift, CreditCard, Search, CheckCircle, Smartphone, User, DollarSign, LogIn } from "lucide-react";
import { exceedsGuestLimit, getGuestLimit } from "@shared/currencyUtils";
import { isAmountValid, getMinimumAmountMessage } from "@shared/currencyRates";
import { useLanguage } from "@/contexts/LanguageContext";
import { getSendRechargeTranslation } from "@/translations/sendRecharge";

export default function SendRecharge() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { language } = useLanguage();
  const t = getSendRechargeTranslation(language);
  const [location] = useLocation();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [requestCode, setRequestCode] = useState('');
  const [requestDetails, setRequestDetails] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    holderName: ''
  });

  // Check for code in URL params and auto-load
  useEffect(() => {
    const params = new URLSearchParams(location.split('?')[1]);
    const codeParam = params.get('code');
    
    if (codeParam && codeParam.length === 6) {
      setRequestCode(codeParam);
      searchRequestMutation.mutate(codeParam);
    }
  }, []);

  // Recherche par code SANS exiger de token
  const searchRequestMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await fetch(`/api/recharge-requests/search/${code}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(t.notFound);
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      return data;
    },
    onSuccess: (data) => {
      setRequestDetails(data.request || data);
      setCurrentStep(2);
      toast({
        title: `✅ ${t.requestFound}`,
        description: t.requestFoundDesc.replace('{amount}', `$${data.request?.amount || data.amount}`),
      });
    },
    onError: (error: Error) => {
      toast({
        title: `❌ ${t.error}`,
        description: error.message || t.notFound,
        variant: "destructive",
      });
    }
  });

  // Traitement du paiement - permet invités jusqu'à $300
  const processPaymentMutation = useMutation({
    mutationFn: async () => {
      const amount = parseFloat(requestDetails?.amount || '0');
      const currency = requestDetails?.currency || 'USD';
      
      // Vérifier que le montant respecte le minimum Stripe ($0.50 USD)
      if (!isAmountValid(amount, currency)) {
        throw new Error(getMinimumAmountMessage(currency));
      }
      
      // Guests can pay up to equivalent of $300, above requires login
      if (!user && exceedsGuestLimit(amount, currency)) {
        const limit = getGuestLimit(currency);
        throw new Error(`Pour les montants supérieurs à ${Math.floor(limit)} ${currency}, veuillez vous connecter ou créer un compte.`);
      }

      const paymentData = {
        requestCode: requestCode,
        paymentMethod: paymentMethod,
        ...(paymentMethod === 'card' && { cardDetails })
      };

      const response = await fetch('/api/recharge-requests/fulfill', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Échec du paiement');
      }

      const result = await response.json();
      return result;
    },
    onSuccess: () => {
      setCurrentStep(3);
      toast({
        title: `✅ ${t.paymentSuccessTitle}`,
        description: t.paymentSuccessDesc,
      });
    },
    onError: (error: Error) => {
      toast({
        title: `❌ ${t.paymentError}`,
        description: error.message || t.paymentFailed,
        variant: "destructive",
      });
    }
  });

  const handleSearchRequest = () => {
    const cleanCode = requestCode.trim().toUpperCase();
    
    if (!cleanCode) {
      toast({
        title: `❌ ${t.error}`,
        description: t.enterCode,
        variant: "destructive",
      });
      return;
    }

    if (cleanCode.length !== 6) {
      toast({
        title: `❌ ${t.invalidFormat}`,
        description: t.codeLength,
        variant: "destructive",
      });
      return;
    }

    setRequestCode(cleanCode);
    searchRequestMutation.mutate(cleanCode);
  };

  const handleProcessPayment = () => {
    const amount = parseFloat(requestDetails?.amount || '0');
    const currency = requestDetails?.currency || 'USD';
    
    // Check if login required for amounts > equivalent of $300
    if (!user && exceedsGuestLimit(amount, currency)) {
      const limit = getGuestLimit(currency);
      toast({
        title: `❌ ${t.loginRequired}`,
        description: t.loginRequiredDesc.replace('{limit}', Math.floor(limit).toString()).replace('{currency}', currency),
        variant: "destructive",
      });
      return;
    }

    if (!paymentMethod) {
      toast({
        title: `❌ ${t.error}`,
        description: t.selectPayment,
        variant: "destructive",
      });
      return;
    }

    if (paymentMethod === 'card') {
      const requiredFields = ['number', 'expiryMonth', 'expiryYear', 'cvv', 'holderName'];
      const missingFields = requiredFields.filter(field => !cardDetails[field as keyof typeof cardDetails]?.trim());
      
      if (missingFields.length > 0) {
        toast({
          title: `❌ ${t.missingInfo}`,
          description: t.fillAllFields,
          variant: "destructive",
        });
        return;
      }

      if (cardDetails.number.replace(/\s/g, '').length < 13) {
        toast({
          title: `❌ ${t.invalidNumber}`,
          description: t.invalidCardNumber,
          variant: "destructive",
        });
        return;
      }
    }

    processPaymentMutation.mutate();
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const resetForm = () => {
    setCurrentStep(1);
    setRequestCode('');
    setRequestDetails(null);
    setPaymentMethod('');
    setCardDetails({
      number: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: '',
      holderName: ''
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm" data-testid="button-back-home">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t.backToHome}
            </Button>
          </Link>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Gift className="w-6 h-6 mr-2 text-primary" />
              {currentStep === 1 && t.sendRecharge}
              {currentStep === 2 && t.confirmPayment}
              {currentStep === 3 && t.paymentSuccess}
              <div className="ml-auto">
                {user ? (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    👤 {user.firstName}
                  </span>
                ) : (
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                    👤 {t.guest}
                  </span>
                )}
              </div>
            </CardTitle>
            <div className="flex items-center space-x-2 mt-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                currentStep >= 1 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                1
              </div>
              <div className={`flex-1 h-1 ${currentStep >= 2 ? 'bg-primary' : 'bg-gray-200'}`} />
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                currentStep >= 2 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                2
              </div>
              <div className={`flex-1 h-1 ${currentStep >= 3 ? 'bg-primary' : 'bg-gray-200'}`} />
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                currentStep >= 3 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                3
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Step 1: Enter Request Code */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <Alert>
                  <Search className="w-4 h-4" />
                  <AlertDescription>
                    {t.infoAlert}
                  </AlertDescription>
                </Alert>

                <div>
                  <Label htmlFor="requestCode" className="text-base font-medium">
                    {t.requestCode}
                  </Label>
                  <Input
                    id="requestCode"
                    type="text"
                    maxLength={6}
                    value={requestCode}
                    onChange={(e) => setRequestCode(e.target.value.toUpperCase())}
                    placeholder="ABC123"
                    className="mt-2 h-14 text-center text-xl tracking-[0.3em] font-mono font-bold border-2 focus:border-primary"
                    data-testid="input-request-code"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    {t.codeFormat}
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">💡 {t.howItWorks}</h4>
                  <div className="text-sm text-blue-700 space-y-1">
                    <p>1. {t.step1}</p>
                    <p>2. {t.step2}</p>
                    <p>3. {t.step3}</p>
                    <p>4. {user ? t.step4User : t.step4Guest}</p>
                    <p>5. {t.step5}</p>
                  </div>
                  
                  {!user && (
                    <div className="mt-3 p-2 bg-blue-100 rounded-lg">
                      <p className="text-xs text-blue-800">
                        💡 {t.tip}
                      </p>
                    </div>
                  )}
                </div>

                <Button 
                  onClick={handleSearchRequest}
                  disabled={searchRequestMutation.isPending || requestCode.length !== 6}
                  className="w-full h-12 text-lg"
                  size="lg"
                  data-testid="button-search-request"
                >
                  {searchRequestMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {t.searchInProgress}
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5 mr-2" />
                      {t.searchRequest}
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Step 2: Confirm Payment */}
            {currentStep === 2 && requestDetails && (
              <div className="space-y-6">
                <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-4 flex items-center">
                      <Gift className="w-5 h-5 mr-2 text-blue-600" />
                      {t.requestDetails}
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                        <div className="flex items-center">
                          <Smartphone className="w-5 h-5 text-gray-600 mr-3" />
                          <span className="text-gray-600">{t.phoneToRecharge}</span>
                        </div>
                        <span className="font-medium">{requestDetails.phoneNumber}</span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                        <div className="flex items-center">
                          <DollarSign className="w-5 h-5 text-gray-600 mr-3" />
                          <span className="text-gray-600">{t.amount}</span>
                        </div>
                        <span className="font-bold text-xl text-primary">${requestDetails.amount}</span>
                      </div>

                      {requestDetails.operatorCode && (
                        <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                          <div className="flex items-center">
                            <div className="w-5 h-5 bg-gray-600 rounded mr-3"></div>
                            <span className="text-gray-600">{t.operator}</span>
                          </div>
                          <span className="font-medium capitalize">{requestDetails.operatorCode}</span>
                        </div>
                      )}

                      {requestDetails.senderName && (
                        <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                          <div className="flex items-center">
                            <User className="w-5 h-5 text-gray-600 mr-3" />
                            <span className="text-gray-600">{t.requester}</span>
                          </div>
                          <span className="font-medium">{requestDetails.senderName}</span>
                        </div>
                      )}

                      {requestDetails.message && (
                        <div className="p-3 bg-white rounded-lg shadow-sm">
                          <div className="flex items-center mb-2">
                            <div className="w-5 h-5 bg-gray-600 rounded mr-3"></div>
                            <span className="text-gray-600 font-medium">{t.message}</span>
                          </div>
                          <p className="text-gray-800 italic">"{requestDetails.message}"</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {!user && (
                  <Alert>
                    <LogIn className="w-4 h-4" />
                    <AlertDescription>
                      {t.loginToPay}
                      <Link href="/" className="text-primary underline ml-1">
                        {t.loginNow}
                      </Link>
                    </AlertDescription>
                  </Alert>
                )}

                <div>
                  <Label className="text-base font-medium mb-4 block">{t.paymentMethod}</Label>
                  <div className="grid grid-cols-1 gap-3">
                    <Button
                      variant={paymentMethod === 'moncash' ? 'default' : 'outline'}
                      onClick={() => setPaymentMethod('moncash')}
                      className="h-16 text-left justify-start border-2"
                      disabled={!user}
                      data-testid="button-payment-moncash"
                    >
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center mr-4">
                          <Smartphone className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold">MonCash</div>
                          <div className="text-sm opacity-70">Paiement mobile Digicel</div>
                        </div>
                      </div>
                    </Button>
                    
                    <Button
                      variant={paymentMethod === 'natcash' ? 'default' : 'outline'}
                      onClick={() => setPaymentMethod('natcash')}
                      className="h-16 text-left justify-start border-2"
                      disabled={!user}
                      data-testid="button-payment-natcash"
                    >
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mr-4">
                          <Smartphone className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold">NatCash</div>
                          <div className="text-sm opacity-70">Paiement mobile Natcom</div>
                        </div>
                      </div>
                    </Button>
                    
                    <Button
                      variant={paymentMethod === 'card' ? 'default' : 'outline'}
                      onClick={() => setPaymentMethod('card')}
                      className="h-16 text-left justify-start border-2"
                      disabled={!user}
                      data-testid="button-payment-card"
                    >
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mr-4">
                          <CreditCard className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold">{t.creditCard}</div>
                          <div className="text-sm opacity-70">Visa / Mastercard</div>
                        </div>
                      </div>
                    </Button>
                  </div>
                </div>

                {paymentMethod === 'card' && user && (
                  <Card className="border-2 border-blue-200">
                    <CardHeader>
                      <CardTitle className="text-lg">Informations de carte</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="cardNumber">{t.cardNumber}</Label>
                        <Input
                          id="cardNumber"
                          type="text"
                          value={cardDetails.number}
                          onChange={(e) => setCardDetails({
                            ...cardDetails, 
                            number: formatCardNumber(e.target.value)
                          })}
                          placeholder="1234 5678 9012 3456"
                          className="mt-1 h-12 text-lg tracking-wider"
                          maxLength={19}
                          data-testid="input-card-number"
                        />
                      </div>
                      
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <Label htmlFor="expiryMonth">{t.month}</Label>
                          <Input
                            id="expiryMonth"
                            type="text"
                            maxLength={2}
                            value={cardDetails.expiryMonth}
                            onChange={(e) => setCardDetails({
                              ...cardDetails, 
                              expiryMonth: e.target.value.replace(/\D/g, '')
                            })}
                            placeholder="MM"
                            className="mt-1 h-12 text-center"
                            data-testid="input-expiry-month"
                          />
                        </div>
                        <div>
                          <Label htmlFor="expiryYear">{t.year}</Label>
                          <Input
                            id="expiryYear"
                            type="text"
                            maxLength={2}
                            value={cardDetails.expiryYear}
                            onChange={(e) => setCardDetails({
                              ...cardDetails, 
                              expiryYear: e.target.value.replace(/\D/g, '')
                            })}
                            placeholder="YY"
                            className="mt-1 h-12 text-center"
                            data-testid="input-expiry-year"
                          />
                        </div>
                        <div>
                          <Label htmlFor="cvv">{t.cvv}</Label>
                          <Input
                            id="cvv"
                            type="text"
                            maxLength={4}
                            value={cardDetails.cvv}
                            onChange={(e) => setCardDetails({
                              ...cardDetails, 
                              cvv: e.target.value.replace(/\D/g, '')
                            })}
                            placeholder="123"
                            className="mt-1 h-12 text-center"
                            data-testid="input-cvv"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="holderName">{t.cardholderName}</Label>
                        <Input
                          id="holderName"
                          type="text"
                          value={cardDetails.holderName}
                          onChange={(e) => setCardDetails({
                            ...cardDetails, 
                            holderName: e.target.value
                          })}
                          placeholder="Jean Dupont"
                          className="mt-1 h-12"
                          data-testid="input-holder-name"
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card className="bg-gray-50">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center text-lg font-semibold">
                      <span>{t.totalToPay}</span>
                      <span className="text-2xl text-primary">${requestDetails.amount}</span>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setCurrentStep(1)}
                    className="flex-1 h-12"
                    data-testid="button-back-to-step1"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    {t.previous}
                  </Button>
                  
                  {user ? (
                    <Button 
                      onClick={handleProcessPayment}
                      disabled={processPaymentMutation.isPending || !paymentMethod}
                      className="flex-1 h-12 text-lg"
                      data-testid="button-pay"
                    >
                      {processPaymentMutation.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          {t.processing}
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-5 h-5 mr-2" />
                          {t.confirmAndPay} ${requestDetails.amount}
                        </>
                      )}
                    </Button>
                  ) : (
                    <Link href="/">
                      <Button className="flex-1 h-12 text-lg" data-testid="button-login-to-pay">
                        <LogIn className="w-5 h-5 mr-2" />
                        {t.loginNow}
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Success */}
            {currentStep === 3 && (
              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                
                <div>
                  <h3 className="text-2xl font-semibold mb-2 text-green-600">
                    {t.rechargeSent}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-lg">
                    {t.confirmationMessage} {requestDetails?.phoneNumber}
                  </p>
                </div>

                {requestDetails && (
                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="p-4">
                      <div className="text-sm space-y-2">
                        <div className="flex justify-between">
                          <span>{t.phoneToRecharge}:</span>
                          <span className="font-medium">{requestDetails.phoneNumber}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{t.amount}:</span>
                          <span className="font-bold">${requestDetails.amount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{t.requestCode}:</span>
                          <span className="font-mono font-medium">{requestCode}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="flex flex-col gap-3">
                  <Button onClick={resetForm} className="w-full h-12" data-testid="button-send-another">
                    <Gift className="w-5 h-5 mr-2" />
                    {t.sendAnother}
                  </Button>
                  <Link href="/">
                    <Button variant="outline" className="w-full h-12" data-testid="button-back-home-final">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      {t.backToHome}
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
