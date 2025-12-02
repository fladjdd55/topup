import { db } from "./db";
import { operators } from "@shared/schema";

const operatorsData = [
  // Haiti
  {
    code: "NATCOM",
    name: "Natcom",
    country: "HT",
    prefixes: ["22", "28", "29", "32", "33", "35", "40", "41", "42", "43", "44", "45", "50", "51", "52", "53", "54", "55", "56", "57", "58", "59"],
    isActive: true,
    minAmount: "1.00",
    maxAmount: "300.00",
    color: "#0066cc"
  },
  {
    code: "DIGICEL",
    name: "Digicel Haiti",
    country: "HT",
    prefixes: ["30", "31", "34", "36", "37", "38", "39", "46", "47", "48", "49"],
    isActive: true,
    minAmount: "1.00",
    maxAmount: "300.00",
    color: "#E60000"
  },
  // USA
  {
    code: "ATT",
    name: "AT&T USA",
    country: "US",
    prefixes: [],
    isActive: true,
    minAmount: "5.00",
    maxAmount: "300.00",
    color: "#00A8E0"
  },
  {
    code: "TMOBILE",
    name: "T-Mobile USA",
    country: "US",
    prefixes: [],
    isActive: true,
    minAmount: "5.00",
    maxAmount: "300.00",
    color: "#E20074"
  },
  {
    code: "VERIZON",
    name: "Verizon USA",
    country: "US",
    prefixes: [],
    isActive: true,
    minAmount: "5.00",
    maxAmount: "300.00",
    color: "#CD040B"
  },
  // Canada
  {
    code: "ROGERS",
    name: "Rogers Canada",
    country: "CA",
    prefixes: [],
    isActive: true,
    minAmount: "5.00",
    maxAmount: "300.00",
    color: "#ED1B2F"
  },
  {
    code: "BELL_CA",
    name: "Bell Canada",
    country: "CA",
    prefixes: [],
    isActive: true,
    minAmount: "5.00",
    maxAmount: "300.00",
    color: "#0065A4"
  },
  {
    code: "TELUS",
    name: "Telus Canada",
    country: "CA",
    prefixes: [],
    isActive: true,
    minAmount: "5.00",
    maxAmount: "300.00",
    color: "#2C2E83"
  },
  // Dominican Republic
  {
    code: "CLARO_DO",
    name: "Claro Dominican Republic",
    country: "DO",
    prefixes: ["809", "829", "849"],
    isActive: true,
    minAmount: "1.00",
    maxAmount: "300.00",
    color: "#E20613"
  },
  {
    code: "ALTICE_DO",
    name: "Altice Dominican Republic",
    country: "DO",
    prefixes: [],
    isActive: true,
    minAmount: "1.00",
    maxAmount: "300.00",
    color: "#0085CA"
  },
  // Jamaica
  {
    code: "DIGICEL_JM",
    name: "Digicel Jamaica",
    country: "JM",
    prefixes: [],
    isActive: true,
    minAmount: "1.00",
    maxAmount: "300.00",
    color: "#E60000"
  },
  {
    code: "FLOW_JM",
    name: "Flow Jamaica",
    country: "JM",
    prefixes: [],
    isActive: true,
    minAmount: "1.00",
    maxAmount: "300.00",
    color: "#FF6B00"
  },
  // Mexico
  {
    code: "TELCEL",
    name: "Telcel Mexico",
    country: "MX",
    prefixes: [],
    isActive: true,
    minAmount: "5.00",
    maxAmount: "300.00",
    color: "#004C97"
  },
  {
    code: "MOVISTAR_MX",
    name: "Movistar Mexico",
    country: "MX",
    prefixes: [],
    isActive: true,
    minAmount: "5.00",
    maxAmount: "300.00",
    color: "#5CB615"
  },
  // Brazil
  {
    code: "VIVO_BR",
    name: "Vivo Brazil",
    country: "BR",
    prefixes: [],
    isActive: true,
    minAmount: "5.00",
    maxAmount: "300.00",
    color: "#660099"
  },
  {
    code: "CLARO_BR",
    name: "Claro Brazil",
    country: "BR",
    prefixes: [],
    isActive: true,
    minAmount: "5.00",
    maxAmount: "300.00",
    color: "#E20613"
  },
  {
    code: "TIM_BR",
    name: "TIM Brazil",
    country: "BR",
    prefixes: [],
    isActive: true,
    minAmount: "5.00",
    maxAmount: "300.00",
    color: "#004C97"
  }
];

async function seed() {
  console.log("🌱 Starting database seed...");
  
  try {
    // Check if operators already exist
    const existingOperators = await db.select().from(operators);
    
    if (existingOperators.length > 0) {
      console.log(`✅ Database already contains ${existingOperators.length} operators. Skipping seed.`);
      return;
    }
    
    // Insert operators
    console.log(`📥 Inserting ${operatorsData.length} operators...`);
    await db.insert(operators).values(operatorsData);
    
    console.log("✅ Database seeded successfully!");
    console.log(`   - ${operatorsData.length} operators added`);
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seed();
