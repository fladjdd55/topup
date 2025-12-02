import 'dotenv/config';

const apiKey = process.env.DTONE_API_KEY;
const apiSecret = process.env.DTONE_API_SECRET;
const baseUrl = process.env.DTONE_BASE_URL || 'https://preprod-dvs-api.dtone.com/v1';

const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');

console.log('🔍 DÉCOUVERTE DES PAYS RÉELLEMENT SUPPORTÉS PAR L\'API DTONE');
console.log('🌐 Environnement:', baseUrl.includes('preprod') ? 'PREPROD' : 'PRODUCTION');
console.log('');

async function discoverSupportedCountries() {
  try {
    // Récupérer TOUS les produits disponibles (sans filtre)
    console.log('📡 Récupération de tous les produits disponibles...');
    
    let allProducts = [];
    let page = 1;
    const perPage = 100;
    
    // Récupérer plusieurs pages de produits
    while (page <= 10) { // Limiter à 10 pages (1000 produits max)
      const productsRes = await fetch(
        `${baseUrl}/products?page=${page}&per_page=${perPage}`,
        {
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!productsRes.ok) {
        console.error('❌ Erreur lors de la récupération des produits (page', page, ')');
        break;
      }

      const products = await productsRes.json();
      
      if (products.length === 0) {
        break; // Plus de produits
      }
      
      allProducts = allProducts.concat(products);
      console.log(`   📄 Page ${page}: ${products.length} produits récupérés (total: ${allProducts.length})`);
      
      if (products.length < perPage) {
        break; // Dernière page
      }
      
      page++;
      
      // Délai pour éviter rate limiting
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    console.log('');
    console.log(`✅ Total produits récupérés: ${allProducts.length}`);
    console.log('');
    
    // Analyser les pays/opérateurs présents
    const operatorMap = new Map();
    const countryMap = new Map();
    
    allProducts.forEach(product => {
      if (product.operator) {
        const opId = product.operator.id;
        const opName = product.operator.name;
        const country = product.destination?.name || 'Unknown';
        const countryCode = product.destination?.iso_code || 'XX';
        
        // Compter par opérateur
        if (!operatorMap.has(opId)) {
          operatorMap.set(opId, {
            id: opId,
            name: opName,
            country,
            countryCode,
            productCount: 0
          });
        }
        operatorMap.get(opId).productCount++;
        
        // Compter par pays
        if (!countryMap.has(countryCode)) {
          countryMap.set(countryCode, {
            code: countryCode,
            name: country,
            operators: new Set(),
            productCount: 0
          });
        }
        countryMap.get(countryCode).operators.add(opName);
        countryMap.get(countryCode).productCount++;
      }
    });
    
    // Trier par nombre de produits
    const operators = Array.from(operatorMap.values())
      .sort((a, b) => b.productCount - a.productCount);
    
    const countries = Array.from(countryMap.values())
      .map(c => ({
        ...c,
        operators: Array.from(c.operators)
      }))
      .sort((a, b) => b.productCount - a.productCount);
    
    console.log('═'.repeat(80));
    console.log('📊 RÉSUMÉ DES PAYS SUPPORTÉS PAR L\'API');
    console.log('═'.repeat(80));
    console.log('');
    
    console.log(`🌍 Nombre de pays trouvés: ${countries.length}`);
    console.log(`📱 Nombre d'opérateurs trouvés: ${operators.length}`);
    console.log(`📦 Nombre total de produits: ${allProducts.length}`);
    console.log('');
    
    // TOP 50 pays
    console.log('🏆 TOP 50 PAYS AVEC LE PLUS DE PRODUITS:');
    console.log('─'.repeat(80));
    console.log('');
    
    const top50 = countries.slice(0, 50);
    top50.forEach((country, index) => {
      const rank = (index + 1).toString().padStart(2, ' ');
      const code = country.code.padEnd(4);
      const name = country.name.substring(0, 25).padEnd(25);
      const prodCount = country.productCount.toString().padStart(4);
      const opCount = country.operators.length.toString().padStart(2);
      
      console.log(`${rank}. ${code} ${name} | ${prodCount} produits | ${opCount} opérateurs`);
    });
    
    console.log('');
    console.log('─'.repeat(80));
    console.log('');
    
    // Vérifier si les pays demandés sont présents
    const requestedCountries = [
      'HT',  // Haiti
      'DO',  // Dominican Republic
      'US',  // USA
      'CA',  // Canada
      'JM',  // Jamaica
      'MX',  // Mexico
      'BR',  // Brazil
      'FR',  // France
      'GB',  // UK
      'DE',  // Germany
      'NG',  // Nigeria
      'GH',  // Ghana
      'KE',  // Kenya
      'PH',  // Philippines
      'IN',  // India
    ];
    
    console.log('🔍 VÉRIFICATION DES PAYS DEMANDÉS:');
    console.log('─'.repeat(80));
    console.log('');
    
    requestedCountries.forEach(code => {
      const country = countries.find(c => c.code === code);
      if (country) {
        console.log(`✅ ${code}: ${country.name} - ${country.productCount} produits`);
        console.log(`   Opérateurs: ${country.operators.join(', ')}`);
      } else {
        console.log(`❌ ${code}: PAS TROUVÉ dans l'API`);
      }
    });
    
    console.log('');
    console.log('═'.repeat(80));
    console.log('');
    
    // Conclusion
    const haitiPresent = countries.some(c => c.code === 'HT');
    
    if (!haitiPresent) {
      console.log('⚠️  CONCLUSION: HAÏTI N\'EST PAS SUPPORTÉ PAR VOTRE API DTONE');
      console.log('');
      console.log('   Votre compte DTone API n\'a pas accès aux produits Haïti.');
      console.log('   Les produits que vous voyez dans le dashboard web ne sont PAS');
      console.log('   accessibles via votre API key actuelle.');
      console.log('');
      console.log('   OPTIONS:');
      console.log('   1. Contactez DTone Support pour activer Haïti sur votre compte API');
      console.log('   2. Utilisez un compte DTone différent avec accès Haïti');
      console.log('   3. Migrez vers Reloadly qui supporte officiellement Haïti');
      console.log('');
    } else {
      console.log('✅ HAÏTI EST SUPPORTÉ PAR L\'API !');
      console.log('   Le problème vient probablement d\'une mauvaise configuration.');
    }
    
    // Sauvegarder dans un fichier
    const report = {
      totalProducts: allProducts.length,
      totalCountries: countries.length,
      totalOperators: operators.length,
      countries: countries.slice(0, 50),
      operators: operators.slice(0, 100),
      requestedCountriesStatus: requestedCountries.map(code => ({
        code,
        found: countries.find(c => c.code === code) ? true : false,
        data: countries.find(c => c.code === code) || null
      }))
    };
    
    const fs = await import('fs');
    fs.writeFileSync('dtone-supported-countries.json', JSON.stringify(report, null, 2));
    console.log('💾 Rapport détaillé sauvegardé dans: dtone-supported-countries.json');
    console.log('');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

discoverSupportedCountries();
