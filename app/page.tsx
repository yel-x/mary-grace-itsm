'use client';

import { useState, useEffect, useRef, type ChangeEvent } from 'react';

// 🚀 LIVE PRODUCT TYPES FROM MARY GRACE DATA CONSOLE (Bakery / Commissary)
const productTypeOptions = [
  '(L001) ENSAYMADAS - CLASSIC', '(L002) ENSAYMADAS - TWIST', '(L003) BOH WIP',
  '(L004) ALL-DAY BKFST SHARE', '(L006) DAIRY', '(L007) FRESH SALADS - SHARE',
  '(L008) FRESH SALADS - SOLO', '(L009) ALL-DAY BKFST SOLO', '(L010) CAFE RM',
  '(L011) CAFE VEG', '(L012) CAKES - CELEBRATION', '(L013) CHEESE ROLLS',
  '(L014) COMMI PREMIX', '(L015) COMMI WIP', '(L017) CREAM', '(L018) DESSERT BARS',
  '(L019) DIP', '(L020) DRY', '(L021) FAM PLATTERS-BRKFST', '(L022) FAM PLATTERS - PASTA',
  '(L023) FAM PLATTERS - SALAD', '(L024) FAM PLATTERS - SNDWC', '(L025) FAM PLATTERS - SOUP',
  '(L026) FATS & OIL', '(L027) FLAVORFUL PASTAS-SHR', '(L028) FLAVORFUL PASTA-SOLO',
  '(L029) FRUITS & VEGETABLES', '(L030) HEARTY SANDWICHES', '(L031) HEARTY SNDWCHS - SET',
  '(L032) HEARTY SNDWCHS - SOLO', '(L033) HOT FILL', '(L034) KID\'S CORNER',
  '(L035) KIDS MENU', '(L036) LOAF CAKES', '(L037) LOAVES - WHOLE', '(L038) MAINS',
  '(L039) MARINATED MEAT', '(L040) MEAT', '(L041) PASTA SAUCE', '(L042) PASTRIES - JAR',
  '(L043) PIZZAS', '(L044) PREMIX', '(L045) RTE', '(L046) SALAD DRESSING',
  '(L047) SAVORY STARTERS', '(L048) SEAFOOD', '(L049) SIGNATURE CAKES - MI',
  '(L050) SIGNATURE CAKES - SL', '(L051) SIGNATURE CAKES - WH', '(L052) SOUP',
  '(L053) TEA', '(L056) VEGETABLES', '(L057) WET', '(L058) COOKIES', '(BEV000) BEVERAGE',
  '(BEV001) BEVERAGES - COFFEE', '(BEV002) BEV - FRUIT SHAKES', '(BEV003) BEVERAGES - ICED TEA',
  '(BEV004) BEV - HOT CHOCOLATE', '(A007) BILL JACKET', '(A014) ENVELOPE & MAILERS',
  '(A019) GIFT CERTIFICATES', '(A023) LABELS AND TAGS', '(A028) MENU BOOK',
  '(A032) PACKAGING', '(A033) PAPER PRODUCTS', '(A038) PRICE TAG', '(A039) PRICE TAG STICKERS',
  '(A045) STORAGE AND PACKAGIN', '(L005) ACCOUNTABLE FORMS', '(A009) DESK ACCESSORIES',
  '(A031) OFFICE SUPPLIES', '(A044) STATIONERIES', '(A051) WRITING INSTRUMENTS',
  '(A053) WRITING AND CORRECTI', '(A054) BOOK', '(A042) SAFETY TOOL', '(A049) UNIFORM',
  '(A050) UNIFORM MANUF', '(FA03) CM-PPE', '(FA07) FIRE SAFETY EQPMT', '(FA19) PPE',
  '(FA22) QAD PPE', '(P025) Others', '(A010) DIRECT FOOD CONTACT', '(A020) INDIRECT FOOD CNTCT',
  '(A035) PERISHABLE', '(FA05) DRE', '(A005) CONSUMABLE', '(A006) ACCESSORIES', '(A034) PERFECT PLATES'
];

// 📊 LIVE PRODUCT GROUPS FROM SAP MATRIX (Bakery / Commissary ROH-HALB-FERT)
const productGroupOptions = [
  'Finished Product (FERT)', 'Intercompany - FG (ZFG)', 'Raw Materials (ROH)',
  'Intercompany - RM (ZRM)', 'Semifinished Product (HALB)', 'Intercompany - WIP (ZWIP)',
  'Operating Supplies (HIBE)', 'Non-Stock Material (NLAG)', 'Service Product (SERV)'
];

// 🏢 MAIN STORAGE WAREHOUSE LOCATIONS MAP (Bakery / Commissary)
const mainStorageOptions = [
  '(BKAD) BK-Admin', '(BKBL) BK-Bread Line', '(BKCA) BK-CakeAssembly', '(BKCD) BK-CakeDeco',
  '(BKCL) BK-CakeLine', '(BKCM) BK-LiquidComp', '(BKFC) BK-Fruitcake', '(BKFG) BK-Finished Good',
  '(BFGR) BK-FinishedGood', '(BKID) BK-Indirect', '(BKMA) BK-Mix A', '(BKMB) BK-Mix B',
  '(BKPM) BK-Premixes', '(BKPP) BK-SolidComp', '(BKRF) BK-RDFormulation', '(BKRM) BK-Raw Materials',
  '(BKRP) BK-Reprocess', '(BKRS) BK-RetToSupplier', '(BWSI) OWSI - Bakery', '(RDTO) RDTBK-Holding',
  '(BKDT) Bakery RDT', '(CMFG) Commi FG', '(CMID) CM Indirect', '(CMMX) Commi Premix',
  '(CMRD) Commi RM Dry', '(CMRN) Commi R&D', '(CMRO) Commi Reprocess', '(CMRP) Commi RM Prod',
  '(CMRS) Commi Returns', '(CMTR) Commi Traded', '(CMWP) CM WIP', '(CWSI) OWSI - Commi',
  '(CKHK) CMHotKitchen', '(CKMR) CKitchenMarinate', '(CKPB) KtchnPortion&Bag', '(CKPE) KtchnPreProcess',
  '(CKRE) CM Kitchen RTE', '(CKSF) CMKitchenSeafood', '(KAMB) CMKitchenAmbient', '(KRIC) CMKReachChiller',
  '(KRIF) CMKReachFreezer', '(ISC1) CM IslasChiller1', '(ISC2) CM IslasChiller2', '(ISF1) CM IslasFreezer1',
  '(ISF2) CM IslasFreezer2', '(MHAC) CM Mahogany ACRM', '(MHAM) CMMahognyAmbient', '(MNAM) CM Main Ambient',
  '(TAAC) CM Tamula ACRM', '(TAAM) CM TamulaAmbient', '(WRIC) CMWH ReachChiller', '(WRIF) CMWH ReachFreezer',
  '(QIDI) FT QADID-Inbound', '(QIDP) FT QADID-Process', '(QIDO) FT QADIDOutbound', '(QBKI) QADBK-Inbound',
  '(QBKP) QADBK-Process', '(QBPO) QADBK-Outbound', '(QCMI) QADCM-Inbound', '(QCMO) QADCM-Outbound',
  '(QCMP) QADCM-Process', 'IDTW (Indirect Tools & Wares)', 'Not Applicable'
];

// 📦 NEW STRUCTURAL DROPDOWN OPTIONS FOR (NON-FOOD & SERVICES) ITEM ENROLLMENT
const nfProductTypeOptions = [
  'Operating supplies(HIBE) - Inventory Items',
  'Non-Stock Material(NLAG) - Non Inventory Items',
  'Service Product(SERV) - Services'
];

const nfProductGroupOptions = [
  '(A001) BACKGROUND CHECKING', '(A002) BG TAKEOUT SIGNAGE', '(A003) COMPANY ID',
  '(A004) CONFECTIONERS', '(A005) CONSUMABLE', '(A006) ACCESSORIES', '(A007) BILL JACKET',
  '(A008) CUSHIONS', '(A009) DESK ACCESSORIES', '(A010) DIRECT FOOD CONTACT',
  '(A011) EDUCATIONAL MATERIAL', '(A012) ELECTRICAL', '(A013) ENGINEERING',
  '(A014) ENVELOPE & MAILERS', '(A015) ESSENTL ACCESSORIES', '(A016) EXTRAS',
  '(A017) FINANCE SUPPLIES', '(A018) FUELS', '(A019) GIFT CERTIFICATES',
  '(A020) INDIRECT FOOD CNTCT', '(A021) INK', '(A022) KITCHEN WARES', '(A023) LABELS AND TAGS',
  '(A024) LAB CONSUMABLES', '(A024) LAB CONSUMABLES', '(A025) MAGAZINE', '(A026) MEDICINE KIT', '(A027) MEMBERSHIP FEES',
  '(A028) MENU BOOK', '(A029) MONEY BAGS', '(A030) NETWORK CABLES', '(A031) OFFICE SUPPLIES',
  '(A032) PACKAGING', '(A033) PAPER PRODUCTS', '(A034) PERFECT PLATES', '(A035) PERISHABLE',
  '(A036) PEST CONTROL', '(A037) PEST CONTROL SUPP', '(A038) PRICE TAG', '(A039) PRICE TAG STICKERS',
  '(A040) R & M', '(A041) RESTROOM SIGNAGES', '(A042) SAFETY TOOL', '(A043) SMALL TOOLS',
  '(A044) STATIONERIES', '(A045) STORAGE AND PACKAGIN', '(A046) TECHNOLOGY SUPPLIES',
  '(A047) TOOLS', '(A048) UMBRELLA', '(A049) UNIFORM', '(A050) UNIFORM MANUF',
  '(A051) WRITING INSTRUMENTS', '(A052) TOY', '(A053) WRITING AND CORRECTI', '(A054) BOOK',
  '(B001) COUNTER IMAGE', '(B002) COUNTER SIGNAGE', '(B003) DINING SIGNAGES', '(B004) DISPLAY',
  '(B005) FRAMES', '(B006) GLASS TOP', '(B007) LAMP', '(B008) PLANTS', '(B009) PROPS - BOWL',
  '(B010) PROPS - FLOWERS', '(B011) PROPS - GLASS', '(B012) PROPS - LINEN', '(B013) PROPS - MUGS',
  '(B014) PROPS - OTHERS', '(B015) PROPS - PHOTOGRAPHY', '(B016) PROPS - PLATES',
  '(B017) PROPS - SAUCER', '(B018) PROPS - SURFACES', '(B019) PROPS - UTENSILS',
  '(B020) PROPS - WOODEN', '(B021) SLAT WALL IMAGE', '(B022) STOREFRONT IMAGE',
  '(B023) WALL FRAME IMAGE', '(B024) GARDEN DISPLAY', '(B025) MODIFICATION',
  '(B026) PROPS - CAKE STAND', '(B027) PROPS - JAR', '(B028) PROPS - MARBLE',
  '(B029) PROPS - RATTAN', '(B030) PROPS - STEEL', '(B031) CHIMES', '(BEV000) BEVERAGE',
  '(BEV001) BEVERAGES - COFFEE', '(BEV002) BEV - FRUIT SHAKES', '(BEV003) BEVERAGES - ICED TEA',
  '(BEV004) BEV - HOT CHOCOLATE', '(E001) CHEMICAL', '(E002) CIVIL', '(E003) CLEANING MATERIALS',
  '(E004) CLINIC MEDICINE', '(E005) CLINIC SUPPLIES', '(E006) CM-MEASURING TOOL',
  '(E007) CM-PRODUCTION TOOL', '(E008) HAZARDOUS WASTE', '(E009) HVAC', '(E010) SANITATION AND CHEM',
  '(E011) SOLID WASTE', '(E012) PERMITS AND LICENSES', '(E013) PMS', '(E014) COMPANY BENEFITS',
  '(E015) POS INTEG ADD-INS', '(E016) ALLOWANCES', '(FA01) CCTV EQUIPMENT', '(FA02) CLINIC EQUIPMENT',
  '(FA03) CM-PPE', '(FA04) CM-PRODUCTION EQPMT', '(FA05) DRE', '(FA06) FILING AND STORAGE',
  '(FA07) FIRE SAFETY EQPMT', '(FA08) COUCH', '(FA09) EQUIPMENT', '(FA10) FURNITURE',
  '(FA11) FURNITURE AND FIXTUR', '(FA12) HR SYSTEM', '(FA13) MACHINE', '(FA14) MUSIC EQUIPMENT',
  '(FA15) NETWORK EQUIPMENT', '(FA16) OFFICE EQUIPMENT', '(FA17) OFFICE FURNITURES',
  '(FA18) POS EQUIPMENT', '(FA19) PPE', '(FA20) PRODUCTION TOOL', '(FA21) PROJECTS',
  '(FA22) QAD PPE', '(FA23) SERVER EQUIPMENT', '(FA24) STAND', '(FA25) STANDING CHILLER',
  '(FA26) TECHNOLOGY INSTRUMENT', '(FA27) VAULT', '(FA28) CAPEX', '(YBFA01) Real Estate (Land)',
  '(YBFA02) Buildings', '(YBFA03) Land Improvements', '(YBFA04) Leasehold Improvement',
  '(YBFA05) Machinery Equipment', '(YBFA06) Fixtures Fittings', '(YBFA07) Vehicles',
  '(YBFA08) Computer Hardware', '(YBFA09) Computer Software', '(YBFA10) Low Value Assets',
  '(YBFA11) Other Intangibles', '(YBFA12) Office Equipment', '(YBMM00) Non-Sto Mat. w.o ID',
  '(YBMM01) Non-Sto Mat. w. ID', '(YBPM01) Spare parts', '(YBPM02) Spare parts services',
  '(P025) Others', '(P035) SUBSCRIPTIONS'
];

// 📏 SHARED GLOBAL COMPREHENSIVE UOM DATA LIST
const uomOptions = [
  'Each', 'Piece', 'SET', 'SLICE', 'Pair', 'Pack', 'Case', 'Carton', 'Crate', 'Pallet',
  'Roll', 'LOT', 'Bottle', 'Bag', 'Canister', 'Dozen', 'Gross', 'Copies', 'Gram', 'Kilogram',
  'Milligram', 'US pound', 'Ounce', 'Ton', 'US Ton', 'Kiloton', 'Liter', 'Milliliter',
  'Microliter', 'Centiliter', 'Hectoliter', 'Cubic centimeter', 'Cubic decimeter',
  'Cubic meter', 'Cubic millimeter', 'Cubic inch', 'Cubic foot', 'Cubic yard', 'US Gallon',
  'Barrels', 'Liters of Alcohol', 'Millimeter', 'Centimeter', 'Decimeter', 'Meter',
  'Kilometer', 'Inch', 'Foot', 'Yard', 'Mile', 'Micrometer', 'Nanometer', 'Milliinch',
  'Loading Meter', 'Drum', 'Percentage', 'Percentage (P1)', 'Kilobyte (2P)', 'Microliter (4G)',
  'Megabyte (4L)', 'Microfarad (40)', 'Picofarad (4T)', 'Ampere (AMP)', 'Gigaohm (A87)',
  'Acre (ACR)', 'Byte (AD)', 'Kilomol (B45)', 'Kilonewton (B47)', 'Meganewton (B73)',
  'Megohm (B75)', 'Megavolt (B78)', 'Microampere (B84)', 'Bag (BG)', 'Bar (BAR)',
  'Barrels (5A)', 'Bottle (BO)', 'Millifarad (C10)', 'Mole per Cubic Meter (C36)',
  'Mole per Liter (C38)', 'Nanoampere (C39)', 'Nanofarad (C41)', 'Cubic Centimeters per Kilogram (CCK)',
  'Cubic Centimeter (CMQ)', 'Candela (CDL)', 'Cubic Decimeter (DMQ)', 'Centimeter (CMT)',
  'Square Centimeter (CMK)', 'Case (CS)', 'Centiliter (CLT)', 'Siemens per Meter (D10)',
  'Voltampere (D46)', 'Degree (DD)', 'Decimeter (DMT)', 'Drum (DR)', 'Dozen (DZN)',
  'Gigabyte (E34)', 'Terabyte (E35)', 'Petabyte (E36)', 'Exbibyte (E59)', 'Pebibyte (E60)',
  'Tebibyte (E61)', 'Gibibyte (E62)', 'Mebibyte (E63)', 'Kibibyte (E64)', 'Each (EA)',
  'Farad (FAR)', 'Fahrenheit (FAH)', 'Foot (FOT)', 'Square Foot (FTK)', 'Cubic Foot (FTQ)',
  'Gram (GRM)', 'Gigabecquerel (GBQ)', 'Degrees Celsius (CEL)', 'Gigajoule (GV)',
  'US Gallon (GLL)', 'Gross (GRO)', 'Hectare (HAR)', 'Hectoliter (HLT)', 'Hectopascal (A97)',
  'Inch (INH)', 'Square Inch (INK)', 'Cubic Inch (INQ)', 'Joule (JOU)', 'Years (ANN)',
  'Spec. Heat Capacity (B11)', 'Kelvin (KEL)', 'Kilovolt Ampere Reactive Hour (K3)',
  'Kiloampere (B22)', 'Canister (CA)', 'Carton (CT)', 'Kilobecquerel (2Q)', 'Kilocalorie (E14)',
  'Kilogram (KGM)', 'Kilohertz (KHZ)', 'Crate (CR)', 'Kilojoule (KJO)', 'Kilometer (KMT)',
  'Square Kilometer (KMK)', 'Kiloohm (B49)', 'Kilopascal (KPA)', 'Kilovolt (KVT)',
  'Kilovoltampere (KVA)', 'Kilowatt (KWT)', 'Kilowatt Hour (KWH)', 'Liter (LTR)',
  'US Pound (LBR)', 'Activity Unit (C62)', 'Meter (MTR)', 'Square Meter (MTK)',
  '1/Square Meter (C93)', 'Cubic Meter (MTQ)', 'Milliampere (4K)', 'Millibar (MBR)',
  'Megabecquerel (4N)', 'Megajoule (3B)', 'Milligram (MGM)', 'Megawatt (MAW)', 'Megahertz (MHZ)',
  'Mile (SMI)', 'Square Mile (MIK)', 'Milliinch (77)', 'Micrometer (4H)', 'Minutes (MIN)',
  'Microsecond (B98)', 'Millijoule (C15)', 'Milliliter (MLT)', 'Millimeter (MMT)',
  'Square Millimeter (MMK)', 'Millimole (C18)', 'Cubic Millimeter (MMQ)', 'Millinewton/Meter (C22)',
  'Mole (C34)', 'Months (MON)', 'Megapascal (MPA)', 'Millipascal Seconds (C24)', 'Millisecond (C26)',
  'Millisieverts per Hour (P71)', 'Millitesla (C29)', 'Millivolt (2Z)', 'Megavoltampere (MVA)',
  'Milliwatt (C31)', 'Megawatt Hour (MWH)', 'Newton (NEW)', 'Nanometer (C45)', 'Nanosecond (C47)',
  'Specific Electrical Resistance (C60)', 'Ohm (OHM)', 'Specific Electrical Resistance (C61)',
  'Ounce (ONZ)', 'Fluid Ounce US (OZA)', 'Pascal (PAL)', 'Pair (PR)', 'Pack (PK)', 'Pallet (PF)',
  'Pascal Second (C65)', 'Parts per Billion (61)', 'Parts per Million (59)', 'Number of Persons (IE)',
  'Picosecond (H70)', 'Pint, US Liquid (PT)', 'Quart, US Liquid (QT)', 'Roll (RO)', 'Seconds (SEC)',
  'Piece (PCE)', 'Hours (HUR)', 'Sieverts per Hour (P70)', 'Sieverts per Second (P65)',
  'Days (DAY)', 'Tesla (D33)', 'Twenty-Foot Equivalent Unit (E22)', 'Thousands (MIL)',
  'Ton (TNE)', 'US Ton (STN)', 'Microsieverts per Hour (P72)', 'Volt (VLT)',
  'Microsiemens per Centimeter (G42)', 'Millimole per Liter (M33)', 'Watt (WTT)', 'Weeks (WEE)',
  'Heat Conductivity (D53)', 'Yards (YRD)', 'Square Yard (YDK)', 'Cubic Yard (YDQ)', 'LOT (LOT)'
];

const nfStorageOptions = [
  '(MGLL) MG-IntersellSL', '(MGID) MG - IndirectWH', '(MKMH) MKTG - MAHOGANY',
  '(MKMT) MKTG - MANTA', '(FETW) FTETW MainWHouse', '(FTID) FT - IndirectWH',
  '(FTLL) FT - IntersellSL', '(BETW) BMETW MainWHouse', '(BMID) BMI - IndirectWH',
  '(BMLL) BM-IntersellSL', '(ETWB) BETW-Basement', '(ETWO) BETW-Office',
  '(ETWP) FETW - B-PARKING', '(ETMH) BETW-Mahogany', '(CHR1) BETW-CHEMRoom1',
  '(CHR2) BETW-CHEMRoom2', '(ADMT) ADMIN - MANTA', '(ADMH) ADMIN-MAHOGANY',
  '(AD5F) ADMIN - 5TH FLR', '(ADJR) ADMIN - JURASSIC', '(ADTA) ADMIN-TAMULAOLD',
  '(ADDG) ADMIN - DUNGON', '(ADAT) ADMIN-ATRIUM HSE', '(ADBM) ADMIN - BASEMENT',
  '(CLNC) ADMIN - CLINIC', '(BCRA) ADMIN-Crates (B)', '(CCRA) Admin-Crates (C)',
  '(CBMH) HRCB-MAHOGANY', '(HCB5) HRCB-5TH FLR', '(HER5) HRER-5TH FLR',
  '(RCMT) HRREC-MANTA', '(LDMT) HRLD-MANTA', '(ITOF) BIT - OFFICE',
  '(IT5F) BIT - 5TH FLOOR', '(ITMH) BIT - MAHOGANY', '(FNHW) FIN - HallWay',
  '(FNSR) FIN - Stockroom', '(VDJR) VDD - Jurassic', '(VDDH) VDD - DaangHari',
  '(VDAP) VDD - Apple', '(VDAT) VDD - Atrium', '(EMSB) ENGMS - Basement',
  '(EMSJ) ENGMS - Jurassic', '(DCM1) ENGMSDieselCM1', '(DCM2) ENGMSDieselCM2',
  '(EDBK) ENGMSDieselBK', '(CSCM) ENGMS-CisternCM', '(ES5F) ENGS - 5th Floor',
  '(ESBM) ENGS - Basement', '(ESCY) ENGS - Carpentry', '(BLPG) ENGMS - BK LPG',
  '(CLPG) ENGMS - CMLPG', '(QIDI) FT QADID-Inbound', '(QIDP) FT QADID-Process',
  '(QIDO) FT QADIDOutbound', '(QBKI) QADBK-Inbound', '(QBKP) QADBK-Process',
  '(QBPO) QADBK-Outbound', '(QCMI) QADCM-Inbound', '(QCMO) QADCM-Outbound',
  '(QCMP) QADCM-Process', '(BKAD) BK-Admin', '(BKBL) BK-Bread Line',
  '(BKCA) BK-CakeAssembly', '(BKCD) BK-CakeDeco', '(BKCL) BK-CakeLine',
  '(BKCM) BK-LiquidComp', '(BKFC) BK-Fruitcake', '(BKFG) BK-Finished Good',
  '(BFGR) BK-FinishedGood', '(BKID) BK-Indirect', '(BKMA) BK-Mix A',
  '(BKMB) BK-Mix B', '(BKPM) BK-Premixes', '(BKPP) BK-SolidComp',
  '(BKRF) BK-RDFormulation', '(BKRM) BK-Raw Materials', '(BKRP) BK-Reprocess',
  '(BKRS) BK-RetToSupplier', '(BWSI) OWSI - Bakery', '(RDTO) RDTBK-Holding',
  '(BKDT) Bakery RDT', '(CMFG) Commi FG', '(CMID) CM Indirect',
  '(CMMR) Do not use', '(CMMX) Commi Premix', '(CMPB) Do not use',
  '(CMRD) Commi RM Dry', '(CMRE) Do not use', '(CMRN) Commi R&D',
  '(CMRO) Commi Reprocess', '(CMRP) Commi RM Prod', '(CMRS) Commi Returns',
  '(CMTR) Commi Traded', '(CMWP) CM WIP', '(CWSI) OWSI - Commi',
  '(CKHK) CMHotKitchen', '(CKMR) CKitchenMarinate', '(CKPB) KtchnPortion&Bag',
  '(CKPE) KtchnPreProcess', '(CKRE) CM Kitchen RTE', '(CKSF) CMKitchenSeafood',
  '(KAMB) CMKitchenAmbient', '(KRIC) CMKReachChiller', '(KRIF) CMKReachFreezer',
  '(ISC1) CM IslasChiller1', '(ISC2) CM IslasChiller2', '(ISF1) CM IslasFreezer1',
  '(ISF2) CM IslasFreezer2', '(MHAC) CM Mahogany ACRM', '(MHAM) CMMahognyAmbient',
  '(MNAM) CM Main Ambient', '(TAAC) CM Tamula ACRM', '(TAAM) CM TamulaAmbient',
  '(WRIC) CMWH ReachChiller', '(WRIF) CMWH ReachFreezer', '(IDTW) Indirect Tools & Wares',
  'Not Applicable'
];

const priorityOptions = ['Critical', 'High', 'Moderate', 'Low'];

const departmentOptions = [
  'Finance', 'Audit', 'Bakery', 'Commissary', 'R&D', 'Purchasing', 'IT',
  'Engineering SS', 'Engineering MS', 'Visual Display', 'ETW', 'Indirect',
  'Kiosk', 'Admin / PCD', 'CCD', 'Logistics', 'Supply Chain', 
  'Design and Construction', 'Marketing', 'HR', 'ML1', 'ERP Support', 
  'BOH', 'QA/RDT', 'Continuous Improvement'
];

const contactOptions = [
  'User Access / Authorization',
  'Product Master Data (Correction of Details)',
  'Supplier Master Data (Correction of Details)',
  'System Error',
  'Process Inquiry',
  'Others'
];

type TicketFormState = {
  requestor_name: string;
  requestor_email: string;
  requestor_t_number: string;
  requestor_user_id: string;
  contact_type: string;
  priority: string;
  department: string;
  short_description: string;
  description: string;
  
  request_mode: 'single' | 'bulk';

  // 📦 NON-FOOD & SERVICES DYNAMIC FORM DATA SCHEMAS
  nf_item_name: string;
  nf_product_type: string;
  nf_product_group: string;
  nf_base_uom: string;
  nf_order_uom: string;
  nf_issue_uom: string;
  nf_conversion_details: string;
  nf_total_shelf_life: string;
  nf_min_remaining_shelf_life: string;
  nf_procurement_type: string;
  nf_plant_mgfi_ho: boolean;
  nf_plant_bmi_ho: boolean;
  nf_plant_ftfi_ho: boolean;
  nf_plant_bakery: boolean;
  nf_plant_commi: boolean;
  nf_plant_mgfi_ccd: boolean;
  nf_main_storage_loc: string;
  nf_secondary_storage_loc: string;
  nf_orderable_by: string;
  nf_store_ordering_uom: string;
  nf_mos_uom: string;
  nf_mgios_item_status: string;

  // 🍞 PRODUCTION-GRADE BAKERY & MANU MASTER STATE ENGINES
  bm_is_batch_managed: string;
  bm_item_name: string;
  bm_product_type: string;
  bm_product_group: string;
  bm_base_uom: string;
  bm_order_uom: string;
  bm_issue_uom: string;
  bm_conversion_details: string;
  bm_total_shelf_life: string;
  bm_min_remaining_shelf_life: string;
  bm_procurement_type: string;
  bm_plant_bakery: boolean;
  bm_plant_commi: boolean;
  bm_main_storage_loc: string;
  bm_secondary_storage_loc: string;
  bm_mgios_warehouse_loc: string;
  bm_storage_type_ambient: boolean;
  bm_storage_type_frozen: boolean;
  bm_storage_type_chilled: boolean;
  bm_storage_type_na: boolean;
  bm_ambient_shelf_life: string;
  bm_frozen_shelf_life: string;
  bm_chilled_shelf_life: string;
  bm_sticker_remarks: string;
  bm_orderable_by: string;
  bm_store_ordering_uom: string;
  bm_mos_uom: string;
  bm_mgios_item_status: string;

  // 🤝 SUPPLIER VENDOR SPECS PROPERTIES
  spl_estimated_frequency: string;
  spl_business_name: string;
  spl_grouping: string;
  spl_search_term: string;
  spl_address: string;
  spl_withholding_tax: string;
  spl_tin: string;
  spl_payment_terms: string;
  spl_contact_number: string;
  spl_contact_person: string;
};

const initialState: TicketFormState = {
  requestor_name: '',
  requestor_email: '',
  requestor_t_number: '',
  requestor_user_id: '',
  contact_type: '',
  priority: '',
  department: '',
  short_description: '',
  description: '',
  
  request_mode: 'single',

  nf_item_name: '',
  nf_product_type: '',
  nf_product_group: '',
  nf_base_uom: '',
  nf_order_uom: '',
  nf_issue_uom: '',
  nf_conversion_details: '',
  nf_total_shelf_life: '',
  nf_min_remaining_shelf_life: '',
  nf_procurement_type: '',
  nf_plant_mgfi_ho: false,
  nf_plant_bmi_ho: false,
  nf_plant_ftfi_ho: false,
  nf_plant_bakery: false,
  nf_plant_commi: false,
  nf_plant_mgfi_ccd: false,
  nf_main_storage_loc: '',
  nf_secondary_storage_loc: '',
  nf_orderable_by: '',
  nf_store_ordering_uom: '',
  nf_mos_uom: '',
  nf_mgios_item_status: '',
  
  bm_is_batch_managed: '',
  bm_item_name: '',
  bm_product_type: '',
  bm_product_group: '',
  bm_base_uom: '',
  bm_order_uom: '',
  bm_issue_uom: '',
  bm_conversion_details: '',
  bm_total_shelf_life: '',
  bm_min_remaining_shelf_life: '',
  bm_procurement_type: '',
  bm_plant_bakery: false,
  bm_plant_commi: false,
  bm_main_storage_loc: '',
  bm_secondary_storage_loc: '',
  bm_mgios_warehouse_loc: '',
  bm_storage_type_ambient: false,
  bm_storage_type_frozen: false,
  bm_storage_type_chilled: false,
  bm_storage_type_na: false,
  bm_ambient_shelf_life: '',
  bm_frozen_shelf_life: '',
  bm_chilled_shelf_life: '',
  bm_sticker_remarks: '',
  bm_orderable_by: '',
  bm_store_ordering_uom: '',
  bm_mos_uom: '',
  bm_mgios_item_status: '',
  
  spl_estimated_frequency: '',
  spl_business_name: '',
  spl_grouping: '',
  spl_search_term: '',
  spl_address: '',
  spl_withholding_tax: '',
  spl_tin: '',
  spl_payment_terms: '',
  spl_contact_number: '',
  spl_contact_person: '',
};

export default function HomePage() {
  const [activeService, setActiveService] = useState<'landing' | 'sap' | 'non-food' | 'bakery' | 'supplier'>('landing');

  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [ticketNumber, setTicketNumber] = useState('');
  const [error, setError] = useState('');
  const [trackNumberInput, setTrackNumberInput] = useState('');
  const [trackedTicket, setTrackedTicket] = useState<any | null>(null);
  const [trackedComments, setTrackedComments] = useState<Array<{id:string; sender:string; message:string; created_at:string}>>([]);
  const [replyMessage, setReplyMessage] = useState('');
  const [trackModalOpen, setTrackModalOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  
  const [commentImage, setCommentImage] = useState<File | null>(null);
  const [isUploadingComment, setIsUploadingComment] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [isModalMaximized, setIsModalMaximized] = useState(false);

  const [verificationEmailInput, setVerificationEmailInput] = useState('');
  const [isVerifiedOwner, setIsVerifiedVerifiedOwner] = useState(false);
  const [securityGateError, setSecurityGateError] = useState('');

  const [trackingNonExistentError, setTrackingNonExistentError] = useState('');

  const instantScrollToBottom = () => {
    const container = document.getElementById('user-chat-container');
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  };

  useEffect(() => {
    if (isVerifiedOwner && trackModalOpen) {
      setTimeout(instantScrollToBottom, 30);
    }
  }, [trackedComments, isModalMaximized, isVerifiedOwner, trackModalOpen]);

  const handleChange = (field: keyof TicketFormState, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // 📱 FIXED LIFE STATE: Locks input entry explicitly at 11 numbers max
  const handlePhoneChange = (value: string) => {
    const numericValue = value.replace(/\D/g, '');
    if (numericValue.length <= 11) {
      setForm((prev) => ({ ...prev, requestor_t_number: numericValue }));
    }
  };

  // 👤 FIXED LIFE STATE: Numeric entries strictly limited to 5 digits max
  const handleUserIdChange = (value: string) => {
    const numericValue = value.replace(/\D/g, '');
    if (numericValue.length <= 5) {
      setForm((prev) => ({ ...prev, requestor_user_id: numericValue }));
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles(Array.from(e.target.files));
    } else {
      setSelectedFiles([]);
    }
  };

  const validateForm = () => {
    const requiredFields: Array<{ label: string; value: string }> = [
      { label: 'Requestor Name', value: form.requestor_name.trim() },
      { label: 'Requestor Email', value: form.requestor_email.trim() },
      { label: 'Department', value: form.department.trim() },
      { label: 'Priority', value: form.priority },
    ];

    if (activeService === 'sap') {
      requiredFields.push(
        { label: 'Type of Concern', value: form.contact_type },
        { label: 'Short Description', value: form.short_description.trim() }
      );
    } else if (activeService === 'non-food' && form.request_mode === 'single') {
      requiredFields.push(
        { label: 'General Item Name', value: form.nf_item_name.trim() },
        { label: 'Product Type', value: form.nf_product_type },
        { label: 'Product Group', value: form.nf_product_group },
        { label: 'Base Unit of Measurement', value: form.nf_base_uom },
        { label: 'Order Unit of Measure', value: form.nf_order_uom },
        { label: 'Unit Of Issue', value: form.nf_issue_uom },
        { label: 'Conversion Details', value: form.nf_conversion_details.trim() },
        { label: 'Total Shelf Life', value: form.nf_total_shelf_life.trim() },
        { label: 'Minimum Remaining Shelf life', value: form.nf_min_remaining_shelf_life.trim() },
        { label: 'Procurement Type', value: form.nf_procurement_type },
        { label: 'Main Storage Location', value: form.nf_main_storage_loc },
        { label: 'Secondary Storage Location', value: form.nf_secondary_storage_loc.trim() },
        { label: 'Orderable By / Issued To', value: form.nf_orderable_by.trim() },
        { label: 'Store Ordering UOM', value: form.nf_store_ordering_uom },
        { label: 'MOS Unit of Measure', value: form.nf_mos_uom },
        { label: 'Item Status in MGIOS', value: form.nf_mgios_item_status }
      );
    } else if (activeService === 'bakery' && form.request_mode === 'single') {
      requiredFields.push(
        { label: 'Is this Item Batch-Managed?', value: form.bm_is_batch_managed },
        { label: 'Bakery/Commi Item Name', value: form.bm_item_name.trim() },
        { label: 'Product Type', value: form.bm_product_type },
        { label: 'Product Group', value: form.bm_product_group },
        { label: 'Base Unit of Measurement', value: form.bm_base_uom },
        { label: 'Order Unit of Measure', value: form.bm_order_uom },
        { label: 'Unit Of Issue', value: form.bm_issue_uom },
        { label: 'Item Conversion Details', value: form.bm_conversion_details.trim() },
        { label: 'Total Shelf Life', value: form.bm_total_shelf_life.trim() },
        { label: 'Minimum Remaining Shelf life', value: form.bm_min_remaining_shelf_life.trim() },
        { label: 'Procurement Type', value: form.bm_procurement_type },
        { label: 'Main Storage Location', value: form.bm_main_storage_loc },
        { label: 'Secondary Storage Location', value: form.bm_secondary_storage_loc.trim() },
        { label: 'Sticker Name / Remarks', value: form.bm_sticker_remarks.trim() },
        { label: 'Item orderable by departments', value: form.bm_orderable_by.trim() },
        { label: 'Store Ordering UOM', value: form.bm_store_ordering_uom },
        { label: 'MOS Unit of Measure', value: form.bm_mos_uom },
        { label: 'Item Status in MGIOS', value: form.bm_mgios_item_status }
      );
    } else if (activeService === 'supplier') {
      requiredFields.push(
        { label: 'Estimated frequency', value: form.spl_estimated_frequency },
        { label: 'Registered Supplier Name', value: form.spl_business_name.trim() },
        { label: 'Supplier Grouping', value: form.spl_grouping },
        { label: 'Search Term Abbreviation', value: form.spl_search_term.trim() },
        { label: 'Supplier Address', value: form.spl_address.trim() },
        { label: 'Withholding Tax spec', value: form.spl_withholding_tax.trim() },
        { label: 'Supplier TIN No', value: form.spl_tin.trim() },
        { label: 'Supplier Contact number', value: form.spl_contact_number.trim() },
        { label: 'Supplier Contact Person', value: form.spl_contact_person.trim() }
      );
    }

    if ((activeService === 'non-food' || activeService === 'bakery') && form.request_mode === 'bulk') {
      if (selectedFiles.length === 0) {
        setError('Please attach the filled-out Excel Template file for bulk requests.');
        return false;
      }
    }

    const missingField = requiredFields.find((field) => !field.value);
    if (missingField) {
      setError(`Please fill in the ${missingField.label} field.`);
      return false;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(form.requestor_email.trim())) {
      setError('Please enter a valid email address.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      let finalShortDesc = form.short_description.trim();
      let finalLongDesc = form.description.trim();

      if (activeService === 'non-food') {
        if (form.request_mode === 'bulk') {
          finalShortDesc = `[BULK] Non-Food Item Enrollment Request`;
          finalLongDesc = `Request Type: Bulk Data Upload\n- Excel template file attached directly in record tracking ledger.\n\nAdditional System Notes:\n${form.description.trim()}`;
        } else {
          finalShortDesc = `[NON-FOOD Enrollment]: ${form.nf_item_name.trim()}`;
          
          const nfPlants = [
            form.nf_plant_mgfi_ho ? '01MP (MGFI HO)' : null,
            form.nf_plant_bmi_ho ? '01BP (BMI HO)' : null,
            form.nf_plant_ftfi_ho ? '01FP (FTFI HO)' : null,
            form.nf_plant_bakery ? '02BP (BMI BAKERY)' : null,
            form.nf_plant_commi ? '03BP (BMI COMMI)' : null,
            form.nf_plant_mgfi_ccd ? '01QQ (MGFI CCD)' : null
          ].filter(Boolean).join(', ');

          finalLongDesc = `NON-FOOD & SERVICES Master Data Request Details:\n` +
            `- Item Name: ${form.nf_item_name.trim()}\n` +
            `- Product Type: ${form.nf_product_type}\n` +
            `- Product Group: ${form.nf_product_group}\n` +
            `- Base UOM: ${form.nf_base_uom}\n` +
            `- Order UOM: ${form.nf_order_uom}\n` +
            `- Unit of Issue: ${form.nf_issue_uom}\n` +
            `- Conversion Details: ${form.nf_conversion_details.trim()}\n` +
            `- Total Shelf Life: ${form.nf_total_shelf_life.trim()}\n` +
            `- Min Remaining Shelf Life: ${form.nf_min_remaining_shelf_life.trim()}\n` +
            `- Procurement Type: ${form.nf_procurement_type}\n` +
            `- Target Plants: ${nfPlants || 'None Selected'}\n` +
            `- Main Storage Location: ${form.nf_main_storage_loc}\n` +
            `- Secondary Storage Location: ${form.nf_secondary_storage_loc.trim()}\n` +
            `- Orderable By / Issued To: ${form.nf_orderable_by.trim()}\n` +
            `- Store Ordering UOM: ${form.nf_store_ordering_uom}\n` +
            `- MOS Unit of Measure: ${form.nf_mos_uom}\n` +
            `- Item Status in MGIOS: ${form.nf_mgios_item_status}\n\n` +
            `Additional Remarks / Instructions:\n${form.description.trim()}`;
        }
      } else if (activeService === 'bakery') {
        if (form.request_mode === 'bulk') {
          finalShortDesc = `[BULK] Bakery & Manu Item Enrollment Request`;
          finalLongDesc = `Request Type: Bulk Data Upload\n- Excel template file attached directly in record tracking ledger.\n\nAdditional System Notes:\n${form.description.trim()}`;
        } else {
          finalShortDesc = `[MANU Item Enrollment]: ${form.bm_item_name.trim()}`;
          
          const activePlants = [
            form.bm_plant_bakery ? '02BP (BMI BAKERY)' : null,
            form.bm_plant_commi ? '03BP (BMI COMMI)' : null
          ].filter(Boolean).join(', ');

          const activeStorageTypes = [
            form.bm_storage_type_ambient ? 'Ambient' : null,
            form.bm_storage_type_frozen ? 'Frozen' : null,
            form.bm_storage_type_chilled ? 'Chilled' : null,
            form.bm_storage_type_na ? 'Not Applicable' : null
          ].filter(Boolean).join(', ');

          finalLongDesc = `MANU-Bakery/Commi Master Data Request Details:\n` +
            `- Batch Managed: ${form.bm_is_batch_managed}\n` +
            `- Item Name: ${form.bm_item_name.trim()}\n` +
            `- Product Type: ${form.bm_product_type}\n` +
            `- Product Group: ${form.bm_product_group}\n` +
            `- Base UOM: ${form.bm_base_uom}\n` +
            `- Order UOM (Purchasing): ${form.bm_order_uom}\n` +
            `- Unit of Issue: ${form.bm_issue_uom}\n` +
            `- Conversion Details: ${form.bm_conversion_details.trim()}\n` +
            `- Total Shelf Life: ${form.bm_total_shelf_life.trim()}\n` +
            `- Min Remaining Shelf Life: ${form.bm_min_remaining_shelf_life.trim()}\n` +
            `- Procurement Type: ${form.bm_procurement_type}\n` +
            `- Target Plants: ${activePlants || 'None Selected'}\n` +
            `- Main Storage Location: ${form.bm_main_storage_loc}\n` +
            `- Secondary Storage Location: ${form.bm_secondary_storage_loc.trim()}\n` +
            `- MGIOS Warehouse / Storage Location: ${form.bm_mgios_warehouse_loc.trim()}\n` +
            `- Storage Type: ${activeStorageTypes || 'None Selected'}\n` +
            `- Ambient Shelf Life: ${form.bm_ambient_shelf_life.trim()}\n` +
            `- Frozen Shelf Life: ${form.bm_frozen_shelf_life.trim()}\n` +
            `- Chilled Shelf Life: ${form.bm_chilled_shelf_life.trim()}\n` +
            `- Sticker Name / Remarks: ${form.bm_sticker_remarks.trim()}\n` +
            `- Orderable By / Issued To: ${form.bm_orderable_by.trim()}\n` +
            `- Store Ordering UOM (MGIOS): ${form.bm_store_ordering_uom}\n` +
            `- MOS Unit of Measure: ${form.bm_mos_uom}\n` +
            `- Item Status in MGIOS: ${form.bm_mgios_item_status}\n\n` +
            `Additional Remarks / Instructions:\n${form.description.trim()}`;
        }
      } else if (activeService === 'supplier') {
        finalShortDesc = `[SUPPLIER Enrollment]: ${form.spl_business_name.trim()}`;
        finalLongDesc = `New Vendor Supplier Master Ledger Registration Details:\n` +
          `- Estimated Frequency: ${form.spl_estimated_frequency}\n` +
          `- Supplier Name: ${form.spl_business_name.trim()}\n` +
          `- Supplier Grouping: ${form.spl_grouping}\n` +
          `- Search Term (Abbreviation): ${form.spl_search_term.trim()}\n` +
          `- Supplier Address: ${form.spl_address.trim()}\n` +
          `- Withholding Tax: ${form.spl_withholding_tax.trim()}\n` +
          `- Supplier TIN: ${form.spl_tin.trim()}\n` +
          `- Supplier Contact Number: ${form.spl_contact_number.trim()}\n` +
          `- Supplier Contact Person: ${form.spl_contact_person.trim()}\n\n` +
          `Additional Remarks / Instructions:\n${form.description.trim()}`;
      }

      const formData = new FormData();
      formData.append('requestor_name', form.requestor_name.trim());
      formData.append('requestor_email', form.requestor_email.trim());
      formData.append('requestor_t_number', form.requestor_t_number.trim());
      formData.append('requestor_user_id', form.requestor_user_id.trim());
      formData.append('contact_type', activeService === 'sap' ? form.contact_type : `Master Data - ${activeService.toUpperCase()}`);
      formData.append('priority', form.priority);
      formData.append('department', form.department.trim());
      formData.append('short_description', finalShortDesc);
      formData.append('description', finalLongDesc);
      
      if (selectedFiles.length > 0) {
        selectedFiles.forEach((file) => {
          formData.append('attachments', file);
        });
      }

      const response = await fetch('/api/tickets', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to create ticket.');

      setTicketNumber(data.ticket.ticket_number);
      setError(data.emailError ? `Ticket created, but email failed: ${data.emailError}` : '');
      setShowModal(true);
      setForm(initialState);
      setSelectedFiles([]); 
      setActiveService('landing'); 
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error.');
    } finally {
      setLoading(false);
    }
  };

  const handleSilentRefresh = async () => {
    if (!trackedTicket?.ticket_number) return;
    try {
      const ticketRes = await fetch(`/api/tickets?ticket_number=${encodeURIComponent(trackedTicket.ticket_number.trim())}`);
      const ticketData = await ticketRes.json();
      if (ticketRes.ok && ticketData.ticket) {
        setTrackedTicket(ticketData.ticket); 
      }

      const commentsRes = await fetch(`/api/ticket_comments?ticket_id=${trackedTicket.id}`);
      const commentsData = await commentsRes.json();
      if (commentsRes.ok && commentsData.comments) {
        setTrackedComments(commentsData.comments);
      }
    } catch (err) {
      console.debug('Background sync cycle skipped.');
    }
  };

  useEffect(() => {
    if (!trackModalOpen || !trackedTicket || !isVerifiedOwner) return;

    const livePollingInterval = setInterval(() => {
      void handleSilentRefresh();
    }, 3000); 

    return () => clearInterval(livePollingInterval);
  }, [trackModalOpen, trackedTicket, isVerifiedOwner]);

  const handlePostUserResponse = async () => {
    if (!replyMessage.trim() && !commentImage) return;
    setIsUploadingComment(true);

    try {
      let finalMessage = replyMessage.trim();

      if (commentImage) {
        const { getSupabaseClient } = await import('@/lib/supabase');
        const supabase = getSupabaseClient();
        const fileExt = commentImage.name.split('.').pop();
        const fileName = `${trackedTicket.id}-${Date.now()}.${fileExt}`;
        const filePath = `comment-attachments/${fileName}`;

        const { error: uploadError = null } = await supabase.storage
          .from('ticket-attachments')
          .upload(filePath, commentImage);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('ticket-attachments')
          .getPublicUrl(filePath);

        const uploadedImageUrl = publicUrlData.publicUrl;
        
        finalMessage = finalMessage 
          ? `${finalMessage}\n\n[Attached Screenshot Asset]: ${uploadedImageUrl}`
          : `[Attached Screenshot Asset]: ${uploadedImageUrl}`;
      }

      const res = await fetch('/api/ticket_comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticket_id: trackedTicket.id, sender: 'User', message: finalMessage }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to post message');
      
      setTrackedComments((prev) => [...prev, data.comment]);
      setReplyMessage('');
      setCommentImage(null); 
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error sending message');
    } finally {
      setIsUploadingComment(false);
    }
  };

  const handleUserKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); 
      void handlePostUserResponse(); 
    }
  };

  const handleVerifyTicketOwnership = () => {
    setSecurityGateError('');
    if (!trackedTicket) return;

    const databaseOwnerEmail = (trackedTicket.requestor_email || '').toLowerCase().trim();
    const userInputEmail = verificationEmailInput.toLowerCase().trim();

    if (userInputEmail === databaseOwnerEmail) {
      setIsVerifiedVerifiedOwner(true);
      void handleSilentRefresh(); 
    } else {
      setSecurityGateError('You are not authorized to view this ticket because you are not the original requestor.');
    }
  };

  return (
    <main className="min-h-screen bg-[#fcfcf9] p-4 lg:p-6 text-slate-800 font-sans">
      <div className="mx-auto max-w-[1650px] flex flex-col gap-5">
        
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b-4 border-[#800000] pb-3">
          <div className="flex items-center gap-4 w-full justify-between">
            <div className="flex items-center gap-3">
              <img src="/mary-grace-logo.jpeg" alt="Mary Grace Logo" className="w-28 h-24 object-contain rounded-full bg-transparent" />
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1e3f20]">MARY GRACE • ITSM OPERATIONS PORTAL</span>
                <h1 className="text-xl font-black text-[#800000] tracking-tight">IT Service Management Portal</h1>
                <p className="text-xs italic text-slate-500">What's <span className="underline font-bold text-[#800000]">SAP</span>? Mary Grace.</p>
              </div>
            </div>
            <a href="/admin" className="rounded border border-[#800000] bg-[#800000] px-4 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-[#600000] transition">
              Go to Admin Dashboard
            </a>
          </div>
        </header>

        {activeService === 'landing' ? (
          
          <section className="grid gap-6 lg:grid-cols-3 mt-2">
            <div className="lg:col-span-2 space-y-5">
              <div className="bg-white border border-slate-300 p-5 shadow-sm rounded">
                <h2 className="text-sm font-black uppercase tracking-wider text-[#800000] border-b pb-2 mb-4">Select Requested Service Stream</h2>
                
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                  
                  <button 
                    onClick={() => { setError(''); setForm(prev => ({...prev, request_mode: 'single'})); setActiveService('sap'); }}
                    className="flex flex-col text-left border border-slate-200 p-4 bg-slate-50 rounded hover:border-[#800000] hover:bg-red-50/20 transition group shadow-sm"
                  >
                    <span className="text-xl mb-1 block">🔴</span>
                    <h3 className="text-xs font-black uppercase tracking-tight text-slate-900 group-hover:text-[#800000]">SAP System Concerns</h3>
                    <p className="text-[11px] text-slate-500 font-medium mt-1 leading-snug">Report bugs, error messages, user authorizations, locks, or process workflow inquiries.</p>
                  </button>

                  <button 
                    onClick={() => { setError(''); setForm(prev => ({...prev, request_mode: 'single'})); setActiveService('non-food'); }}
                    className="flex flex-col text-left border border-slate-200 p-4 bg-slate-50 rounded hover:border-[#800000] hover:bg-red-50/20 transition group shadow-sm"
                  >
                    <span className="text-xl mb-1 block">📦</span>
                    <h3 className="text-xs font-black uppercase tracking-tight text-slate-900 group-hover:text-[#800000]">Item Enrollment (Non-Food & Services)</h3>
                    <p className="text-[11px] text-slate-500 font-medium mt-1 leading-snug">Request creation or correction of non-food materials, packaging, fixed assets, or office supply catalogs.</p>
                  </button>

                  <button 
                    onClick={() => { setError(''); setForm(prev => ({...prev, request_mode: 'single'})); setActiveService('bakery'); }}
                    className="flex flex-col text-left border border-slate-200 p-4 bg-slate-50 rounded hover:border-[#800000] hover:bg-red-50/20 transition group shadow-sm"
                  >
                    <span className="text-xl mb-1 block">🍞</span>
                    <h3 className="text-xs font-black uppercase tracking-tight text-slate-900 group-hover:text-[#800000]">Item Enrollment (MANU-Bakery/Commi)</h3>
                    <p className="text-[11px] text-slate-500 font-medium mt-1 leading-snug">Request master database profiles for commissary ingredients, recipes, or production raw materials.</p>
                  </button>

                  <button 
                    onClick={() => { setError(''); setForm(prev => ({...prev, request_mode: 'single'})); setActiveService('supplier'); }}
                    className="flex flex-col text-left border border-slate-200 p-4 bg-slate-50 rounded hover:border-[#800000] hover:bg-red-50/20 transition group shadow-sm"
                  >
                    <span className="text-xl mb-1 block">🤝</span>
                    <h3 className="text-xs font-black uppercase tracking-tight text-slate-900 group-hover:text-[#800000]">Supplier / Vendor Enrollment</h3>
                    <p className="text-[11px] text-slate-500 font-medium mt-1 leading-snug">Register or modify trade vendors, non-trade business suppliers, payment term maps, and TIN profiles.</p>
                  </button>

                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="border border-slate-300 bg-white p-5 shadow-sm rounded">
                <div className="border-b pb-1.5 mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#800000]">Track Your Ticket</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Input your unique master asset record tracking number code.</p>
                </div>
                <div className="flex flex-col gap-2 mt-2">
                  <div className="flex gap-2">
                    <input value={trackNumberInput} onChange={(e) => setTrackNumberInput(e.target.value)} placeholder="MGSAP-0000001" className="flex-1 rounded border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 outline-none focus:border-[#800000]" />
                    <button onClick={async () => {
                      if (!trackNumberInput.trim()) return;
                      try {
                        setIsVerifiedVerifiedOwner(false);
                        setVerificationEmailInput('');
                        setSecurityGateError('');
                        setTrackingNonExistentError('');

                        const res = await fetch(`/api/tickets?ticket_number=${encodeURIComponent(trackNumberInput.trim())}`);
                        const data = await res.json();
                        
                        if (!res.ok || !data.ticket || data.error) {
                          setTrackingNonExistentError('The ticket number you entered does not exist. Please check your tracking code and try again.');
                          return;
                        }

                        setTrackedTicket(data.ticket);
                        setTrackModalOpen(true);
                      } catch (err) {
                        setTrackingNonExistentError('The ticket number you entered does not exist. Please check your tracking code and try again.');
                      }
                    }} className="rounded bg-[#800000] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#600000] transition">Track</button>
                  </div>
                  {trackingNonExistentError && (
                    <p className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded text-xs font-bold leading-snug text-left">
                      ⚠️ {trackingNonExistentError}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </section>

        ) : (
          
          <section className="grid gap-6 lg:grid-cols-3 mt-2">
            <div className="lg:col-span-2 border border-slate-300 bg-white p-5 shadow-sm rounded">
              
              <div className="flex items-center justify-between border-b pb-2 mb-5">
                <button 
                  onClick={() => { setError(''); setActiveService('landing'); }}
                  className="text-xs font-black text-[#800000] border border-[#800000] rounded px-3 py-1 bg-white hover:bg-red-50/40 transition"
                >
                  ← Back to Service Dashboard
                </button>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                  Active Form: {activeService.toUpperCase()}
                </span>
              </div>

              {activeService !== 'sap' && activeService !== 'supplier' && (
                <div className="mb-5 bg-slate-50 border p-3 rounded flex items-center gap-6 text-xs font-bold text-slate-700">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Entry Scope Pattern:</span>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" checked={form.request_mode === 'single'} onChange={() => { setError(''); handleChange('request_mode', 'single'); }} className="accent-[#800000] scale-110" />
                    <span>Single Item Request</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" checked={form.request_mode === 'bulk'} onChange={() => { setError(''); handleChange('request_mode', 'bulk'); }} className="accent-[#800000] scale-110" />
                    <span className="text-purple-900">Bulk Request (Multiple Items Excel Mode)</span>
                  </label>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                  <label className="block text-xs font-bold text-slate-600">
                    <span>Requestor Name *</span>
                    <input required value={form.requestor_name} onChange={(e) => handleChange('requestor_name', e.target.value)} className="mt-1 w-full rounded border border-slate-300 bg-slate-50 px-3 py-2 text-slate-800 outline-none text-xs focus:border-[#800000]" />
                  </label>
                  <label className="block text-xs font-bold text-slate-600">
                    <span>Requestor Email *</span>
                    <input required type="email" value={form.requestor_email} onChange={(e) => handleChange('requestor_email', e.target.value)} className="mt-1 w-full rounded border border-slate-300 bg-slate-50 px-3 py-2 text-slate-800 outline-none text-xs focus:border-[#800000]" />
                  </label>
                  <label className="block text-xs font-bold text-slate-600">
                    <span>Phone / Viber Number *</span>
                    <input required inputMode="numeric" pattern="[0-9]*" value={form.requestor_t_number} onChange={(e) => handlePhoneChange(e.target.value)} className="mt-1 w-full rounded border border-slate-300 bg-slate-50 px-3 py-2 text-slate-800 outline-none text-xs focus:border-[#800000]" placeholder="Viber number for validation (Max 11 digits)" />
                  </label>
                  <label className="block text-xs font-bold text-slate-600">
                    <span>User ID</span>
                    <input inputMode="numeric" pattern="[0-9]*" value={form.requestor_user_id} onChange={(e) => handleUserIdChange(e.target.value)} className="mt-1 w-full rounded border border-slate-300 bg-slate-50 px-3 py-2 text-slate-800 outline-none text-xs focus:border-[#800000]" placeholder="Numbers only (Max 5 digits)" />
                  </label>

                  <label className="block text-xs font-bold text-slate-600">
                    <span>Department *</span>
                    <select required value={form.department} onChange={(e) => handleChange('department', e.target.value)} className="mt-1 w-full rounded border border-slate-300 bg-slate-50 px-3 py-2 text-slate-800 outline-none text-xs font-bold focus:border-[#800000]">
                      <option value="">Choose</option>
                      {departmentOptions.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </label>

                  <label className="block text-xs font-bold text-slate-600">
                    <span>Urgency Priority *</span>
                    <select required value={form.priority} onChange={(e) => handleChange('priority', e.target.value)} className="mt-1 w-full rounded border border-slate-300 bg-slate-50 px-3 py-2 text-slate-800 outline-none text-xs font-bold focus:border-[#800000]">
                      <option value="">Choose</option>
                      {priorityOptions.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="border-t pt-3 mt-2 space-y-4">
                  
                  {activeService === 'sap' && (
                    <div className="grid gap-4 grid-cols-1">
                      <label className="block text-xs font-bold text-slate-600">
                        <span>Type of Concern *</span>
                        <select required value={form.contact_type} onChange={(e) => handleChange('contact_type', e.target.value)} className="mt-1 w-full rounded border border-slate-300 bg-slate-50 px-3 py-2 text-slate-800 outline-none text-xs font-bold focus:border-[#800000]">
                          <option value="">Choose</option>
                          {contactOptions.map((option) => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      </label>
                      <label className="block text-xs font-bold text-slate-600">
                        <span>Short Description *</span>
                        <input required value={form.short_description} onChange={(e) => handleChange('short_description', e.target.value)} className="mt-1 w-full rounded border border-slate-300 bg-slate-50 px-3 py-2 text-slate-800 outline-none text-xs focus:border-[#800000]" placeholder="Brief title heading of your computer concern" />
                      </label>
                    </div>
                  )}

                  {/* 📦 FORM CASE B: THE COMPLETE PRODUCTION-GRADE NON-FOOD ITEM ENROLLMENT FORM */}
                  {activeService === 'non-food' && (
                    form.request_mode === 'single' ? (
                      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 bg-slate-50 p-5 border rounded shadow-inner space-y-1">
                        <div className="sm:col-span-2 text-xs font-black tracking-wider text-purple-900 uppercase border-b pb-1 mb-2">
                          📦 (NON-FOOD & SERVICES) Item Enrollment Specifications
                        </div>

                        <label className="block text-xs font-bold text-slate-600 sm:col-span-2">
                          <span>Item Name *</span>
                          <span className="block text-[11px] text-slate-400 font-normal normal-case mb-1">Specify the general product description. Format: General Category &gt; Specific Type &gt; Measurement (ex: POT, CLAY SMALL)</span>
                          <input required value={form.nf_item_name} onChange={(e) => handleChange('nf_item_name', e.target.value)} className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-800 outline-none text-xs focus:border-[#800000]" placeholder="ex: POT, CLAY SMALL" />
                        </label>

                        <label className="block text-xs font-bold text-slate-600 sm:col-span-2">
                          <span>Product Type *</span>
                          <select required value={form.nf_product_type} onChange={(e) => handleChange('nf_product_type', e.target.value)} className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-xs focus:border-[#800000] outline-none">
                            <option value="">Choose</option>
                            {nfProductTypeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                        </label>

                        <label className="block text-xs font-bold text-slate-600 sm:col-span-2">
                          <span>Product Group *</span>
                          <select required value={form.nf_product_group} onChange={(e) => handleChange('nf_product_group', e.target.value)} className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-xs focus:border-[#800000] outline-none">
                            <option value="">Choose</option>
                            {nfProductGroupOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                        </label>

                        <label className="block text-xs font-bold text-slate-600">
                          <span>Base Unit of Measurement (UOM) *</span>
                          <span className="block text-[10px] text-slate-400 font-normal normal-case mb-1">UOM used in stock-keeping or inventory.</span>
                          <select required value={form.nf_base_uom} onChange={(e) => handleChange('nf_base_uom', e.target.value)} className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-xs focus:border-[#800000] outline-none">
                            <option value="">Choose</option>
                            {uomOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                        </label>

                        <label className="block text-xs font-bold text-slate-600">
                          <span>Order Unit of Measure *</span>
                          <span className="block text-[10px] text-slate-400 font-normal normal-case mb-1">Order UOM used by Purchasing department.</span>
                          <select required value={form.nf_order_uom} onChange={(e) => handleChange('nf_order_uom', e.target.value)} className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-xs focus:border-[#800000] outline-none">
                            <option value="">Choose</option>
                            {uomOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                        </label>

                        <label className="block text-xs font-bold text-slate-600 sm:col-span-2">
                          <span>Unit of Issue (UOM) *</span>
                          <span className="block text-[11px] text-slate-400 font-normal normal-case mb-1">UOM used in Item Issuance to Cafe / Kiosk / Other Warehouses.</span>
                          <select required value={form.nf_issue_uom} onChange={(e) => handleChange('nf_issue_uom', e.target.value)} className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-xs focus:border-[#800000] outline-none">
                            <option value="">Choose</option>
                            {uomOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                        </label>

                        <label className="block text-xs font-bold text-slate-600 sm:col-span-2">
                          <span>Item Conversion *</span>
                          <span className="block text-[11px] text-slate-400 font-normal normal-case mb-1">If this item has an item conversion, please list them below. (If none, type "N/A")</span>
                          <input required value={form.nf_conversion_details} onChange={(e) => handleChange('nf_conversion_details', e.target.value)} className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-xs outline-none text-xs focus:border-[#800000]" placeholder="If none, type N/A" />
                        </label>

                        <label className="block text-xs font-bold text-slate-600 sm:col-span-2">
                          <span>Total Shelf Life *</span>
                          <span className="block text-[11px] text-slate-400 font-normal normal-case leading-snug mb-1">For Food Item, this field is required. For Non-Food item just type <strong>N/A</strong>. (ex: 180 days)</span>
                          <input required value={form.nf_total_shelf_life} onChange={(e) => handleChange('nf_total_shelf_life', e.target.value)} className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-xs outline-none focus:border-[#800000]" placeholder="e.g., N/A" />
                        </label>

                        <label className="block text-xs font-bold text-slate-600 sm:col-span-2">
                          <span>Minimum Remaining Shelf life *</span>
                          <span className="block text-[11px] text-slate-400 font-normal normal-case leading-snug mb-1">Minimum number of days usable before expiration. For Non-Food type <strong>N/A</strong>. (ex: 30 days)</span>
                          <input required value={form.nf_min_remaining_shelf_life} onChange={(e) => handleChange('nf_min_remaining_shelf_life', e.target.value)} className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-xs outline-none focus:border-[#800000]" placeholder="e.g., N/A" />
                        </label>

                        <label className="block text-xs font-bold text-slate-600 sm:col-span-2">
                          <span>Procurement Type *</span>
                          <select required value={form.nf_procurement_type} onChange={(e) => handleChange('nf_procurement_type', e.target.value)} className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-xs focus:border-[#800000] outline-none">
                            <option value="">Choose</option>
                            <option value="F - Procured Externally">F - Procured Externally</option>
                            <option value="E - Produced In-house">E - Produced In-house</option>
                            <option value="X - Both produce in-house and procured Externally">X - if the item can be both produce in-house and procured Externally</option>
                          </select>
                        </label>

                        <div className="block text-xs font-bold text-slate-600 sm:col-span-2 pt-2 pb-1">
                          <span>Which Plant / Warehouse will managed/maintain this item? *</span>
                          <span className="block text-[11px] text-slate-400 font-normal normal-case mb-1">Please Specify what PLANT in SAP will managed /maintain this item.</span>
                          <div className="grid grid-cols-2 gap-2 mt-2 font-medium text-slate-700 bg-white p-3 border rounded shadow-sm">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input type="checkbox" checked={form.nf_plant_mgfi_ho} onChange={(e) => handleChange('nf_plant_mgfi_ho', e.target.checked)} className="accent-[#800000]" />
                              <span>01MP (MGFI HO)</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input type="checkbox" checked={form.nf_plant_bmi_ho} onChange={(e) => handleChange('nf_plant_bmi_ho', e.target.checked)} className="accent-[#800000]" />
                              <span>01BP (BMI HO)</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input type="checkbox" checked={form.nf_plant_ftfi_ho} onChange={(e) => handleChange('nf_plant_ftfi_ho', e.target.checked)} className="accent-[#800000]" />
                              <span>01FP (FTFI HO)</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input type="checkbox" checked={form.nf_plant_bakery} onChange={(e) => handleChange('nf_plant_bakery', e.target.checked)} className="accent-[#800000]" />
                              <span>02BP (BMI BAKERY)</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input type="checkbox" checked={form.nf_plant_commi} onChange={(e) => handleChange('nf_plant_commi', e.target.checked)} className="accent-[#800000]" />
                              <span>03BP (BMI COMMI)</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input type="checkbox" checked={form.nf_plant_mgfi_ccd} onChange={(e) => handleChange('nf_plant_mgfi_ccd', e.target.checked)} className="accent-[#800000]" />
                              <span>01QQ (MGFI CCD)</span>
                            </label>
                          </div>
                        </div>

                        <label className="block text-xs font-bold text-slate-600 sm:col-span-2">
                          <span>Main Storage Location (Default Storage Location) *</span>
                          <span className="block text-[11px] text-slate-400 font-normal normal-case mb-1">Where will this item primarily be kept?</span>
                          <select required value={form.nf_main_storage_loc} onChange={(e) => handleChange('nf_main_storage_loc', e.target.value)} className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-xs focus:border-[#800000] outline-none">
                            <option value="">Choose</option>
                            {nfStorageOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                        </label>

                        <label className="block text-xs font-bold text-slate-600 sm:col-span-2">
                          <span>Secondary Storage Location *</span>
                          <span className="block text-[11px] text-slate-400 font-normal normal-case mb-1">List any other storage location. If none, input "N/A"</span>
                          <input required value={form.nf_secondary_storage_loc} onChange={(e) => handleChange('nf_secondary_storage_loc', e.target.value)} className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-800 outline-none text-xs focus:border-[#800000]" placeholder="If none, type N/A" />
                        </label>

                        <label className="block text-xs font-bold text-slate-600 sm:col-span-2">
                          <span>Item is ORDERABLE by / CAN BE ISSUED to (in MGIOS) *</span>
                          <span className="block text-[11px] text-slate-400 font-normal normal-case mb-1">Departments / sections allowed to order / receive, separated by commas. EX: FOH, BOH, Kiosk, TSD, ENG SS</span>
                          <input required value={form.nf_orderable_by} onChange={(e) => handleChange('nf_orderable_by', e.target.value)} className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-800 outline-none text-xs focus:border-[#800000]" placeholder="EX: FOH, BOH, Kiosk, TSD, ENG SS" />
                        </label>

                        <label className="block text-xs font-bold text-slate-600">
                          <span>Store Ordering UOM (for MGIOS setting) *</span>
                          <select required value={form.nf_store_ordering_uom} onChange={(e) => handleChange('nf_store_ordering_uom', e.target.value)} className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-xs focus:border-[#800000] outline-none">
                            <option value="">Choose</option>
                            {uomOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                        </label>

                        <label className="block text-xs font-bold text-slate-600">
                          <span>MOS Unit of Measure (for MOS setting) *</span>
                          <select required value={form.nf_mos_uom} onChange={(e) => handleChange('nf_mos_uom', e.target.value)} className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-xs focus:border-[#800000] outline-none">
                            <option value="">Choose</option>
                            {uomOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                        </label>

                        <label className="block text-xs font-bold text-slate-600 sm:col-span-2">
                          <span>Item Status in MGIOS *</span>
                          <span className="block text-[11px] text-slate-400 font-normal normal-case mb-1">Select the status of the Item in MGIOS</span>
                          <select required value={form.nf_mgios_item_status} onChange={(e) => handleChange('nf_mgios_item_status', e.target.value)} className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-xs focus:border-[#800000] outline-none font-bold text-blue-900">
                            <option value="">Choose</option>
                            <option value="For Activation">For Activation</option>
                            <option value="For New Enrollment">For New Enrollment</option>
                            <option value="For Details Update">For Details Update</option>
                          </select>
                        </label>
                      </div>
                    ) : (
                      /* 🛠️ INJECTED MASTER FIX: DIRECT GOOGLE SHEETS VIEW-TO-COPY LINK TO FIX DROPDOWNS */
                      <div className="p-5 bg-purple-50 border border-purple-200 rounded text-xs text-purple-950 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-purple-200 pb-2">
                          <p className="font-black uppercase tracking-wide flex items-center gap-1.5 text-[13px]">
                            <span>📊 Non-Food Master Data Mass Upload Protocol</span>
                          </p>
                          {/* Dito mo panyero i-paste ang saktong bagong link mo balang araw kung sakaling mapalitan */}
                          <a 
                            href="https://docs.google.com/spreadsheets/d/1Wau8TmFmmYvftFY1wxIpKzAotBYWYjBofS8jbdtLWsg/edit?gid=1782341623#gid=1782341623" 
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-1.5 rounded bg-purple-900 px-3 py-1.5 text-[11px] font-black text-white hover:bg-purple-950 shadow transition uppercase tracking-wider shrink-0"
                          >
                            📥 Download Google Sheets Template
                          </a>
                        </div>
                        <p className="font-medium leading-relaxed text-[11px]">Please completely open our official standardized Excel Template sheet framework using the layout selector node anchor button above, populate your multi-item asset rows fully on your system, and then **attach your completed spreadsheet file document** to the secure data loader below.</p>
                      </div>
                    )
                  )}

                  {/* 🍞 FORM CASE C: PRODUCTION-GRADE BAKERY ITEM ENROLLMENT BLOCK */}
                  {activeService === 'bakery' && (
                    form.request_mode === 'single' ? (
                      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 bg-slate-50 p-5 border rounded shadow-inner space-y-1">
                        <div className="sm:col-span-2 text-xs font-black tracking-wider text-emerald-900 uppercase border-b pb-1 mb-2">
                          🌾 MANU-Bakery / Commissary Master Entry Specifications
                        </div>
                        
                        <label className="block text-xs font-bold text-slate-600 sm:col-span-2">
                          <span className="text-[#800000]">Is this Item Batch-Managed? *</span>
                          <span className="block text-[11px] text-slate-400 font-normal normal-case mb-1">Indicate whether this item will be batch-managed in SAP.</span>
                          <select required value={form.bm_is_batch_managed} onChange={(e) => handleChange('bm_is_batch_managed', e.target.value)} className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-xs font-bold focus:border-[#800000] outline-none">
                            <option value="">Choose</option>
                            <option value="YES">YES</option>
                            <option value="NO">NO</option>
                          </select>
                        </label>

                        <label className="block text-xs font-bold text-slate-600 sm:col-span-2">
                          <span>Bakery/Commi Item Name *</span>
                          <input required value={form.bm_item_name} onChange={(e) => handleChange('bm_item_name', e.target.value)} className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-800 outline-none text-xs focus:border-[#800000]" placeholder="e.g., Premium Salted Butter" />
                        </label>

                        <label className="block text-xs font-bold text-slate-600 sm:col-span-2">
                          <span>Product Type *</span>
                          <span className="block text-[11px] text-slate-400 font-normal normal-case mb-1">Indicate the product group this item belongs to.</span>
                          <select required value={form.bm_product_type} onChange={(e) => handleChange('bm_product_type', e.target.value)} className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-xs focus:border-[#800000] outline-none">
                            <option value="">Choose</option>
                            {productTypeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                        </label>

                        <label className="block text-xs font-bold text-slate-600 sm:col-span-2">
                          <span>Product Group *</span>
                          <select required value={form.bm_product_group} onChange={(e) => handleChange('bm_product_group', e.target.value)} className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-xs focus:border-[#800000] outline-none">
                            <option value="">Choose</option>
                            {productGroupOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                        </label>

                        <label className="block text-xs font-bold text-slate-600">
                          <span>Base Unit of Measurement (UOM) *</span>
                          <span className="block text-[10px] text-slate-400 font-normal normal-case mb-1">UOM used in stock-keeping or inventory.</span>
                          <select required value={form.bm_base_uom} onChange={(e) => handleChange('bm_base_uom', e.target.value)} className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-xs focus:border-[#800000] outline-none">
                            <option value="">Choose</option>
                            {uomOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                        </label>

                        <label className="block text-xs font-bold text-slate-600">
                          <span>Order Unit of Measure (Purchasing) *</span>
                          <span className="block text-[10px] text-slate-400 font-normal normal-case mb-1">UOM used by Purchasing department.</span>
                          <select required value={form.bm_order_uom} onChange={(e) => handleChange('bm_order_uom', e.target.value)} className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-xs focus:border-[#800000] outline-none">
                            <option value="">Choose</option>
                            {uomOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                        </label>

                        <label className="block text-xs font-bold text-slate-600 sm:col-span-2">
                          <span>Unit Of Issue (UOM for Item Issuance) *</span>
                          <span className="block text-[11px] text-slate-400 font-normal normal-case mb-1">UOM used in Item Issuance to Cafe / Kiosk / warehouses.</span>
                          <select required value={form.bm_issue_uom} onChange={(e) => handleChange('bm_issue_uom', e.target.value)} className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-xs focus:border-[#800000] outline-none">
                            <option value="">Choose</option>
                            {uomOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                        </label>

                        <label className="block text-xs font-bold text-slate-600 sm:col-span-2">
                          <span>Item Conversion List *</span>
                          <span className="block text-[11px] text-slate-400 font-normal normal-case mb-1">If this item has an item conversion, list them below. (If none, type "N/A")</span>
                          <input required value={form.bm_conversion_details} onChange={(e) => handleChange('bm_conversion_details', e.target.value)} className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-xs outline-none focus:border-[#800000]" placeholder="e.g. 1 Case = 24 Pieces" />
                        </label>

                        <label className="block text-xs font-bold text-slate-600 sm:col-span-2">
                          <span>Total Shelf Life *</span>
                          <span className="block text-[11px] text-slate-400 font-normal normal-case leading-snug mb-1">For Food Item, this field is required. For Non-Food type <strong>N/A</strong>. Specify day, week, month, or year. (ex: 180 days)</span>
                          <input required value={form.bm_total_shelf_life} onChange={(e) => handleChange('bm_total_shelf_life', e.target.value)} className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-xs outline-none focus:border-[#800000]" placeholder="e.g., 180 days" />
                        </label>

                        <label className="block text-xs font-bold text-slate-600 sm:col-span-2">
                          <span>Minimum Remaining Shelf life *</span>
                          <span className="block text-[11px] text-slate-400 font-normal normal-case leading-snug mb-1">Minimum number of days unusable before expiration for acceptance. For Non-Food type <strong>N/A</strong>. (ex: 30 days)</span>
                          <input required value={form.bm_min_remaining_shelf_life} onChange={(e) => handleChange('bm_min_remaining_shelf_life', e.target.value)} className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-xs outline-none focus:border-[#800000]" placeholder="e.g., 30 days" />
                        </label>

                        <label className="block text-xs font-bold text-slate-600 sm:col-span-2">
                          <span>Procurement Type *</span>
                          <select required value={form.bm_procurement_type} onChange={(e) => handleChange('bm_procurement_type', e.target.value)} className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-xs focus:border-[#800000] outline-none">
                            <option value="">Choose</option>
                            <option value="F - Procured Externally">F - Procured Externally</option>
                            <option value="E - Produced In-house">E - Produced In-house</option>
                            <option value="X - Both produce in-house and procured Externally">X - if the item can be both produce in-house and procured Externally</option>
                          </select>
                        </label>

                        <div className="block text-xs font-bold text-slate-600 sm:col-span-2 pt-2 pb-1">
                          <span>Which Plant / Warehouse will managed/maintain this item? *</span>
                          <div className="flex flex-col gap-2 mt-2 font-medium text-slate-700 bg-white p-3 border rounded shadow-sm">
                            <label className="flex items-center gap-2.5 cursor-pointer">
                              <input type="checkbox" checked={form.bm_plant_bakery} onChange={(e) => handleChange('bm_plant_bakery', e.target.checked)} className="accent-[#800000] scale-110" />
                              <span>02BP (BMI BAKERY)</span>
                            </label>
                            <label className="flex items-center gap-2.5 cursor-pointer">
                              <input type="checkbox" checked={form.bm_plant_commi} onChange={(e) => handleChange('bm_plant_commi', e.target.checked)} className="accent-[#800000] scale-110" />
                              <span>03BP (BMI COMMI)</span>
                            </label>
                          </div>
                        </div>

                        <label className="block text-xs font-bold text-slate-600 sm:col-span-2">
                          <span>Main Storage Location (Default Storage Location) *</span>
                          <span className="block text-[11px] text-slate-400 font-normal normal-case mb-1">Where will this item primarily be kept?</span>
                          <select required value={form.bm_main_storage_loc} onChange={(e) => handleChange('bm_main_storage_loc', e.target.value)} className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-xs focus:border-[#800000] outline-none">
                            <option value="">Choose</option>
                            {mainStorageOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                        </label>

                        <label className="block text-xs font-bold text-slate-600 sm:col-span-2">
                          <span>Secondary Storage Location *</span>
                          <span className="block text-[11px] text-slate-400 font-normal normal-case mb-1">List other locations. If none, input "N/A"</span>
                          <input required value={form.bm_secondary_storage_loc} onChange={(e) => handleChange('bm_secondary_storage_loc', e.target.value)} className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-xs outline-none focus:border-[#800000]" placeholder="If none, type N/A" />
                        </label>

                        <label className="block text-xs font-bold text-slate-600 sm:col-span-2">
                          <span>MGIOS Warehouse / Storage Location</span>
                          <span className="block text-[11px] text-slate-400 font-normal normal-case mb-1">(ex: Dispatch Cakes, Dispatch breads, BK Raw Mats, etc)</span>
                          <input value={form.bm_mgios_warehouse_loc} onChange={(e) => handleChange('bm_mgios_warehouse_loc', e.target.value)} className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-xs outline-none focus:border-[#800000]" />
                        </label>

                        <div className="block text-xs font-bold text-slate-600 sm:col-span-2 pt-2">
                          <span>STORAGE TYPE *</span>
                          <span className="block text-[11px] text-slate-400 font-normal normal-case mb-1">Specify type of storage (Chilled / Frozen / Ambient)</span>
                          <div className="grid grid-cols-2 gap-2 font-medium text-slate-700 bg-white p-3 border rounded shadow-sm mt-1">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input type="checkbox" checked={form.bm_storage_type_ambient} onChange={(e) => handleChange('bm_storage_type_ambient', e.target.checked)} className="accent-[#800000]" />
                              <span>Ambient</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input type="checkbox" checked={form.bm_storage_type_frozen} onChange={(e) => handleChange('bm_storage_type_frozen', e.target.checked)} className="accent-[#800000]" />
                              <span>Frozen</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input type="checkbox" checked={form.bm_storage_type_chilled} onChange={(e) => handleChange('bm_storage_type_chilled', e.target.checked)} className="accent-[#800000]" />
                              <span>Chilled</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input type="checkbox" checked={form.bm_storage_type_na} onChange={(e) => handleChange('bm_storage_type_na', e.target.checked)} className="accent-[#800000]" />
                              <span>Not Applicable</span>
                            </label>
                          </div>
                        </div>

                        <label className="block text-xs font-bold text-slate-600 sm:col-span-2">
                          <span>AMBIENT SHELF LIFE *</span>
                          <span className="block text-[11px] text-slate-400 font-normal normal-case leading-snug mb-1">For Bakery and Commi Items in Manufacturing Operations System (MOS). Put <strong>N/A</strong> if not applicable.</span>
                          <input required value={form.bm_ambient_shelf_life} onChange={(e) => handleChange('bm_ambient_shelf_life', e.target.value)} className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-xs outline-none focus:border-[#800000]" placeholder="If not applicable, type N/A" />
                        </label>

                        <label className="block text-xs font-bold text-slate-600 sm:col-span-2">
                          <span>FROZEN SHELF LIFE *</span>
                          <span className="block text-[11px] text-slate-400 font-normal normal-case leading-snug mb-1">For Bakery and Commi Items in Manufacturing Operations System (MOS). Put <strong>N/A</strong> if not applicable.</span>
                          <input required value={form.bm_frozen_shelf_life} onChange={(e) => handleChange('bm_frozen_shelf_life', e.target.value)} className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-xs outline-none focus:border-[#800000]" placeholder="If not applicable, type N/A" />
                        </label>

                        <label className="block text-xs font-bold text-slate-600 sm:col-span-2">
                          <span>CHILLED SHELF LIFE *</span>
                          <span className="block text-[11px] text-slate-400 font-normal normal-case leading-snug mb-1">For Bakery and Commi Items in Manufacturing Operations System (MOS). Put <strong>N/A</strong> if not applicable.</span>
                          <input required value={form.bm_chilled_shelf_life} onChange={(e) => handleChange('bm_chilled_shelf_life', e.target.value)} className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-xs outline-none focus:border-[#800000]" placeholder="If not applicable, type N/A" />
                        </label>

                        <label className="block text-xs font-bold text-slate-600 sm:col-span-2">
                          <span>Sticker Name / Remarks (For Bakery FG and Commi Items) *</span>
                          <span className="block text-[11px] text-slate-400 font-normal normal-case mb-1">Please put <strong>N/A</strong> if Not Applicable</span>
                          <input required value={form.bm_sticker_remarks} onChange={(e) => handleChange('bm_sticker_remarks', e.target.value)} className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-800 outline-none text-xs focus:border-[#800000]" />
                        </label>

                        <label className="block text-xs font-bold text-slate-600 sm:col-span-2">
                          <span>Item is ORDERABLE by / CAN BE ISSUED to (in MGIOS) *</span>
                          <span className="block text-[11px] text-slate-400 font-normal normal-case mb-1">Departments allowed to order / receive. EX: FOH, BOH, Kiosk, COMMI R&D, BK-Supply Planner, etc.</span>
                          <input required value={form.bm_orderable_by} onChange={(e) => handleChange('bm_orderable_by', e.target.value)} className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-xs outline-none focus:border-[#800000]" placeholder="EX: FOH, BOH, Kiosk" />
                        </label>

                        <label className="block text-xs font-bold text-slate-600">
                          <span>Store Ordering UOM (for MGIOS setting) *</span>
                          <span className="block text-[10px] text-slate-400 font-normal normal-case mb-1">UOM used by store (Cafe/Kiosk) when ordering.</span>
                          <select required value={form.bm_store_ordering_uom} onChange={(e) => handleChange('bm_store_ordering_uom', e.target.value)} className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-xs focus:border-[#800000] outline-none">
                            <option value="">Choose</option>
                            {uomOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                        </label>

                        <label className="block text-xs font-bold text-slate-600">
                          <span>MOS Unit of Measure (for MOS setting) *</span>
                          <span className="block text-[10px] text-slate-400 font-normal normal-case mb-1">UOM used by production layout settings in MOS.</span>
                          <select required value={form.bm_mos_uom} onChange={(e) => handleChange('bm_mos_uom', e.target.value)} className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-xs focus:border-[#800000] outline-none">
                            <option value="">Choose</option>
                            {uomOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                        </label>

                        <label className="block text-xs font-bold text-slate-600 sm:col-span-2">
                          <span>Item Status in MGIOS *</span>
                          <span className="block text-[11px] text-slate-400 font-normal normal-case mb-1">Select status of Item in MGIOS</span>
                          <select required value={form.bm_mgios_item_status} onChange={(e) => handleChange('bm_mgios_item_status', e.target.value)} className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-xs focus:border-[#800000] outline-none font-bold text-blue-900">
                            <option value="">Choose</option>
                            <option value="For Activation">For Activation</option>
                            <option value="For New Enrollment">For New Enrollment</option>
                            <option value="For Details Update">For Details Update</option>
                          </select>
                        </label>
                      </div>
                    ) : (
                      /* 🛠️ INJECTED MASTER FIX: DIRECT GOOGLE SHEETS VIEW-TO-COPY LINK TO FIX DROPDOWNS */
                      <div className="p-5 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-950 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-emerald-200 pb-2">
                          <p className="font-black uppercase tracking-wide flex items-center gap-1.5 text-[13px]">
                            <span>🌾 Commissary Production Mass Upload Protocol</span>
                          </p>
                          {/* Dito mo panyero i-paste ang saktong bagong link mo balang araw kung sakaling mapalitan */}
                          <a 
                            href="https://docs.google.com/spreadsheets/d/1Z2YkUx38FMhuqsCdthKAK-gc5ayVMI6PMgYKDF2uApo/edit?gid=1166146710#gid=1166146710" 
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-1.5 rounded bg-emerald-900 px-3 py-1.5 text-[11px] font-black text-white hover:bg-emerald-950 shadow transition uppercase tracking-wider shrink-0"
                          >
                            📥 Download Google Sheets Template
                          </a>
                        </div>
                        <p className="font-medium leading-relaxed text-[11px]">Please completely open our official standardized Manufacturing Bulk Spreadsheet framework template using the button node selector anchor above, aggregate your warehouse ledger ingredients, and upload the completed sheet file container layout to the system loader area below.</p>
                      </div>
                    )
                  )}

                  {/* 🤝 FORM CASE D: THE COMPLETE PRODUCTION-GRADE SUPPLIER ENROLLMENT FORM */}
                  {activeService === 'supplier' && (
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 bg-slate-50 p-5 border rounded shadow-inner space-y-1">
                      <div className="sm:col-span-2 text-xs font-black tracking-wider text-blue-900 uppercase border-b pb-1 mb-2">
                        🤝 New Vendor Supplier Master Ledger Registration Specifications
                      </div>

                      <div className="block text-xs font-bold text-slate-600 sm:col-span-2">
                        <span>Estimated frequency *</span>
                        <span className="block text-[11px] text-slate-400 font-normal normal-case mb-1">How frequent are we going to transact with this supplier?</span>
                        <div className="flex flex-col gap-2 font-medium text-slate-700 bg-white p-3 border rounded shadow-sm mt-1">
                          {['Once a WEEK', 'Once/Twice a MONTH', 'Once a YEAR', 'Only this time'].map((opt) => (
                            <label key={opt} className="flex items-center gap-2.5 cursor-pointer">
                              <input type="radio" name="spl_frequency" checked={form.spl_estimated_frequency === opt} onChange={() => handleChange('spl_estimated_frequency', opt)} className="accent-[#800000] scale-110" />
                              <span>{opt}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <label className="block text-xs font-bold text-slate-600 sm:col-span-2">
                        <span>Supplier Name *</span>
                        <span className="block text-[11px] text-slate-400 font-normal normal-case mb-1">Indicate the Name of the supplier</span>
                        <input required value={form.spl_business_name} onChange={(e) => handleChange('spl_business_name', e.target.value)} className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-800 outline-none text-xs focus:border-[#800000]" placeholder="e.g., Mary Grace Logistics Inc." />
                      </label>

                      <label className="block text-xs font-bold text-slate-600 sm:col-span-2">
                        <span>Supplier Grouping *</span>
                        <span className="block text-[11px] text-slate-400 font-normal normal-case mb-1">Indicate whether the supplier is for Direct or Indirect</span>
                        <select required value={form.spl_grouping} onChange={(e) => handleChange('spl_grouping', e.target.value)} className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-xs focus:border-[#800000] outline-none font-bold text-blue-900">
                          <option value="">Choose</option>
                          <option value="INDIRECT">INDIRECT</option>
                          <option value="DIRECT">DIRECT</option>
                        </select>
                      </label>

                      <label className="block text-xs font-bold text-slate-600 sm:col-span-2">
                        <span>Search Term (Abbreviation) *</span>
                        <span className="block text-[11px] text-slate-400 font-normal normal-case mb-1">Indicate the term that will be used when searching the supplier</span>
                        <input required value={form.spl_search_term} onChange={(e) => handleChange('spl_search_term', e.target.value)} className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-800 outline-none text-xs focus:border-[#800000]" />
                      </label>

                      <label className="block text-xs font-bold text-slate-600 sm:col-span-2">
                        <span>Supplier Address *</span>
                        <span className="block text-[11px] text-slate-400 font-normal normal-case mb-1">Number, Street, City, Postal ID</span>
                        <input required value={form.spl_address} onChange={(e) => handleChange('spl_address', e.target.value)} className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-800 outline-none text-xs focus:border-[#800000]" placeholder="Number, Street, City, Postal ID" />
                      </label>

                      <label className="block text-xs font-bold text-slate-600 sm:col-span-2">
                        <span>Withholding Tax *</span>
                        <span className="block text-[11px] text-slate-400 font-normal normal-case mb-1">If the supplier is subject to withholding tax, please indicate the type. Put N/A if not applicable</span>
                        <input required value={form.spl_withholding_tax} onChange={(e) => handleChange('spl_withholding_tax', e.target.value)} className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-800 outline-none text-xs focus:border-[#800000]" placeholder="If not applicable, type N/A" />
                      </label>

                      <label className="block text-xs font-bold text-slate-600 sm:col-span-2">
                        <span>Supplier TIN *</span>
                        <input required value={form.spl_tin} onChange={(e) => handleChange('spl_tin', e.target.value)} className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-xs outline-none focus:border-[#800000]" placeholder="e.g., 000-123-456-00000" />
                      </label>

                      <label className="block text-xs font-bold text-slate-600 sm:col-span-2">
                        <span>Supplier Contact number *</span>
                        <input required value={form.spl_contact_number} onChange={(e) => handleChange('spl_contact_number', e.target.value)} className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-xs outline-none focus:border-[#800000]" placeholder="Company contact number" />
                      </label>

                      <label className="block text-xs font-bold text-slate-600 sm:col-span-2">
                        <span>Supplier Contact Person *</span>
                        <input required value={form.spl_contact_person} onChange={(e) => handleChange('spl_contact_person', e.target.value)} className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-xs outline-none focus:border-[#800000]" placeholder="Full name of contact person" />
                      </label>
                    </div>
                  )}

                </div>

                <div className="grid gap-4 mt-2">
                  <label className="block text-xs font-bold text-slate-600">
                    <span>
                      {form.request_mode === 'bulk' 
                        ? 'Attach Filled Excel Template File * (Required for Bulk Requests)' 
                        : 'Screenshots / Accreditation Document Attachments (Multiple Allowed)'}
                    </span>
                    <input 
                      type="file" 
                      name="attachments" 
                      accept={form.request_mode === 'bulk' ? '.xlsx,.xls,.csv' : 'image/*,application/pdf'} 
                      multiple={form.request_mode !== 'bulk'} 
                      onChange={handleFileChange} 
                      className="mt-1 w-full border border-dashed border-slate-400 bg-slate-50 px-3 py-2 text-xs text-slate-500 file:mr-3 file:rounded file:border-0 file:bg-red-50 file:px-3 file:py-1 file:text-xs file:font-bold file:text-[#800000]" 
                    />
                    {selectedFiles.length > 0 && (
                      <div className="mt-2 text-[11px] font-bold text-blue-900">
                        Selected files ({selectedFiles.length}):
                        <ul className="list-disc list-inside mt-1 font-normal text-slate-600 space-y-0.5">
                          {selectedFiles.map((file, idx) => <li key={idx}>{file.name}</li>)}
                        </ul>
                      </div>
                    )}
                  </label>

                  <label className="block text-xs font-bold text-slate-600">
                    <span>Extended Long Description Notes / Remarks / Supplementary Data</span>
                    <textarea rows={4} value={form.description} onChange={(e) => handleChange('description', e.target.value)} className="mt-1 w-full rounded border border-slate-300 bg-slate-50 px-3 py-2 text-slate-800 outline-none text-xs focus:border-[#800000]" placeholder="Add any supplementary remarks or structural system notes here..." />
                  </label>
                </div>

                {error && <p className="text-xs font-bold text-red-600">{error}</p>}

                <button type="submit" disabled={loading} className="w-full bg-[#800000] rounded py-2 text-xs font-black text-white uppercase tracking-wider shadow-sm hover:bg-[#600000] disabled:opacity-50 transition">
                  {loading ? 'Processing Submission...' : 'Submit Operation Request Ticket'}
                </button>
              </form>

            </div>

            <div className="flex flex-col gap-4">
              <div className="border border-slate-300 bg-white p-5 shadow-sm rounded">
                <div className="border-b pb-1.5 mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#800000]">Triage Instructions</h3>
                </div>
                <ul className="text-xs text-slate-600 space-y-3 list-decimal list-inside font-medium">
                  <li>Your request will immediately route into the automated master data control logs.</li>
                  <li>Ensure all registered parameters match the physical procurement datasheets perfectly.</li>
                  <li>You can track state workflows live in real-time by entering your code inside the service catalog landing dashboard.</li>
                </ul>
              </div>
            </div>
          </section>
        )}

      </div>

      {trackModalOpen && trackedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <div className={`border border-slate-400 bg-white p-5 shadow-xl overflow-y-auto transition-all duration-300 flex flex-col justify-between
            ${isModalMaximized ? 'w-[98vw] h-[96vh] max-h-[96vh]' : 'w-full max-w-2xl max-h-[90vh]'}`}
          >
            <div className="flex items-start justify-between border-b-2 border-[#800000] pb-3 shrink-0">
              <div>
                <h3 className="text-lg font-black text-[#800000]">Ticket {trackedTicket.ticket_number}</h3>
                <div className="mt-1 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs">
                  <p className="text-slate-500 font-bold">Status: 
                    <span className={`ml-1.5 inline-block rounded px-2 py-0.5 text-[10px] font-black uppercase tracking-wide
                      ${trackedTicket.status === 'Closed' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-800'}`}>
                      {trackedTicket.status}
                    </span>
                  </p>
                  {trackedTicket.status === 'Completed' && isVerifiedOwner && (
                    <button
                     onClick={async () => {
  if (!confirm('Are you sure you want to re-open this incident ticket? This will change the status back to Work in Progress.')) return;
  try {
    const res = await fetch('/api/tickets', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        id: trackedTicket.id, 
        status: 'Work in Progress', 
        is_reopen: true, 
        // 🎯 INJECTED FLAG: Ipinapasa ang requestor identity kasama ang pangalan para sa dynamic status history audit log
        reopened_by: `User (${trackedTicket.requestor_name || 'Client'})` 
      }),
    });
    if (!res.ok) throw new Error('Failed to re-open');
    setTrackedTicket((prev: any) => ({ ...prev, status: 'Work in Progress' }));
    alert('Ticket has been successfully re-opened.');
  } catch (err) {
    alert('Error re-opening ticket');
  }
}}
                      className="rounded bg-amber-500 px-2 py-0.5 text-[10px] font-black text-white hover:bg-amber-600 transition"
                    >
                      ⚠️ Re-open Ticket
                    </button>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                {isVerifiedOwner && (
                  <button 
                    onClick={() => setIsModalMaximized(!isModalMaximized)}
                    title={isModalMaximized ? "Minimize Window" : "Maximize Window"}
                    className="rounded border border-slate-300 bg-slate-50 px-3 py-1 text-xs font-black text-slate-600 hover:bg-slate-200 transition"
                  >
                    {isModalMaximized ? '🗕' : '🗖'}
                  </button>
                )}
                <button 
                  onClick={() => {
                    setTrackModalOpen(false);
                    setIsModalMaximized(false);
                    setIsVerifiedVerifiedOwner(false);
                  }} 
                  className="rounded border border-slate-300 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700 hover:bg-slate-100"
                >
                  Close
                </button>
              </div>
            </div>

            {!isVerifiedOwner ? (
              <div className="my-auto py-10 max-w-md mx-auto w-full text-center space-y-4 font-sans">
                <div className="text-4xl">🔒</div>
                <div>
                  <h4 className="text-sm font-black text-slate-800 uppercase tracking-wide">Verification Identity Lock</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-tight">To ensure you are the authorized owner, please enter the email address associated with this ticket log profile.</p>
                </div>

                <div className="space-y-2 text-xs font-semibold">
                  <input 
                    type="email"
                    value={verificationEmailInput}
                    onChange={(e) => setVerificationEmailInput(e.target.value)}
                    placeholder="Enter your requestor email address..."
                    className="w-full rounded border border-slate-300 p-2.5 outline-none font-medium text-center focus:border-[#800000] bg-slate-50 text-slate-800"
                  />
                  
                  {securityGateError && (
                    <p className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded font-bold leading-snug text-left">
                      ⚠️ {securityGateError}
                    </p>
                  )}

                  <button
                    onClick={handleVerifyTicketOwnership}
                    className="w-full bg-[#800000] text-white font-black py-2 rounded shadow-sm hover:bg-[#600000] transition uppercase tracking-wider"
                  >
                    Verify Ticket Ownership
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-4 space-y-4 overflow-y-auto flex-1 pr-1">
                <div className="bg-slate-50 p-3 border border-slate-200 text-xs rounded">
                  <span className="font-bold text-blue-900 block uppercase tracking-wide mb-1">Incident Summary</span>
                  <p className="font-semibold text-slate-800">{trackedTicket.short_description}</p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                      <span>Conversation Thread</span>
                      <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                    </h4>
                    <span className="text-[10px] font-bold text-slate-400 italic">⚡ Live Radar Active</span>
                  </div>
                  
                  <div 
                    id="user-chat-container"
                    className={`space-y-4 overflow-y-auto border p-4 bg-slate-50 rounded shadow-inner font-sans transition-all duration-200
                    ${isModalMaximized ? 'max-h-[500px]' : 'max-h-56'}`}
                  >
                    {trackedComments.length === 0 ? (
                      <div className="text-xs text-slate-400 italic text-center py-4">No historical messages populated inside thread view.</div>
                    ) : (
                      trackedComments.map((c) => {
                        // 🕵️ SYSTEM LOG DETECTOR RULE
                        const isSystemLog = c.message.startsWith('[SYSTEM LOG]:') || c.message.startsWith('[RESOLUTION NOTICE BY');
                        const isUser = c.sender === 'User';
                        
                        // ⚙️ SYSTEM AUTO TRACKING AUDIT STYLE: NAKAGITNA, OFF-BLACK (text-slate-600), ITALIC, MALIIT ANG FONT SIZE AT KASAMA ANG DATE AT TIME!
                        if (isSystemLog) {
                          return (
                            <div key={c.id} className="w-full flex flex-col items-center justify-center my-2.5 py-1.5 border-y border-slate-200/40 bg-slate-100/40 rounded animate-fadeIn">
                              <p className="text-[10px] text-slate-600 italic font-semibold tracking-wide text-center leading-normal whitespace-pre-wrap max-w-[85%]">
                                {c.message.startsWith('[SYSTEM LOG]:') 
                                  ? c.message.replace('[SYSTEM LOG]:', '⚙️ System Log:') 
                                  : c.message}
                              </p>
                              <span className="text-[9px] text-slate-400 font-mono mt-0.5 font-bold uppercase tracking-tighter">
                                {new Date(c.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                              </span>
                            </div>
                          );
                        }

                        // 💬 STANDARD CHAT LAYOUT SHEET: PARA SA MGA NORMAL NA USUSAN NI ADMIN AT USER
                        return (
                          <div key={c.id} className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white shadow-sm shrink-0
                              ${isUser ? 'bg-[#1e3f20]' : 'bg-[#800000]'}`}
                            >
                              {isUser ? 'US' : 'AD'}
                            </div>

                            <div className={`flex flex-col max-w-[75%] gap-1 ${isUser ? 'items-end' : 'items-start'}`}>
                              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 px-1">
                                <span className="text-slate-700">{isUser ? 'You (Client)' : 'Mary Grace Helpdesk'}</span>
                                <span>•</span>
                                <span>{new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>

                              <div className={`rounded-2xl px-4 py-2.5 text-xs font-medium whitespace-pre-wrap leading-relaxed shadow-sm
                                ${isUser 
                                  ? 'bg-blue-600 text-white rounded-tr-none' 
                                  : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                                }`}
                              >
                                {c.message.includes('[Attached Screenshot Asset]:') ? (
                                  <>
                                    <p>{c.message.split('[Attached Screenshot Asset]:')[0].trim()}</p>
                                    <div className="mt-2 max-w-xs border rounded overflow-hidden p-1 bg-slate-50 shadow-inner">
                                      <img 
                                        src={c.message.split('[Attached Screenshot Asset]:')[1].trim()} 
                                        alt="Comment Attachment Preview" 
                                        className="max-h-40 w-full object-contain cursor-zoom-in"
                                        onClick={() => window.open(c.message.split('[Attached Screenshot Asset]:')[1].trim(), '_blank')}
                                      />
                                    </div>
                                  </>
                                ) : (
                                  c.message
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                  )}
                  </div>
                </div>

                {/* FIKSERADO PROPERTY STATE BIND: KONEKTADO NA NANG TAMA KAY trackedTicket (HINDI TICKET) */}
                <div className="border-t pt-3 shrink-0">
                  {trackedTicket.status !== 'Closed' ? (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">Reply Message</label>
                        <textarea 
                          value={replyMessage} 
                          onChange={(e) => setReplyMessage(e.target.value)} 
                          onKeyDown={handleUserKeyDown}
                          rows={3} 
                          className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:border-[#800000]" 
                          placeholder="Type updates... (Press Enter to send, Shift+Enter for new line)" 
                        />
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50 p-2 border border-slate-200 rounded">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                          <span className="text-[10px] uppercase font-bold text-slate-400">Add Screen Error:</span>
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={(e) => setCommentImage(e.target.files?.[0] || null)}
                            className="text-[11px] text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-bold file:bg-slate-200 file:text-slate-700 hover:file:bg-slate-300 transition"
                          />
                        </div>
                      </div>

                      <div className="flex gap-2 justify-end">
                        <button 
                          onClick={handlePostUserResponse}
                          disabled={isUploadingComment}
                          className="rounded bg-[#800000] px-4 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-[#600000] transition disabled:opacity-50"
                        >
                          {isUploadingComment ? 'Processing & Uploading...' : 'Send Response'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded bg-red-50 border border-red-100 p-3 text-xs text-red-800 font-bold italic text-center">
                      🔒 This incident file has been verified and permanently closed. Communication stream is locked.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <div className="w-full max-w-md border border-slate-400 bg-white p-5 shadow-2xl text-center">
            <h3 className="text-lg font-black text-[#800000] uppercase tracking-wide">Incident Successfully Logged</h3>
            <p className="text-xs text-slate-500 mt-1">Your infrastructure tracking file has been initialized.</p>
            <div className="my-4 border border-red-200 bg-red-50/50 p-4 rounded">
              <p className="text-[10px] font-bold text-slate-400 uppercase">System Generated Number</p>
              <p className="text-2xl font-black text-[#800000] tracking-tight mt-1">{ticketNumber}</p>
            </div>
            <button onClick={() => setShowModal(false)} className="w-full rounded bg-[#800000] py-2 text-xs font-bold text-white tracking-wider uppercase hover:bg-[#600000]">
              Acknowledge & Close
            </button>
          </div>
        </div>
      )}

    </main>
  );
}