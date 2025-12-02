-- Migration: Peupler la table operators avec tous les opérateurs supportés
-- Date: 2025-10-27
-- Description: Ajoute tous les opérateurs pour les 89 pays supportés par TapTopLoad

-- ==================== NETTOYAGE (optionnel) ====================
-- Décommenter pour supprimer tous les opérateurs existants avant insertion
-- TRUNCATE TABLE operators RESTART IDENTITY CASCADE;

-- ==================== HAITI (HT) ====================
INSERT INTO operators (code, name, country, prefixes, is_active, min_amount, max_amount, color)
VALUES
  ('NATCOM', 'Natcom', 'HT', '["22", "28", "29", "32", "33", "35", "40", "41", "42", "43", "44", "45", "50", "51", "52", "53", "54", "55", "56", "57", "58", "59"]', true, 5.00, 500.00, '#0066cc'),
  ('DIGICEL', 'Digicel Haiti', 'HT', '["30", "31", "34", "36", "37", "38", "39", "46", "47", "48", "49"]', true, 5.00, 500.00, '#E60000')
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  country = EXCLUDED.country,
  prefixes = EXCLUDED.prefixes,
  is_active = EXCLUDED.is_active,
  min_amount = EXCLUDED.min_amount,
  max_amount = EXCLUDED.max_amount,
  color = EXCLUDED.color;

-- ==================== AMÉRIQUES ====================
-- USA (US)
INSERT INTO operators (code, name, country, is_active, min_amount, max_amount, color)
VALUES ('DTONE_US', 'USA', 'US', true, 5.00, 300.00, '#0051A5')
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, country = EXCLUDED.country;

-- Canada (CA)
INSERT INTO operators (code, name, country, is_active, min_amount, max_amount, color)
VALUES ('DTONE_CA', 'Canada', 'CA', true, 5.00, 300.00, '#FF0000')
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, country = EXCLUDED.country;

-- République Dominicaine (DO)
INSERT INTO operators (code, name, country, is_active, min_amount, max_amount, color)
VALUES ('DTONE_DO', 'Dominican Republic', 'DO', true, 5.00, 300.00, '#002D62')
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, country = EXCLUDED.country;

-- Jamaïque (JM)
INSERT INTO operators (code, name, country, is_active, min_amount, max_amount, color)
VALUES ('DTONE_JM', 'Jamaica', 'JM', true, 5.00, 300.00, '#009B3A')
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, country = EXCLUDED.country;

-- Mexique (MX)
INSERT INTO operators (code, name, country, is_active, min_amount, max_amount, color)
VALUES ('DTONE_MX', 'Mexico', 'MX', true, 5.00, 300.00, '#006847')
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, country = EXCLUDED.country;

-- Brésil (BR)
INSERT INTO operators (code, name, country, is_active, min_amount, max_amount, color)
VALUES ('DTONE_BR', 'Brazil', 'BR', true, 5.00, 300.00, '#009C3B')
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, country = EXCLUDED.country;

-- Colombie (CO)
INSERT INTO operators (code, name, country, is_active, min_amount, max_amount, color)
VALUES ('DTONE_CO', 'Colombia', 'CO', true, 5.00, 300.00, '#FCD116')
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, country = EXCLUDED.country;

-- Pérou (PE)
INSERT INTO operators (code, name, country, is_active, min_amount, max_amount, color)
VALUES ('DTONE_PE', 'Peru', 'PE', true, 5.00, 300.00, '#D91023')
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, country = EXCLUDED.country;

-- Chili (CL)
INSERT INTO operators (code, name, country, is_active, min_amount, max_amount, color)
VALUES ('DTONE_CL', 'Chile', 'CL', true, 5.00, 300.00, '#0039A6')
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, country = EXCLUDED.country;

-- Argentine (AR)
INSERT INTO operators (code, name, country, is_active, min_amount, max_amount, color)
VALUES ('DTONE_AR', 'Argentina', 'AR', true, 5.00, 300.00, '#74ACDF')
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, country = EXCLUDED.country;

-- Venezuela (VE)
INSERT INTO operators (code, name, country, is_active, min_amount, max_amount, color)
VALUES ('DTONE_VE', 'Venezuela', 'VE', true, 5.00, 300.00, '#FCD116')
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, country = EXCLUDED.country;

-- Équateur (EC)
INSERT INTO operators (code, name, country, is_active, min_amount, max_amount, color)
VALUES ('DTONE_EC', 'Ecuador', 'EC', true, 5.00, 300.00, '#FFD100')
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, country = EXCLUDED.country;

-- Bolivie (BO)
INSERT INTO operators (code, name, country, is_active, min_amount, max_amount, color)
VALUES ('DTONE_BO', 'Bolivia', 'BO', true, 5.00, 300.00, '#007A33')
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, country = EXCLUDED.country;

-- Guatemala (GT)
INSERT INTO operators (code, name, country, is_active, min_amount, max_amount, color)
VALUES ('DTONE_GT', 'Guatemala', 'GT', true, 5.00, 300.00, '#4997D0')
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, country = EXCLUDED.country;

-- Honduras (HN)
INSERT INTO operators (code, name, country, is_active, min_amount, max_amount, color)
VALUES ('DTONE_HN', 'Honduras', 'HN', true, 5.00, 300.00, '#0073CF')
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, country = EXCLUDED.country;

-- El Salvador (SV)
INSERT INTO operators (code, name, country, is_active, min_amount, max_amount, color)
VALUES ('DTONE_SV', 'El Salvador', 'SV', true, 5.00, 300.00, '#0047AB')
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, country = EXCLUDED.country;

-- Nicaragua (NI)
INSERT INTO operators (code, name, country, is_active, min_amount, max_amount, color)
VALUES ('DTONE_NI', 'Nicaragua', 'NI', true, 5.00, 300.00, '#0067C6')
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, country = EXCLUDED.country;

-- Costa Rica (CR)
INSERT INTO operators (code, name, country, is_active, min_amount, max_amount, color)
VALUES ('DTONE_CR', 'Costa Rica', 'CR', true, 5.00, 300.00, '#002B7F')
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, country = EXCLUDED.country;

-- Panama (PA)
INSERT INTO operators (code, name, country, is_active, min_amount, max_amount, color)
VALUES ('DTONE_PA', 'Panama', 'PA', true, 5.00, 300.00, '#DA121A')
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, country = EXCLUDED.country;

-- ==================== EUROPE ====================
-- France (FR)
INSERT INTO operators (code, name, country, is_active, min_amount, max_amount, color)
VALUES ('DTONE_FR', 'France', 'FR', true, 5.00, 300.00, '#0055A4')
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, country = EXCLUDED.country;

-- Royaume-Uni (GB)
INSERT INTO operators (code, name, country, is_active, min_amount, max_amount, color)
VALUES ('DTONE_GB', 'United Kingdom', 'GB', true, 5.00, 300.00, '#012169')
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, country = EXCLUDED.country;

-- Allemagne (DE)
INSERT INTO operators (code, name, country, is_active, min_amount, max_amount, color)
VALUES ('DTONE_DE', 'Germany', 'DE', true, 5.00, 300.00, '#000000')
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, country = EXCLUDED.country;

-- Espagne (ES)
INSERT INTO operators (code, name, country, is_active, min_amount, max_amount, color)
VALUES ('DTONE_ES', 'Spain', 'ES', true, 5.00, 300.00, '#AA151B')
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, country = EXCLUDED.country;

-- Italie (IT)
INSERT INTO operators (code, name, country, is_active, min_amount, max_amount, color)
VALUES ('DTONE_IT', 'Italy', 'IT', true, 5.00, 300.00, '#009246')
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, country = EXCLUDED.country;

-- Portugal (PT)
INSERT INTO operators (code, name, country, is_active, min_amount, max_amount, color)
VALUES ('DTONE_PT', 'Portugal', 'PT', true, 5.00, 300.00, '#006600')
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, country = EXCLUDED.country;

-- Pays-Bas (NL)
INSERT INTO operators (code, name, country, is_active, min_amount, max_amount, color)
VALUES ('DTONE_NL', 'Netherlands', 'NL', true, 5.00, 300.00, '#AE1C28')
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, country = EXCLUDED.country;

-- Belgique (BE)
INSERT INTO operators (code, name, country, is_active, min_amount, max_amount, color)
VALUES ('DTONE_BE', 'Belgium', 'BE', true, 5.00, 300.00, '#000000')
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, country = EXCLUDED.country;

-- Suisse (CH)
INSERT INTO operators (code, name, country, is_active, min_amount, max_amount, color)
VALUES ('DTONE_CH', 'Switzerland', 'CH', true, 5.00, 300.00, '#FF0000')
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, country = EXCLUDED.country;

-- Autriche (AT)
INSERT INTO operators (code, name, country, is_active, min_amount, max_amount, color)
VALUES ('DTONE_AT', 'Austria', 'AT', true, 5.00, 300.00, '#ED2939')
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, country = EXCLUDED.country;

-- Grèce (GR)
INSERT INTO operators (code, name, country, is_active, min_amount, max_amount, color)
VALUES ('DTONE_GR', 'Greece', 'GR', true, 5.00, 300.00, '#0D5EAF')
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, country = EXCLUDED.country;

-- Pologne (PL)
INSERT INTO operators (code, name, country, is_active, min_amount, max_amount, color)
VALUES ('DTONE_PL', 'Poland', 'PL', true, 5.00, 300.00, '#DC143C')
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, country = EXCLUDED.country;

-- Roumanie (RO)
INSERT INTO operators (code, name, country, is_active, min_amount, max_amount, color)
VALUES ('DTONE_RO', 'Romania', 'RO', true, 5.00, 300.00, '#002B7F')
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, country = EXCLUDED.country;

-- République Tchèque (CZ)
INSERT INTO operators (code, name, country, is_active, min_amount, max_amount, color)
VALUES ('DTONE_CZ', 'Czech Republic', 'CZ', true, 5.00, 300.00, '#11457E')
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, country = EXCLUDED.country;

-- Hongrie (HU)
INSERT INTO operators (code, name, country, is_active, min_amount, max_amount, color)
VALUES ('DTONE_HU', 'Hungary', 'HU', true, 5.00, 300.00, '#CD2A3E')
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, country = EXCLUDED.country;

-- Suède (SE)
INSERT INTO operators (code, name, country, is_active, min_amount, max_amount, color)
VALUES ('DTONE_SE', 'Sweden', 'SE', true, 5.00, 300.00, '#006AA7')
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, country = EXCLUDED.country;

-- Norvège (NO)
INSERT INTO operators (code, name, country, is_active, min_amount, max_amount, color)
VALUES ('DTONE_NO', 'Norway', 'NO', true, 5.00, 300.00, '#BA0C2F')
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, country = EXCLUDED.country;

-- Danemark (DK)
INSERT INTO operators (code, name, country, is_active, min_amount, max_amount, color)
VALUES ('DTONE_DK', 'Denmark', 'DK', true, 5.00, 300.00, '#C8102E')
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, country = EXCLUDED.country;

-- Finlande (FI)
INSERT INTO operators (code, name, country, is_active, min_amount, max_amount, color)
VALUES ('DTONE_FI', 'Finland', 'FI', true, 5.00, 300.00, '#003580')
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, country = EXCLUDED.country;

-- Irlande (IE)
INSERT INTO operators (code, name, country, is_active, min_amount, max_amount, color)
VALUES ('DTONE_IE', 'Ireland', 'IE', true, 5.00, 300.00, '#169B62')
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, country = EXCLUDED.country;

-- Ukraine (UA)
INSERT INTO operators (code, name, country, is_active, min_amount, max_amount, color)
VALUES ('DTONE_UA', 'Ukraine', 'UA', true, 5.00, 300.00, '#0057B7')
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, country = EXCLUDED.country;

-- ==================== AFRIQUE ====================
-- Nigeria (NG)
INSERT INTO operators (code, name, country, is_active, min_amount, max_amount, color)
VALUES ('DTONE_NG', 'Nigeria', 'NG', true, 5.00, 300.00, '#008751')
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, country = EXCLUDED.country;

-- Ghana (GH)
INSERT INTO operators (code, name, country, is_active, min_amount, max_amount, color)
VALUES ('DTONE_GH', 'Ghana', 'GH', true, 5.00, 300.00, '#006B3F')
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, country = EXCLUDED.country;

-- Kenya (KE)
INSERT INTO operators (code, name, country, is_active, min_amount, max_amount, color)
VALUES ('DTONE_KE', 'Kenya', 'KE', true, 5.00, 300.00, '#BB0000')
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, country = EXCLUDED.country;

-- Sénégal (SN)
INSERT INTO operators (code, name, country, is_active, min_amount, max_amount, color)
VALUES ('DTONE_SN', 'Senegal', 'SN', true, 5.00, 300.00, '#00853F')
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, country = EXCLUDED.country;

-- Côte d'Ivoire (CI)
INSERT INTO operators (code, name, country, is_active, min_amount, max_amount, color)
VALUES ('DTONE_CI', 'Ivory Coast', 'CI', true, 5.00, 300.00, '#F77F00')
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, country = EXCLUDED.country;

-- Cameroun (CM)
INSERT INTO operators (code, name, country, is_active, min_amount, max_amount, color)
VALUES ('DTONE_CM', 'Cameroon', 'CM', true, 5.00, 300.00, '#007A5E')
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, country = EXCLUDED.country;

-- Tanzanie (TZ)
INSERT INTO operators (code, name, country, is_active, min_amount, max_amount, color)
VALUES ('DTONE_TZ', 'Tanzania', 'TZ', true, 5.00, 300.00, '#1EB53A')
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, country = EXCLUDED.country;

-- Ouganda (UG)
INSERT INTO operators (code, name, country, is_active, min_amount, max_amount, color)
VALUES ('DTONE_UG', 'Uganda', 'UG', true, 5.00, 300.00, '#FCDC04')
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, country = EXCLUDED.country;

-- Afrique du Sud (ZA)
INSERT INTO operators (code, name, country, is_active, min_amount, max_amount, color)
VALUES ('DTONE_ZA', 'South Africa', 'ZA', true, 5.00, 300.00, '#007A4D')
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, country = EXCLUDED.country;

-- Égypte (EG)
INSERT INTO operators (code, name, country, is_active, min_amount, max_amount, color)
VALUES ('DTONE_EG', 'Egypt', 'EG', true, 5.00, 300.00, '#CE1126')
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, country = EXCLUDED.country;

-- Maroc (MA)
INSERT INTO operators (code, name, country, is_active, min_amount, max_amount, color)
VALUES ('DTONE_MA', 'Morocco', 'MA', true, 5.00, 300.00, '#C1272D')
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, country = EXCLUDED.country;

-- Tunisie (TN)
INSERT INTO operators (code, name, country, is_active, min_amount, max_amount, color)
VALUES ('DTONE_TN', 'Tunisia', 'TN', true, 5.00, 300.00, '#E70013')
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, country = EXCLUDED.country;

-- Algérie (DZ)
INSERT INTO operators (code, name, country, is_active, min_amount, max_amount, color)
VALUES ('DTONE_DZ', 'Algeria', 'DZ', true, 5.00, 300.00, '#006233')
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, country = EXCLUDED.country;

-- Éthiopie (ET)
INSERT INTO operators (code, name, country, is_active, min_amount, max_amount, color)
VALUES ('DTONE_ET', 'Ethiopia', 'ET', true, 5.00, 300.00, '#078930')
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, country = EXCLUDED.country;

-- Rwanda (RW)
INSERT INTO operators (code, name, country, is_active, min_amount, max_amount, color)
VALUES ('DTONE_RW', 'Rwanda', 'RW', true, 5.00, 300.00, '#00A1DE')
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, country = EXCLUDED.country;

-- Zambie (ZM)
INSERT INTO operators (code, name, country, is_active, min_amount, max_amount, color)
VALUES ('DTONE_ZM', 'Zambia', 'ZM', true, 5.00, 300.00, '#198A00')
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, country = EXCLUDED.country;

-- Bénin (BJ)
INSERT INTO operators (code, name, country, is_active, min_amount, max_amount, color)
VALUES ('DTONE_BJ', 'Benin', 'BJ', true, 5.00, 300.00, '#008751')
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, country = EXCLUDED.country;

-- Togo (TG)
INSERT INTO operators (code, name, country, is_active, min_amount, max_amount, color)
VALUES ('DTONE_TG', 'Togo', 'TG', true, 5.00, 300.00, '#006A4E')
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, country = EXCLUDED.country;

-- Mali (ML)
INSERT INTO operators (code, name, country, is_active, min_amount, max_amount, color)
VALUES ('DTONE_ML', 'Mali', 'ML', true, 5.00, 300.00, '#14B53A')
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, country = EXCLUDED.country;

-- Burkina Faso (BF)
INSERT INTO operators (code, name, country, is_active, min_amount, max_amount, color)
VALUES ('DTONE_BF', 'Burkina Faso', 'BF', true, 5.00, 300.00, '#EF2B2D')
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, country = EXCLUDED.country;

-- ==================== ASIE ====================
-- Philippines (PH)
INSERT INTO operators (code, name, country, is_active, min_amount, max_amount, color)
VALUES ('DTONE_PH', 'Philippines', 'PH', true, 5.00, 300.00, '#0038A8')
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, country = EXCLUDED.country;

-- Inde (IN)
INSERT INTO operators (code, name, country, is_active, min_amount, max_amount, color)
VALUES ('DTONE_IN', 'India', 'IN', true, 5.00, 300.00, '#FF9933')
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, country = EXCLUDED.country;

-- Pakistan (PK)
INSERT INTO operators (code, name, country, is_active, min_amount, max_amount, color)
VALUES ('DTONE_PK', 'Pakistan', 'PK', true, 5.00, 300.00, '#01411C')
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, country = EXCLUDED.country;

-- Bangladesh (BD)
INSERT INTO operators (code, name, country, is_active, min_amount, max_amount, color)
VALUES ('DTONE_BD', 'Bangladesh', 'BD', true, 5.00, 300.00, '#006A4E')
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, country = EXCLUDED.country;

-- Vietnam (VN)
INSERT INTO operators (code, name, country, is_active, min_amount, max_amount, color)
VALUES ('DTONE_VN', 'Vietnam', 'VN', true, 5.00, 300.00, '#DA251D')
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, country = EXCLUDED.country;

-- Indonésie (ID)
INSERT INTO operators (code, name, country, is_active, min_amount, max_amount, color)
VALUES ('DTONE_ID', 'Indonesia', 'ID', true, 5.00, 300.00, '#FF0000')
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, country = EXCLUDED.country;

-- Thaïlande (TH)
INSERT INTO operators (code, name, country, is_active, min_amount, max_amount, color)
VALUES ('DTONE_TH', 'Thailand', 'TH', true, 5.00, 300.00, '#A51931')
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, country = EXCLUDED.country;

-- Malaisie (MY)
INSERT INTO operators (code, name, country, is_active, min_amount, max_amount, color)
VALUES ('DTONE_MY', 'Malaysia', 'MY', true, 5.00, 300.00, '#010066')
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, country = EXCLUDED.country;

-- Singapour (SG)
INSERT INTO operators (code, name, country, is_active, min_amount, max_amount, color)
VALUES ('DTONE_SG', 'Singapore', 'SG', true, 5.00, 300.00, '#EF3340')
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, country = EXCLUDED.country;

-- Sri Lanka (LK)
INSERT INTO operators (code, name, country, is_active, min_amount, max_amount, color)
VALUES ('DTONE_LK', 'Sri Lanka', 'LK', true, 5.00, 300.00, '#8D153A')
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, country = EXCLUDED.country;

-- Népal (NP)
INSERT INTO operators (code, name, country, is_active, min_amount, max_amount, color)
VALUES ('DTONE_NP', 'Nepal', 'NP', true, 5.00, 300.00, '#DC143C')
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, country = EXCLUDED.country;

-- Myanmar (MM)
INSERT INTO operators (code, name, country, is_active, min_amount, max_amount, color)
VALUES ('DTONE_MM', 'Myanmar', 'MM', true, 5.00, 300.00, '#FECB00')
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, country = EXCLUDED.country;

-- Cambodge (KH)
INSERT INTO operators (code, name, country, is_active, min_amount, max_amount, color)
VALUES ('DTONE_KH', 'Cambodia', 'KH', true, 5.00, 300.00, '#032EA1')
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, country = EXCLUDED.country;

-- Chine (CN)
INSERT INTO operators (code, name, country, is_active, min_amount, max_amount, color)
VALUES ('DTONE_CN', 'China', 'CN', true, 5.00, 300.00, '#DE2910')
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, country = EXCLUDED.country;

-- Japon (JP)
INSERT INTO operators (code, name, country, is_active, min_amount, max_amount, color)
VALUES ('DTONE_JP', 'Japan', 'JP', true, 5.00, 300.00, '#BC002D')
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, country = EXCLUDED.country;

-- Corée du Sud (KR)
INSERT INTO operators (code, name, country, is_active, min_amount, max_amount, color)
VALUES ('DTONE_KR', 'South Korea', 'KR', true, 5.00, 300.00, '#003478')
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, country = EXCLUDED.country;

-- ==================== MOYEN-ORIENT ====================
-- Liban (LB)
INSERT INTO operators (code, name, country, is_active, min_amount, max_amount, color)
VALUES ('DTONE_LB', 'Lebanon', 'LB', true, 5.00, 300.00, '#ED1C24')
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, country = EXCLUDED.country;

-- Jordanie (JO)
INSERT INTO operators (code, name, country, is_active, min_amount, max_amount, color)
VALUES ('DTONE_JO', 'Jordan', 'JO', true, 5.00, 300.00, '#007A3D')
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, country = EXCLUDED.country;

-- Arabie Saoudite (SA)
INSERT INTO operators (code, name, country, is_active, min_amount, max_amount, color)
VALUES ('DTONE_SA', 'Saudi Arabia', 'SA', true, 5.00, 300.00, '#165B33')
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, country = EXCLUDED.country;

-- Émirats Arabes Unis (AE)
INSERT INTO operators (code, name, country, is_active, min_amount, max_amount, color)
VALUES ('DTONE_AE', 'UAE', 'AE', true, 5.00, 300.00, '#00732F')
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, country = EXCLUDED.country;

-- Koweït (KW)
INSERT INTO operators (code, name, country, is_active, min_amount, max_amount, color)
VALUES ('DTONE_KW', 'Kuwait', 'KW', true, 5.00, 300.00, '#007A3D')
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, country = EXCLUDED.country;

-- Qatar (QA)
INSERT INTO operators (code, name, country, is_active, min_amount, max_amount, color)
VALUES ('DTONE_QA', 'Qatar', 'QA', true, 5.00, 300.00, '#8A1538')
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, country = EXCLUDED.country;

-- Oman (OM)
INSERT INTO operators (code, name, country, is_active, min_amount, max_amount, color)
VALUES ('DTONE_OM', 'Oman', 'OM', true, 5.00, 300.00, '#ED1C24')
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, country = EXCLUDED.country;

-- Bahreïn (BH)
INSERT INTO operators (code, name, country, is_active, min_amount, max_amount, color)
VALUES ('DTONE_BH', 'Bahrain', 'BH', true, 5.00, 300.00, '#CE1126')
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, country = EXCLUDED.country;

-- Irak (IQ)
INSERT INTO operators (code, name, country, is_active, min_amount, max_amount, color)
VALUES ('DTONE_IQ', 'Iraq', 'IQ', true, 5.00, 300.00, '#CE1126')
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, country = EXCLUDED.country;

-- Yémen (YE)
INSERT INTO operators (code, name, country, is_active, min_amount, max_amount, color)
VALUES ('DTONE_YE', 'Yemen', 'YE', true, 5.00, 300.00, '#CE1126')
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, country = EXCLUDED.country;

-- Turquie (TR)
INSERT INTO operators (code, name, country, is_active, min_amount, max_amount, color)
VALUES ('DTONE_TR', 'Turkey', 'TR', true, 5.00, 300.00, '#E30A17')
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, country = EXCLUDED.country;

-- Israël (IL)
INSERT INTO operators (code, name, country, is_active, min_amount, max_amount, color)
VALUES ('DTONE_IL', 'Israel', 'IL', true, 5.00, 300.00, '#0038B8')
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, country = EXCLUDED.country;

-- ==================== OCÉANIE ====================
-- Australie (AU)
INSERT INTO operators (code, name, country, is_active, min_amount, max_amount, color)
VALUES ('DTONE_AU', 'Australia', 'AU', true, 5.00, 300.00, '#00008B')
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, country = EXCLUDED.country;

-- Nouvelle-Zélande (NZ)
INSERT INTO operators (code, name, country, is_active, min_amount, max_amount, color)
VALUES ('DTONE_NZ', 'New Zealand', 'NZ', true, 5.00, 300.00, '#00247D')
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, country = EXCLUDED.country;

-- ==================== VÉRIFICATION ====================
SELECT 
  'Total operators: ' || COUNT(*) as summary,
  COUNT(CASE WHEN country = 'HT' THEN 1 END) as haiti_operators,
  COUNT(CASE WHEN country != 'HT' THEN 1 END) as international_operators
FROM operators;
