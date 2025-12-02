import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { validatePhoneNumber } from '@shared/phoneValidation';

// Exemples de numéros pour les 89 pays
const testNumbers = {
  // Amériques (20)
  "Haïti": "+509 3012 3456",
  "USA": "+1 212 555 1234",
  "Canada": "+1 416 555 1234",
  "République Dominicaine": "+1 809 555 1234",
  "Jamaïque": "+1 876 555 1234",
  "Mexique": "+52 55 1234 5678",
  "Brésil": "+55 11 98765 4321",
  "Colombie": "+57 300 1234567",
  "Pérou": "+51 987 654 321",
  "Chili": "+56 9 8765 4321",
  "Argentine": "+54 11 2345 6789",
  "Venezuela": "+58 412 1234567",
  "Équateur": "+593 99 123 4567",
  "Bolivie": "+591 7 123 4567",
  "Guatemala": "+502 5555 1234",
  "Honduras": "+504 9999 1234",
  "El Salvador": "+503 7777 1234",
  "Nicaragua": "+505 8888 1234",
  "Costa Rica": "+506 8888 1234",
  "Panama": "+507 6666 1234",
  
  // Europe (21)
  "France": "+33 6 12 34 56 78",
  "Royaume-Uni": "+44 7700 900123",
  "Allemagne": "+49 151 12345678",
  "Espagne": "+34 612 345 678",
  "Italie": "+39 333 123 4567",
  "Portugal": "+351 912 345 678",
  "Pays-Bas": "+31 6 12345678",
  "Belgique": "+32 470 12 34 56",
  "Suisse": "+41 76 123 45 67",
  "Autriche": "+43 664 1234567",
  "Grèce": "+30 690 1234567",
  "Pologne": "+48 500 123 456",
  "Roumanie": "+40 721 123 456",
  "République Tchèque": "+420 601 123 456",
  "Hongrie": "+36 20 123 4567",
  "Suède": "+46 70 123 4567",
  "Norvège": "+47 901 23 456",
  "Danemark": "+45 20 12 34 56",
  "Finlande": "+358 50 123 4567",
  "Irlande": "+353 85 123 4567",
  "Ukraine": "+380 50 123 4567",
  
  // Afrique (20)
  "Nigeria": "+234 803 123 4567",
  "Ghana": "+233 24 123 4567",
  "Kenya": "+254 712 345 678",
  "Sénégal": "+221 77 123 4567",
  "Côte d'Ivoire": "+225 07 12 34 56 78",
  "Cameroun": "+237 6 77 12 34 56",
  "Tanzanie": "+255 712 345 678",
  "Ouganda": "+256 772 123 456",
  "Afrique du Sud": "+27 82 123 4567",
  "Égypte": "+20 100 123 4567",
  "Maroc": "+212 612 345 678",
  "Tunisie": "+216 20 123 456",
  "Algérie": "+213 550 123 456",
  "Éthiopie": "+251 91 123 4567",
  "Rwanda": "+250 788 123 456",
  "Zambie": "+260 97 1234567",
  "Bénin": "+229 97 12 34 56",
  "Togo": "+228 90 12 34 56",
  "Mali": "+223 76 12 34 56",
  "Burkina Faso": "+226 70 12 34 56",
  
  // Asie (16)
  "Philippines": "+63 917 123 4567",
  "Inde": "+91 98765 43210",
  "Pakistan": "+92 300 1234567",
  "Bangladesh": "+880 1712 345678",
  "Vietnam": "+84 90 123 4567",
  "Indonésie": "+62 812 3456 7890",
  "Thaïlande": "+66 81 234 5678",
  "Malaisie": "+60 12 345 6789",
  "Singapour": "+65 9123 4567",
  "Sri Lanka": "+94 77 123 4567",
  "Népal": "+977 981 234 5678",
  "Myanmar": "+95 9 123 45678",
  "Cambodge": "+855 12 345 678",
  "Chine": "+86 138 1234 5678",
  "Japon": "+81 90 1234 5678",
  "Corée du Sud": "+82 10 1234 5678",
  
  // Moyen-Orient (12)
  "Liban": "+961 3 123 456",
  "Jordanie": "+962 7 9123 4567",
  "Arabie Saoudite": "+966 50 123 4567",
  "Émirats Arabes Unis": "+971 50 123 4567",
  "Koweït": "+965 9999 1234",
  "Qatar": "+974 3333 1234",
  "Oman": "+968 9999 1234",
  "Bahreïn": "+973 3333 1234",
  "Irak": "+964 790 123 4567",
  "Yémen": "+967 777 123 456",
  "Turquie": "+90 532 123 4567",
  "Israël": "+972 50 123 4567",
  
  // Océanie (2)
  "Australie": "+61 412 345 678",
  "Nouvelle-Zélande": "+64 21 123 4567",
};

export default function CountryTest() {
  const [customPhone, setCustomPhone] = useState('');
  const [testResults, setTestResults] = useState<Record<string, any>>({});
  const [showAll, setShowAll] = useState(false);

  const testAllCountries = () => {
    const results: Record<string, any> = {};
    
    Object.entries(testNumbers).forEach(([country, phone]) => {
      const validation = validatePhoneNumber(phone);
      results[country] = {
        phone,
        isValid: validation.isValid,
        detected: validation.countryName,
        currency: validation.currency,
        operator: validation.operatorName,
        error: validation.error
      };
    });
    
    setTestResults(results);
    setShowAll(true);
  };

  const testCustomNumber = () => {
    if (!customPhone) return;
    
    const validation = validatePhoneNumber(customPhone);
    setTestResults({
      'Test personnalisé': {
        phone: customPhone,
        isValid: validation.isValid,
        detected: validation.countryName,
        currency: validation.currency,
        operator: validation.operatorName,
        error: validation.error
      }
    });
    setShowAll(false);
  };

  const successCount = Object.values(testResults).filter(r => r.isValid).length;
  const totalCount = Object.keys(testResults).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold lg:text-3xl">Test de Détection - 89 Pays</h1>
        <p className="text-sm text-muted-foreground">
          Vérifiez que tous les pays sont correctement détectés
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Test Personnalisé</CardTitle>
          <CardDescription>Testez un numéro spécifique</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Input
              placeholder="+33 6 12 34 56 78"
              value={customPhone}
              onChange={(e) => setCustomPhone(e.target.value)}
              className="flex-1"
            />
            <Button onClick={testCustomNumber}>Tester</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Test Automatique</CardTitle>
          <CardDescription>Tester tous les 89 pays en une fois</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={testAllCountries} className="w-full">
            Tester tous les pays (89)
          </Button>
          
          {totalCount > 0 && (
            <div className="rounded-lg bg-muted p-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Résultats</span>
                <div className="flex gap-2">
                  <Badge variant={successCount === totalCount ? "default" : "destructive"}>
                    {successCount} / {totalCount} réussis
                  </Badge>
                  <Badge variant="secondary">
                    {((successCount/totalCount)*100).toFixed(1)}%
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {Object.keys(testResults).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Résultats des Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {Object.entries(testResults).map(([country, result]) => (
                <div
                  key={country}
                  className={`flex items-center gap-3 rounded-md border p-3 ${
                    result.isValid ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950' : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950'
                  }`}
                >
                  {result.isValid ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold">{country}</div>
                    <div className="text-xs text-muted-foreground">{result.phone}</div>
                  </div>
                  <div className="text-right">
                    {result.isValid ? (
                      <>
                        <div className="text-sm font-medium">{result.detected}</div>
                        <div className="text-xs text-muted-foreground">
                          {result.currency} • {result.operator}
                        </div>
                      </>
                    ) : (
                      <div className="text-sm text-red-600 dark:text-red-400">
                        {result.error || 'Erreur'}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
