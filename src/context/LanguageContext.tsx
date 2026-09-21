'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'ta';

export const translations = {
  common: {
    appName: { en: 'Srivari Community Fund', ta: 'ஸ்ரீவாரி சமுதாய நிதி' },
    templeNameTa: { en: 'அருள்மிகு ஸ்ரீதேவி பூதேவி ஸ்ரீ வரதராஜ பெருமாள் ஆலயம்', ta: 'அருள்மிகு ஸ்ரீதேவி பூதேவி ஸ்ரீ வரதராஜ பெருமாள் ஆலயம்' },
    templeNameEn: { en: 'Arulmigu Shridevi Poodevi Shri Varatharaja Perumal Alayam', ta: 'அருள்மிகு ஸ்ரீதேவி பூதேவி ஸ்ரீ வரதராஜ பெருமாள் ஆலயம்' },
    templeSub: { en: 'Temple Trust • Community Seva & Devotees Fund', ta: 'திருக்கோயில் அறக்கட்டளை • சமுதாய சேவை & பக்தர்கள் நிதி' },
    search: { en: 'Search', ta: 'தேடுக' },
    viewAll: { en: 'View All', ta: 'அனைத்தும் காண்க' },
    date: { en: 'Date', ta: 'தேதி' },
    amount: { en: 'Amount', ta: 'தொகை' },
    status: { en: 'Status', ta: 'நிலை' },
    active: { en: 'Active', ta: 'செயலில்' },
    inactive: { en: 'Inactive', ta: 'செயலற்ற' },
    actions: { en: 'Actions', ta: 'செயல்கள்' },
    cancel: { en: 'Cancel', ta: 'ரத்து' },
    save: { en: 'Save', ta: 'சேமி' },
    loading: { en: 'Loading...', ta: 'ஏற்றுகிறது...' },
  },
  nav: {
    dashboard: { en: 'Dashboard', ta: 'முகப்பு (டாஷ்போர்ட்)' },
    members: { en: 'Devotee Sangam (Members)', ta: 'பக்தர் சங்கம் (உறுப்பினர்கள்)' },
    contributions: { en: 'Contributions (Income)', ta: 'வருமானம் (நன்கொடைகள்)' },
    expenses: { en: 'Expenditures (Expenses)', ta: 'செலவுகள் (செலவினம்)' },
    savings: { en: 'Srivari Savings', ta: 'ஸ்ரீவாரி சேமிப்பு' },
    calendar: { en: 'Temple Calendar', ta: 'கோவில் நாட்காட்டி' },
    analytics: { en: 'Financial Analytics', ta: 'நிதி ஆய்வுகள்' },
    reports: { en: 'Audit Reports', ta: 'தணிக்கை அறிக்கைகள்' },
    functions: { en: 'Temple Festivals', ta: 'கோவில் திருவிழாக்கள்' },
    auditLogs: { en: 'Audit Logs', ta: 'தணிக்கை பதிவுகள்' },
    devoteePortal: { en: '🙏 Devotee Portal', ta: '🙏 பக்தர் தளம்' },
    adminPortal: { en: '👑 Admin Portal', ta: '👑 நிர்வாக தளம்' },
    adminLogin: { en: 'Admin Login', ta: 'நிர்வாக உள்நுழைவு' },
    adminPanel: { en: 'Admin Panel →', ta: 'நிர்வாக பலகை →' },
    logout: { en: 'Logout', ta: 'வெளியேறு' },
  },
  dashboard: {
    purattasiSani: { en: 'Purattasi Sani', ta: 'புரட்டாசி சனி' },
    gokulaashdami: { en: 'Gokulaashdami', ta: 'கோகுலாஷ்டமி' },
    yearlyFestival: { en: 'YEARLY FESTIVAL • PURATTASI', ta: 'ஆண்டு திருவிழா • புரட்டாசி' },
    fourYearFestival: { en: '4-YEAR FESTIVAL • GOKULAASHDAMI', ta: '4 வருட பெருவிழா • கோகுலாஷ்டமி' },
    purattasiTitle: { en: 'Purattasi Sani Kiyamai Festival', ta: 'புரட்டாசி சனிக்கிழமை பெருவிழா' },
    gokulTitle: { en: 'Gokulaashdami Festival', ta: 'கோகுலாஷ்டமி பெருவிழா' },
    purattasiHighlights: { en: 'Balaji Thirumanjanam • Maavilakku Deepam • Annadhanam', ta: 'பாலாஜி திருமஞ்சனம் • மாவிளக்கு தீபம் • அன்னதானம்' },
    gokulHighlights: { en: 'Sri Krishna Janmashtami • Uriyadi • Maha Prasad', ta: 'ஸ்ரீ கிருஷ்ண ஜெயந்தி • உறியடி உற்சவம் • மகா பிரசாதம்' },
    purattasiEventNotice: { en: '⭐ 2nd Saturday of Purattasi (Annual Function)', ta: '⭐ புரட்டாசி 2-வது சனிக்கிழமை (ஆண்டு பெருவிழா)' },
    gokulEventNotice: { en: '✨ Celebrated 2025 ✓ • Next in 2029', ta: '✨ 2025ல் சிறப்பாக நடைபெற்றது ✓ • அடுத்த பெருவிழா 2029' },
    purattasiSubLabel: { en: 'Purattasi Sani Kiyamai • Annual Function', ta: 'புரட்டாசி சனிக்கிழமை • ஆண்டு விழா' },
    gokulSubLabel: { en: 'Gokulaashdami 4-Year Festival Cycle', ta: 'கோகுலாஷ்டமி 4 வருட பெருவிழா' },
    overview: { en: 'Overview', ta: 'கண்ணோட்டம்' },
    allFunctions: { en: 'All Functions', ta: 'அனைத்து விழாக்கள்' },
    totalContributions: { en: 'Total Contributions', ta: 'மொத்த வருமானம்' },
    totalExpenses: { en: 'Total Expenses', ta: 'மொத்த செலவுகள்' },
    srivariSavings: { en: 'Srivari Savings', ta: 'ஸ்ரீவாரி சேமிப்பு' },
    balance: { en: 'Net Balance', ta: 'நிகர இருப்பு' },
    communityServices: { en: 'Community Services', ta: 'சமுதாய சேவைகள்' },
    recentContributions: { en: 'Recent Contributions', ta: 'சமீபத்திய நன்கொடைகள்' },
    noContributions: { en: 'No contributions found', ta: 'நன்கொடைகள் எதுவும் காணப்படவில்லை' },
    income: { en: 'Income', ta: 'வருமானம்' },
    expenses: { en: 'Expenses', ta: 'செலவுகள்' },
    savings: { en: 'Savings', ta: 'சேமிப்பு' },
    members: { en: 'Members', ta: 'உறுப்பினர்கள்' },
    totalFund: { en: 'Total Fund', ta: 'மொத்த நிதி' },
    fourYrSavings: { en: '4-Yr Savings', ta: '4 வருட சேமிப்பு' },
  },
  contributions: {
    title: { en: 'Contributions (Income)', ta: 'நன்கொடைகள் (வருமானம்)' },
    totalSeva: { en: 'Total Community Seva', ta: 'மொத்த சமுதாய சேவை நிதி' },
    searchPlaceholder: { en: 'Search by member name...', ta: 'உறுப்பினர் பெயர் கொண்டு தேடுக...' },
    addIncome: { en: 'Add Income', ta: 'வருமானம் சேர்க்க' },
    member: { en: 'Devotee Member', ta: 'பக்தர் / உறுப்பினர்' },
    empty: { en: 'No contributions found', ta: 'நன்கொடைகள் எதுவும் காணப்படவில்லை' },
    ref: { en: 'Ref', ta: 'குறிப்பு' },
    memberId: { en: 'Member ID', ta: 'உறுப்பினர் எண்' },
  },
  expenses: {
    title: { en: 'Expenses (Expenditure)', ta: 'செலவுகள் (செலவினம்)' },
    totalExpenditure: { en: 'Total Community Expenditure', ta: 'மொத்த சமுதாய செலவினம்' },
    searchPlaceholder: { en: 'Search expenses...', ta: 'செலவுகளைத் தேடுக...' },
    addExpense: { en: 'Add Expense', ta: 'செலவு சேர்க்க' },
    empty: { en: 'No expenses found', ta: 'செலவுகள் எதுவும் காணப்படவில்லை' },
    ref: { en: 'Ref', ta: 'குறிப்பு' },
  },
  members: {
    title: { en: 'Community Members', ta: 'சமுதாய உறுப்பினர்கள்' },
    registered: { en: 'registered devotees', ta: 'பதிவுசெய்த பக்தர்கள்' },
    searchPlaceholder: { en: 'Search members by name or ID...', ta: 'உறுப்பினர்களைத் தேடுக...' },
    addMember: { en: 'Add Member', ta: 'உறுப்பினர் சேர்க்க' },
    empty: { en: 'No members found', ta: 'உறுப்பினர்கள் எதுவும் காணப்படவில்லை' },
    id: { en: 'Member ID', ta: 'உறுப்பினர் எண்' },
    phone: { en: 'Phone', ta: 'தொலைபேசி' },
  },
  savings: {
    title: { en: 'Srivari Savings', ta: 'ஸ்ரீவாரி சேமிப்பு' },
    subtitle: { en: 'Community Fund Balance & Savings', ta: 'சமுதாய நிதி இருப்பு மற்றும் சேமிப்பு' },
    netSavings: { en: 'Total Community Net Savings', ta: 'மொத்த சமுதாய நிகர சேமிப்பு' },
    netBalance: { en: 'Net Balance', ta: 'நிகர இருப்பு' },
    income: { en: 'Income', ta: 'வருமானம்' },
    expenses: { en: 'Expenses', ta: 'செலவுகள்' },
    purattasiYearly: { en: 'Purattasi Sani (Yearly)', ta: 'புரட்டாசி சனி (ஆண்டு விழா)' },
    gokulFourYear: { en: 'Gokulaashdami (4-Year)', ta: 'கோகுலாஷ்டமி (4 வருட விழா)' },
  },
  categories: {
    food: { en: 'Food / Annadhanam', ta: 'அன்னதானம் (உணவு)' },
    hall: { en: 'Hall Rental', ta: 'மண்டப வாடகை' },
    decoration: { en: 'Decoration', ta: 'மலர் & மேடை அலங்காரம்' },
    transportation: { en: 'Transportation', ta: 'போக்குவரத்து வசதி' },
    cultural_religious: { en: 'Cultural & Religious', ta: 'ஆன்மீக & கலாச்சாரம்' },
    printing: { en: 'Printing', ta: 'அழைப்பிதழ் & அச்சிடுதல்' },
    sound_system: { en: 'Sound System', ta: 'ஒலி பெருக்கி & வண்ண விளக்குகள்' },
    gifts: { en: 'Gifts & Prasadam', ta: 'பிரசாதம் & சிறப்பு பரிசுகள்' },
    utilities: { en: 'Utilities & Power', ta: 'மின்சாரம் & பராமரிப்பு' },
    miscellaneous: { en: 'Miscellaneous', ta: 'இதர செலவுகள்' },
  },
  paymentMethods: {
    cash: { en: 'Cash', ta: 'ரொக்கம்' },
    upi: { en: 'UPI', ta: 'யுபிஐ (UPI)' },
    bank_transfer: { en: 'Bank Transfer', ta: 'வங்கி பரிமாற்றம்' },
    other: { en: 'Other / Cheque', ta: 'காசோலை / மற்றவை' },
  },
};

// Known member name mapping
const memberNameMap: Record<string, { en: string; ta: string }> = {
  'Murugan Rajan': { en: 'Murugan Rajan', ta: 'முருகன் ராஜன்' },
  'Selvam Krishnan': { en: 'Selvam Krishnan', ta: 'செல்வம் கிருஷ்ணன்' },
  'Anbu Durai': { en: 'Anbu Durai', ta: 'அன்பு துரை' },
  'Kannan Subramanian': { en: 'Kannan Subramanian', ta: 'கண்ணன் சுப்பிரமணியன்' },
  'Ravi Chandran': { en: 'Ravi Chandran', ta: 'ரவி சந்திரன்' },
  'Vijaya Lakshmi': { en: 'Vijaya Lakshmi', ta: 'விஜய லட்சுமி' },
  'Priya Natarajan': { en: 'Priya Natarajan', ta: 'பிரியா நடராஜன்' },
  'Thangavel Periyasamy': { en: 'Thangavel Periyasamy', ta: 'தங்கவேல் பெரியசாமி' },
  'Meenakshi Sundaram': { en: 'Meenakshi Sundaram', ta: 'மீனாட்சி சுந்தரம்' },
  'Palaniappan Govindan': { en: 'Palaniappan Govindan', ta: 'பழனியப்பன் கோவிந்தன்' },
  'Devotee Member': { en: 'Devotee Member', ta: 'பக்தர் / உறுப்பினர்' },
  'Admin': { en: 'Administrator', ta: 'நிர்வாகி' },
};

// Known function name mapping
const functionNameMap: Record<string, { en: string; ta: string }> = {
  '2026 Purattasi Sani Kiyamai': { en: '2026 Purattasi Sani Kiyamai', ta: '2026 புரட்டாசி சனிக்கிழமை' },
  'Purattasi Sani Kiyamai': { en: 'Purattasi Sani Kiyamai', ta: 'புரட்டாசி சனிக்கிழமை' },
  '2026-2029 Gokulaashdami': { en: '2026-2029 Gokulaashdami', ta: '2026-2029 கோகுலாஷ்டமி' },
  'Gokulaashdami': { en: 'Gokulaashdami', ta: 'கோகுலாஷ்டமி' },
  'Annual Function': { en: 'Annual Function', ta: 'ஆண்டு விழா' },
};

// Known dynamic text & descriptions mapping
const textPhraseMap: Record<string, { en: string; ta: string }> = {
  // Expenses descriptions
  'Sadhya catering for 300 guests - Murugan Catering Services': {
    en: 'Sadhya catering for 300 guests - Murugan Catering Services',
    ta: '300 விருந்தினர்களுக்கான சத்யா அன்னதான உணவு - முருகன் கேட்டரிங் சர்வீஸ்',
  },
  'Town Hall rental - Madurai Cultural Centre (2 days)': {
    en: 'Town Hall rental - Madurai Cultural Centre (2 days)',
    ta: 'டவுன் ஹால் மண்டப வாடகை - மதுரை கலாச்சார மையம் (2 நாட்கள்)',
  },
  'Stage decoration, floral arrangements, and entrance arch': {
    en: 'Stage decoration, floral arrangements, and entrance arch',
    ta: 'மேடை அலங்காரம், மலர் மாலைகள் மற்றும் நுழைவு வளைவு',
  },
  'Bus hire for outstation guests - Coimbatore to Madurai (3 buses)': {
    en: 'Bus hire for outstation guests - Coimbatore to Madurai (3 buses)',
    ta: 'வெளியூர் பக்தர்களுக்கான பேருந்து வாடகை - கோவை டூ மதுரை (3 பேருந்துகள்)',
  },
  'Nadaswaram troupe and Carnatic vocal concert': {
    en: 'Nadaswaram troupe and Carnatic vocal concert',
    ta: 'மங்கல நாதஸ்வர இசை குழு மற்றும் கர்நாடக சங்கீத கச்சேரி',
  },
  'Invitation cards (500 copies), banners (10), and flex boards': {
    en: 'Invitation cards (500 copies), banners (10), and flex boards',
    ta: 'அழைப்பிதழ் அட்டைகள் (500), பேனர்கள் (10) மற்றும் விளம்பர பலகைகள்',
  },
  'PA sound system and LED projector rental (2 days)': {
    en: 'PA sound system and LED projector rental (2 days)',
    ta: 'ஒலி பெருக்கி அமைப்பு மற்றும் எல்இடி திரை வாடகை (2 நாட்கள்)',
  },
  'Felicitation shawls and trophies for achievers (15 sets)': {
    en: 'Felicitation shawls and trophies for achievers (15 sets)',
    ta: 'சாதனையாளர்களுக்கு பாராட்டு சால்வைகள் மற்றும் நினைவு பரிசுகள் (15 செட்)',
  },
  'Generator rental and fuel for 2-day event': {
    en: 'Generator rental and fuel for 2-day event',
    ta: '2 நாள் நிகழ்விற்கான ஜெனரேட்டர் வாடகை மற்றும் டீசல் கட்டணம்',
  },
  'First aid supplies, security staff, and miscellaneous petty expenses': {
    en: 'First aid supplies, security staff, and miscellaneous petty expenses',
    ta: 'முதலுதவி பொருட்கள், பாதுகாப்பு ஊழியர்கள் மற்றும் சில்லறை செலவுகள்',
  },
  'Grand dinner for 500 guests - Pandian Catering': {
    en: 'Grand dinner for 500 guests - Pandian Catering',
    ta: '500 விருந்தினர்களுக்கான மகா இரவு விருந்து - பாண்டியன் கேட்டரிங்',
  },
  'Convention centre rental - Tirunelveli (3 days)': {
    en: 'Convention centre rental - Tirunelveli (3 days)',
    ta: 'கன்வென்ஷன் சென்டர் மண்டப வாடகை - திருநெல்வேலி (3 நாட்கள்)',
  },
  'Grand entrance gate, stage backdrop and pandal decoration': {
    en: 'Grand entrance gate, stage backdrop and pandal decoration',
    ta: 'பிரம்மாண்ட நுழைவு வாயில், மேடை பின்னணி மற்றும் பந்தல் அலங்காரம்',
  },
  'AC coach hire for members from Chennai and Coimbatore': {
    en: 'AC coach hire for members from Chennai and Coimbatore',
    ta: 'சென்னை மற்றும் கோவையிலிருந்து வரும் பக்தர்களுக்கான ஏசி பேருந்து',
  },
  'Homam and pooja items, purohit fees for inauguration ceremony': {
    en: 'Homam and pooja items, purohit fees for inauguration ceremony',
    ta: 'தொடக்க விழா ஹோமம், பூஜை பொருட்கள் மற்றும் புரோகிதர் தட்சிணை',
  },
  'Souvenir magazine (200 pages, 1000 copies) + event brochures': {
    en: 'Souvenir magazine (200 pages, 1000 copies) + event brochures',
    ta: 'நினைவு மலர் சிறப்பு இதழ் (200 பக்கங்கள், 1000 பிரதிகள்) + கையேடுகள்',
  },
  'Professional line-array sound system, LED wall, and livestream setup': {
    en: 'Professional line-array sound system, LED wall, and livestream setup',
    ta: 'தொழில்முறை ஒலி பெருக்கி, எல்இடி சுவர் மற்றும் நேரலை ஒளிபரப்பு',
  },
  'Scholarship certificates, memento shields, and participant gift hampers': {
    en: 'Scholarship certificates, memento shields, and participant gift hampers',
    ta: 'கல்வி உதவித்தொகை சான்றிதழ்கள், நினைவு கேடயங்கள் மற்றும் பரிசு தொகுப்புகள்',
  },
  'Generator (100 KVA), electrical cabling and lighting rig (3 days)': {
    en: 'Generator (100 KVA), electrical cabling and lighting rig (3 days)',
    ta: 'ஜெனரேட்டர் (100 KVA), மின் கம்பிகள் மற்றும் வண்ண விளக்கு அமைப்பு (3 நாட்கள்)',
  },
  'Photography, videography, and event management coordination fee': {
    en: 'Photography, videography, and event management coordination fee',
    ta: 'புகைப்படம், வீடியோ பதிவு மற்றும் விழா ஒருங்கிணைப்பாளர் கட்டணம்',
  },

  // Notes
  'Includes full vegetarian sadhya with payasam and papad': {
    en: 'Includes full vegetarian sadhya with payasam and papad',
    ta: 'பாயாசம், அப்பளத்துடன் கூடிய முழு சைவ சத்யா உணவு விருந்து',
  },
  'Advance booking for annual function. Hall capacity 500.': {
    en: 'Advance booking for annual function. Hall capacity 500.',
    ta: 'ஆண்டு விழாவிற்கான முன்பதிவு தொகை. மண்டப கொள்ளளவு 500 நபர்கள்.',
  },
  'Marigold and rose garlands, banana stems, traditional kolam': {
    en: 'Marigold and rose garlands, banana stems, traditional kolam',
    ta: 'சாமந்தி, ரோஜா மாலைகள், வாழை மரங்கள் மற்றும் பாரம்பரிய கோலங்கள்',
  },
  'Tempo Traveller x3 for guest pickup and drop': {
    en: 'Tempo Traveller x3 for guest pickup and drop',
    ta: 'பக்தர்களை அழைத்து வர 3 டெம்போ டிராவலர் வாகனங்கள்',
  },
  'Vidwan Muthusamy Pillai nadaswaram + classical concert in the evening': {
    en: 'Vidwan Muthusamy Pillai nadaswaram + classical concert in the evening',
    ta: 'வித்வான் முத்துசாமி பிள்ளை நாதஸ்வரம் + மாலை பாரம்பரிய இசைக்கச்சேரி',
  },
  'Printed at Sri Murugan Offset Press, Madurai': {
    en: 'Printed at Sri Murugan Offset Press, Madurai',
    ta: 'ஸ்ரீ முருகன் ஆப்செட் பிரஸ், மதுரையில் அச்சிடப்பட்டது',
  },
  '20000W PA system, 2 projectors, 4 LED screens': {
    en: '20000W PA system, 2 projectors, 4 LED screens',
    ta: '20000 வாட்ஸ் ஒலி பெருக்கி, 2 புரொஜெக்டர்கள், 4 எல்இடி திரைகள்',
  },
  'Silk shawls x15, bronze trophies x15 from Meenakshi Silks': {
    en: 'Silk shawls x15, bronze trophies x15 from Meenakshi Silks',
    ta: 'பட்டு சால்வைகள் 15, வெண்கல கேடயங்கள் 15 - மீனாட்சி சில்க்ஸ்',
  },
  '25 KVA generator hired from Rajan Power Solutions': {
    en: '25 KVA generator hired from Rajan Power Solutions',
    ta: '25 KVA ஜெனரேட்டர் - ராஜன் பவர் சொல்யூஷன்ஸ்',
  },
  'First aid kit, 2 security personnel, stationary, drinking water cans': {
    en: 'First aid kit, 2 security personnel, stationary, drinking water cans',
    ta: 'முதலுதவி பெட்டி, 2 பாதுகாவலர்கள், எழுதுபொருட்கள், குடிநீர் கேன்கள்',
  },
  'Multi-cuisine dinner including Tamil, North Indian and desserts': {
    en: 'Multi-cuisine dinner including Tamil, North Indian and desserts',
    ta: 'தமிழ், வட இந்திய உணவுகள் மற்றும் இனிப்புகளுடன் கூடிய இரவு விருந்து',
  },
  'AC convention centre, 1000 capacity, includes parking': {
    en: 'AC convention centre, 1000 capacity, includes parking',
    ta: 'குளிரூட்டப்பட்ட மண்டபம், 1000 பேர் கொள்ளளவு, வாகன நிறுத்துமிடம்',
  },
  'Traditional Tamil themed decoration with lights and flowers': {
    en: 'Traditional Tamil themed decoration with lights and flowers',
    ta: 'வண்ண விளக்குகள் மற்றும் மலர்களால் ஆன பாரம்பரிய தமிழ் அலங்காரம்',
  },
  '2 x AC Volvo coaches for outstation member transport': {
    en: '2 x AC Volvo coaches for outstation member transport',
    ta: 'வெளியூர் பக்தர்கள் போக்குவரத்திற்காக 2 ஏசி வோல்வோ பேருந்துகள்',
  },
  'Ganapathi homam, 3 purohits, 2-hour pooja with all samagri': {
    en: 'Ganapathi homam, 3 purohits, 2-hour pooja with all samagri',
    ta: 'கணபதி ஹோமம், 3 புரோகிதர்கள், அனைத்து பொருட்களுடன் 2 மணி நேர பூஜை',
  },
  'Full-colour glossy souvenir magazine for four-year function': {
    en: 'Full-colour glossy souvenir magazine for four-year function',
    ta: '4 வருட பெருவிழாவிற்கான முழு வண்ண பளபளப்பான சிறப்பு நினைவு மலர்',
  },
  'High-end audio-visual rental + 1 cameraman + YouTube livestream': {
    en: 'High-end audio-visual rental + 1 cameraman + YouTube livestream',
    ta: 'உயர்தர ஆடியோ-வீடியோ வாடகை + கேமராமேன் + யூடியூப் நேரலை ஒளிபரப்பு',
  },
  '10 scholarship certificates, 20 shields, 200 guest gift hampers': {
    en: '10 scholarship certificates, 20 shields, 200 guest gift hampers',
    ta: '10 கல்வி உதவித்தொகை சான்றிதழ்கள், 20 கேடயங்கள், 200 விருந்தினர் பரிசு பைகள்',
  },
  '100 KVA generator, 500 metres electrical cabling, spotlights': {
    en: '100 KVA generator, 500 metres electrical cabling, spotlights',
    ta: '100 KVA ஜெனரேட்டர், 500 மீட்டர் மின்கேபிள், ஸ்பாட்லைட்டுகள்',
  },
  'Professional photo + video team, event coordinator daily allowance': {
    en: 'Professional photo + video team, event coordinator daily allowance',
    ta: 'தொழில்முறை போட்டோ + வீடியோ குழு மற்றும் ஒருங்கிணைப்பாளர் படி',
  },

  // Contribution notes
  'First instalment for annual function': {
    en: 'First instalment for annual function',
    ta: 'ஆண்டு விழாவிற்கான முதற்கட்ட நன்கொடை தவணை',
  },
  'Bank transfer from Selvam Krishnan': {
    en: 'Bank transfer from Selvam Krishnan',
    ta: 'செல்வம் கிருஷ்ணன் அவர்களின் வங்கி பரிமாற்ற நன்கொடை',
  },
  'Cash collected at monthly meeting': {
    en: 'Cash collected at monthly meeting',
    ta: 'மாதாந்திர சமுதாய கூட்டத்தில் பெறப்பட்ட ரொக்க நன்கொடை',
  },
  'UPI payment from Kannan': {
    en: 'UPI payment from Kannan',
    ta: 'கண்ணன் அவர்களின் யுபிஐ நன்கொடை செலுத்துகை',
  },
  'Cash contribution from Ravi': {
    en: 'Cash contribution from Ravi',
    ta: 'ரவி அவர்களின் ரொக்க நன்கொடை',
  },
  'UPI transfer - Vijaya Lakshmi': {
    en: 'UPI transfer - Vijaya Lakshmi',
    ta: 'விஜய லட்சுமி அவர்களின் யுபிஐ நன்கொடை',
  },
  'Online UPI payment': {
    en: 'Online UPI payment',
    ta: 'ஆன்லைன் யுபிஐ நன்கொடை செலுத்துகை',
  },
  'IMPS transfer from Thangavel': {
    en: 'IMPS transfer from Thangavel',
    ta: 'தங்கவேல் அவர்களின் உடனடி வங்கி பரிமாற்ற நன்கொடை',
  },
  'Major donation for annual function hall booking': {
    en: 'Major donation for annual function hall booking',
    ta: 'ஆண்டு விழா மண்டப முன்பதிவுக்கான பெருந்தொகை நன்கொடை',
  },
  'Second instalment - annual function': {
    en: 'Second instalment - annual function',
    ta: 'ஆண்டு விழாவிற்கான இரண்டாம் கட்ட நன்கொடை தவணை',
  },
  'Four-year fund - founding contribution': {
    en: 'Four-year fund - founding contribution',
    ta: '4 வருட பெருவிழா நிதிக்கான தொடக்க முதன்மை நன்கொடை',
  },
  'RTGS transfer - major sponsor': {
    en: 'RTGS transfer - major sponsor',
    ta: 'முக்கிய புரவலரின் RTGS வங்கி பரிமாற்ற பெரு நன்கொடை',
  },
  'Four-year celebration fund pledge': {
    en: 'Four-year celebration fund pledge',
    ta: '4 வருட பெருவிழா நிதிக்கான வாக்குறுதி நன்கொடை',
  },
  'Online transfer for four-year fund': {
    en: 'Online transfer for four-year fund',
    ta: '4 வருட பெருவிழா நிதிக்கான ஆன்லைன் நன்கொடை',
  },
  'Cash paid during temple visit': {
    en: 'Cash paid during temple visit',
    ta: 'திருக்கோயில் தரிசனத்தின் போது அளிக்கப்பட்ட ரொக்க காணிக்கை',
  },
  'Quarterly contribution - Q1 2026': {
    en: 'Quarterly contribution - Q1 2026',
    ta: 'காலாண்டு தவணை நன்கொடை - Q1 2026',
  },
  'Cheque contribution - four-year fund': {
    en: 'Cheque contribution - four-year fund',
    ta: '4 வருட பெருவிழா நிதிக்கான காசோலை நன்கொடை',
  },
  'March instalment - four-year fund': {
    en: 'March instalment - four-year fund',
    ta: 'மார்ச் மாத தவணை நன்கொடை - 4 வருட நிதி',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (path: string) => string;
  translateText: (text?: string | null) => string;
  translateMember: (name?: string | null) => string;
  translateFunction: (name?: string | null) => string;
  formatCategory: (category: string) => string;
  formatMethod: (method: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'ta',
  setLanguage: () => {},
  toggleLanguage: () => {},
  t: () => '',
  translateText: (txt?: string | null) => txt || '',
  translateMember: (name?: string | null) => name || '',
  translateFunction: (name?: string | null) => name || '',
  formatCategory: (c: string) => c,
  formatMethod: (m: string) => m,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Default to 'ta' (Tamil) as requested by temple community
  const [language, setLanguageState] = useState<Language>('ta');

  useEffect(() => {
    const saved = localStorage.getItem('namo_language') as Language | null;
    if (saved === 'ta' || saved === 'en') {
      setLanguageState(saved);
    } else {
      // Set default 'ta' into storage
      localStorage.setItem('namo_language', 'ta');
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('namo_language', lang);
  };

  const toggleLanguage = () => {
    const nextLang = language === 'en' ? 'ta' : 'en';
    setLanguage(nextLang);
  };

  const t = (path: string): string => {
    const keys = path.split('.');
    let curr: unknown = translations;
    for (const key of keys) {
      if (curr && typeof curr === 'object' && key in curr) {
        curr = (curr as Record<string, unknown>)[key];
      } else {
        return path;
      }
    }
    if (curr && typeof curr === 'object' && language in curr) {
      return (curr as Record<Language, string>)[language];
    }
    return typeof curr === 'string' ? curr : path;
  };

  const translateText = (text?: string | null): string => {
    if (!text) return '';
    const trimmed = text.trim();
    if (trimmed in textPhraseMap) {
      return textPhraseMap[trimmed][language];
    }
    // Partial substring match for common patterns
    if (language === 'ta') {
      let result = trimmed;
      for (const [key, val] of Object.entries(textPhraseMap)) {
        if (result.includes(key)) {
          result = result.replace(key, val.ta);
        }
      }
      return result;
    }
    return text;
  };

  const translateMember = (name?: string | null): string => {
    if (!name) return language === 'ta' ? 'பக்தர் / உறுப்பினர்' : 'Devotee Member';
    const trimmed = name.trim();
    if (trimmed in memberNameMap) {
      return memberNameMap[trimmed][language];
    }
    return name;
  };

  const translateFunction = (name?: string | null): string => {
    if (!name) return language === 'ta' ? 'கோவில் விழா' : 'Temple Function';
    const trimmed = name.trim();
    if (trimmed in functionNameMap) {
      return functionNameMap[trimmed][language];
    }
    if (language === 'ta') {
      if (trimmed.includes('Purattasi Sani')) return '2026 புரட்டாசி சனிக்கிழமை';
      if (trimmed.includes('Gokulaashdami')) return '2026-2029 கோகுலாஷ்டமி';
    }
    return name;
  };

  const formatCategory = (category: string): string => {
    const cats = translations.categories as Record<string, Record<Language, string>>;
    const key = category.toLowerCase().trim();
    if (key in cats) {
      return cats[key][language];
    }
    return category;
  };

  const formatMethod = (method: string): string => {
    const methods = translations.paymentMethods as Record<string, Record<Language, string>>;
    const key = method.toLowerCase().trim();
    if (key in methods) {
      return methods[key][language];
    }
    return method;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t,
        translateText,
        translateMember,
        translateFunction,
        formatCategory,
        formatMethod,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
