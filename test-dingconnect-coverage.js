// Test de détection automatique d'opérateur DingConnect
// IMPORTANT: Remplacez YOUR_DINGCONNECT_API_KEY par votre vraie clé API

const DINGCONNECT_API_KEY = 'Ap6al5pbvdq5Wet2L5Q6C3';
const BASE_URL = 'https://api.dingconnect.com';

// Numéros de test pour Haïti
const TEST_NUMBERS = [
  { number: '+50937001234', description: 'Natcom (préfixe 37)' },
  { number: '+50930005678', description: 'Digicel (préfixe 30)' },
  { number: '+50934567890', description: 'Digicel (préfixe 34)' },
  { number: '+50928123456', description: 'Natcom (préfixe 28)' },
];

console.log('🔍 TEST DE DÉTECTION AUTOMATIQUE D\'OPÉRATEUR');
console.log('📱 DingConnect GetAccountLookup API');
console.log('');

if (DINGCONNECT_API_KEY === 'YOUR_DINGCONNECT_API_KEY') {
  console.log('❌ ERREUR: Remplacez YOUR_DINGCONNECT_API_KEY par votre vraie clé API');
  process.exit(1);
}

async function testOperatorDetection() {
  console.log('🇭🇹 TEST POUR HAÏTI (Natcom vs Digicel)');
  console.log('═'.repeat(80));
  console.log('');

  for (const test of TEST_NUMBERS) {
    console.log(`📞 Numéro: ${test.number} (${test.description})`);
    console.log('─'.repeat(80));

    try {
      // Appel à l'API GetAccountLookup
      const response = await fetch(`${BASE_URL}/api/V1/GetAccountLookup`, {
        method: 'POST',
        headers: {
          'api_key': DINGCONNECT_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          AccountNumber: test.number,
          RegionCode: 'HT'
        })
      });

      if (!response.ok) {
        console.log(`   ❌ Erreur API: ${response.status} ${response.statusText}`);
        const errorText = await response.text();
        console.log(`   Détails: ${errorText}`);
        console.log('');
        continue;
      }

      const result = await response.json();
      
      console.log('   ✅ Réponse de l\'API:');
      console.log(JSON.stringify(result, null, 4).split('\n').map(line => '   ' + line).join('\n'));
      console.log('');

      // Analyser la réponse
      if (result.ProviderCode) {
        console.log(`   📱 Opérateur détecté: ${result.ProviderCode}`);
      }
      if (result.Provider) {
        console.log(`   📱 Nom de l'opérateur: ${result.Provider}`);
      }
      if (result.Items && result.Items.length > 0) {
        console.log(`   📦 ${result.Items.length} produits disponibles`);
        result.Items.slice(0, 3).forEach((item, i) => {
          console.log(`      ${i + 1}. ${item.DefaultDisplayText || item.SkuCode}`);
        });
      }

    } catch (error) {
      console.log(`   ❌ Erreur: ${error.message}`);
    }

    console.log('');
  }

  console.log('═'.repeat(80));
  console.log('');
  console.log('💡 CONCLUSION:');
  console.log('');
  console.log('Si l\'API retourne un ProviderCode différent pour chaque numéro,');
  console.log('cela signifie que DingConnect détecte automatiquement l\'opérateur');
  console.log('(Natcom vs Digicel) en fonction du préfixe du numéro de téléphone.');
  console.log('');
  console.log('Vos utilisateurs n\'auront pas à sélectionner manuellement l\'opérateur !');
  console.log('');
}

testOperatorDetection();
