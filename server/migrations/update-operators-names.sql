-- Migration: Simplifier les noms d'opérateurs (retirer "International Mobile Recharge")
-- Date: 2025-10-27
-- Description: Renommer les opérateurs internationaux pour retirer "DTone" et simplifier

-- ==================== AMÉRIQUES ====================
UPDATE operators SET name = 'USA' WHERE code = 'DTONE_US';
UPDATE operators SET name = 'Canada' WHERE code = 'DTONE_CA';
UPDATE operators SET name = 'Dominican Republic' WHERE code = 'DTONE_DO';
UPDATE operators SET name = 'Jamaica' WHERE code = 'DTONE_JM';
UPDATE operators SET name = 'Mexico' WHERE code = 'DTONE_MX';
UPDATE operators SET name = 'Brazil' WHERE code = 'DTONE_BR';
UPDATE operators SET name = 'Colombia' WHERE code = 'DTONE_CO';
UPDATE operators SET name = 'Peru' WHERE code = 'DTONE_PE';
UPDATE operators SET name = 'Chile' WHERE code = 'DTONE_CL';
UPDATE operators SET name = 'Argentina' WHERE code = 'DTONE_AR';
UPDATE operators SET name = 'Venezuela' WHERE code = 'DTONE_VE';
UPDATE operators SET name = 'Ecuador' WHERE code = 'DTONE_EC';
UPDATE operators SET name = 'Bolivia' WHERE code = 'DTONE_BO';
UPDATE operators SET name = 'Guatemala' WHERE code = 'DTONE_GT';
UPDATE operators SET name = 'Honduras' WHERE code = 'DTONE_HN';
UPDATE operators SET name = 'El Salvador' WHERE code = 'DTONE_SV';
UPDATE operators SET name = 'Nicaragua' WHERE code = 'DTONE_NI';
UPDATE operators SET name = 'Costa Rica' WHERE code = 'DTONE_CR';
UPDATE operators SET name = 'Panama' WHERE code = 'DTONE_PA';

-- ==================== EUROPE ====================
UPDATE operators SET name = 'France' WHERE code = 'DTONE_FR';
UPDATE operators SET name = 'United Kingdom' WHERE code = 'DTONE_GB';
UPDATE operators SET name = 'Germany' WHERE code = 'DTONE_DE';
UPDATE operators SET name = 'Spain' WHERE code = 'DTONE_ES';
UPDATE operators SET name = 'Italy' WHERE code = 'DTONE_IT';
UPDATE operators SET name = 'Portugal' WHERE code = 'DTONE_PT';
UPDATE operators SET name = 'Netherlands' WHERE code = 'DTONE_NL';
UPDATE operators SET name = 'Belgium' WHERE code = 'DTONE_BE';
UPDATE operators SET name = 'Switzerland' WHERE code = 'DTONE_CH';
UPDATE operators SET name = 'Austria' WHERE code = 'DTONE_AT';
UPDATE operators SET name = 'Greece' WHERE code = 'DTONE_GR';
UPDATE operators SET name = 'Poland' WHERE code = 'DTONE_PL';
UPDATE operators SET name = 'Romania' WHERE code = 'DTONE_RO';
UPDATE operators SET name = 'Czech Republic' WHERE code = 'DTONE_CZ';
UPDATE operators SET name = 'Hungary' WHERE code = 'DTONE_HU';
UPDATE operators SET name = 'Sweden' WHERE code = 'DTONE_SE';
UPDATE operators SET name = 'Norway' WHERE code = 'DTONE_NO';
UPDATE operators SET name = 'Denmark' WHERE code = 'DTONE_DK';
UPDATE operators SET name = 'Finland' WHERE code = 'DTONE_FI';
UPDATE operators SET name = 'Ireland' WHERE code = 'DTONE_IE';
UPDATE operators SET name = 'Ukraine' WHERE code = 'DTONE_UA';

-- ==================== AFRIQUE ====================
UPDATE operators SET name = 'Nigeria' WHERE code = 'DTONE_NG';
UPDATE operators SET name = 'Ghana' WHERE code = 'DTONE_GH';
UPDATE operators SET name = 'Kenya' WHERE code = 'DTONE_KE';
UPDATE operators SET name = 'Senegal' WHERE code = 'DTONE_SN';
UPDATE operators SET name = 'Ivory Coast' WHERE code = 'DTONE_CI';
UPDATE operators SET name = 'Cameroon' WHERE code = 'DTONE_CM';
UPDATE operators SET name = 'Tanzania' WHERE code = 'DTONE_TZ';
UPDATE operators SET name = 'Uganda' WHERE code = 'DTONE_UG';
UPDATE operators SET name = 'South Africa' WHERE code = 'DTONE_ZA';
UPDATE operators SET name = 'Egypt' WHERE code = 'DTONE_EG';
UPDATE operators SET name = 'Morocco' WHERE code = 'DTONE_MA';
UPDATE operators SET name = 'Tunisia' WHERE code = 'DTONE_TN';
UPDATE operators SET name = 'Algeria' WHERE code = 'DTONE_DZ';
UPDATE operators SET name = 'Ethiopia' WHERE code = 'DTONE_ET';
UPDATE operators SET name = 'Rwanda' WHERE code = 'DTONE_RW';
UPDATE operators SET name = 'Zambia' WHERE code = 'DTONE_ZM';
UPDATE operators SET name = 'Benin' WHERE code = 'DTONE_BJ';
UPDATE operators SET name = 'Togo' WHERE code = 'DTONE_TG';
UPDATE operators SET name = 'Mali' WHERE code = 'DTONE_ML';
UPDATE operators SET name = 'Burkina Faso' WHERE code = 'DTONE_BF';

-- ==================== ASIE ====================
UPDATE operators SET name = 'Philippines' WHERE code = 'DTONE_PH';
UPDATE operators SET name = 'India' WHERE code = 'DTONE_IN';
UPDATE operators SET name = 'Pakistan' WHERE code = 'DTONE_PK';
UPDATE operators SET name = 'Bangladesh' WHERE code = 'DTONE_BD';
UPDATE operators SET name = 'Vietnam' WHERE code = 'DTONE_VN';
UPDATE operators SET name = 'Indonesia' WHERE code = 'DTONE_ID';
UPDATE operators SET name = 'Thailand' WHERE code = 'DTONE_TH';
UPDATE operators SET name = 'Malaysia' WHERE code = 'DTONE_MY';
UPDATE operators SET name = 'Singapore' WHERE code = 'DTONE_SG';
UPDATE operators SET name = 'Sri Lanka' WHERE code = 'DTONE_LK';
UPDATE operators SET name = 'Nepal' WHERE code = 'DTONE_NP';
UPDATE operators SET name = 'Myanmar' WHERE code = 'DTONE_MM';
UPDATE operators SET name = 'Cambodia' WHERE code = 'DTONE_KH';
UPDATE operators SET name = 'China' WHERE code = 'DTONE_CN';
UPDATE operators SET name = 'Japan' WHERE code = 'DTONE_JP';
UPDATE operators SET name = 'South Korea' WHERE code = 'DTONE_KR';

-- ==================== MOYEN-ORIENT ====================
UPDATE operators SET name = 'Lebanon' WHERE code = 'DTONE_LB';
UPDATE operators SET name = 'Jordan' WHERE code = 'DTONE_JO';
UPDATE operators SET name = 'Saudi Arabia' WHERE code = 'DTONE_SA';
UPDATE operators SET name = 'UAE' WHERE code = 'DTONE_AE';
UPDATE operators SET name = 'Kuwait' WHERE code = 'DTONE_KW';
UPDATE operators SET name = 'Qatar' WHERE code = 'DTONE_QA';
UPDATE operators SET name = 'Oman' WHERE code = 'DTONE_OM';
UPDATE operators SET name = 'Bahrain' WHERE code = 'DTONE_BH';
UPDATE operators SET name = 'Iraq' WHERE code = 'DTONE_IQ';
UPDATE operators SET name = 'Yemen' WHERE code = 'DTONE_YE';
UPDATE operators SET name = 'Turkey' WHERE code = 'DTONE_TR';
UPDATE operators SET name = 'Israel' WHERE code = 'DTONE_IL';

-- ==================== OCÉANIE ====================
UPDATE operators SET name = 'Australia' WHERE code = 'DTONE_AU';
UPDATE operators SET name = 'New Zealand' WHERE code = 'DTONE_NZ';

-- ==================== VÉRIFICATION ====================
SELECT code, name, country FROM operators WHERE country != 'HT' ORDER BY name LIMIT 10;
