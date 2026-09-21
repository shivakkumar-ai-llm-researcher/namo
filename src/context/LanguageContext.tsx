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
    dashboard: { en: 'Dashboard', ta: 'முகப்பு (டேஷ்போர்ட்)' },
    contributions: { en: 'Contributions', ta: 'வருமானம் (நன்கொடைகள்)' },
    expenses: { en: 'Expenditures', ta: 'செலவுகள்' },
    savings: { en: 'Srivari Savings', ta: 'ஸ்ரீவாரி சேமிப்பு' },
    calendar: { en: 'Temple Calendar', ta: 'கோவில் நாட்காட்டி' },
    analytics: { en: 'Financial Analytics', ta: 'நிதி ஆய்வுகள்' },
    members: { en: 'Members', ta: 'உறுப்பினர்கள்' },
    reports: { en: 'Audit Reports', ta: 'தணிக்கை அறிக்கைகள்' },
    functions: { en: 'Functions', ta: 'நிகழ்வுகள் / விழாக்கள்' },
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
    yearlyFestival: { en: 'YEARLY FESTIVAL • புரட்டாசி', ta: 'ஆண்டு திருவிழா • புரட்டாசி' },
    fourYearFestival: { en: '4-YEAR FESTIVAL • 4 வருட விழா', ta: '4 வருட பெருவிழா • கோகுலாஷ்டமி' },
    purattasiTitle: { en: 'Purattasi Sani Kiyamai', ta: 'புரட்டாசி சனிக்கிழமை' },
    gokulTitle: { en: 'Gokulaashdami Festival', ta: 'கோகுலாஷ்டமி பெருவிழா' },
    purattasiHighlights: { en: 'Balaji Thirumanjanam • Maavilakku Deepam • Annadhanam', ta: 'பாலாஜி திருமஞ்சனம் • மாவிளக்கு தீபம் • அன்னதானம்' },
    gokulHighlights: { en: 'Sri Krishna Janmashtami • Uriyadi • Maha Prasad', ta: 'ஸ்ரீ கிருஷ்ண ஜெயந்தி • உறியடி உற்சவம் • மகா பிரசாதம்' },
    purattasiEventNotice: { en: '⭐ 2nd Saturday of Purattasi (Annual Function)', ta: '⭐ புரட்டாசி 2-வது சனிக்கிழமை (ஆண்டு பெருவிழா)' },
    gokulEventNotice: { en: '✨ Celebrated 2025 ✓ • Next in 2029', ta: '✨ 2025ல் சிறப்பாக நடைபெற்றது ✓ • அடுத்த விழா 2029' },
    purattasiSubLabel: { en: 'Purattasi Sani Kiyamai • Annual Function', ta: 'புரட்டாசி சனிக்கிழமை • ஆண்டு விழா' },
    gokulSubLabel: { en: 'Gokulaashdami 4-Year Festival', ta: 'கோகுலாஷ்டமி 4 வருட பெருவிழா' },
    overview: { en: 'Overview', ta: 'கண்ணோட்டம்' },
    allFunctions: { en: 'All Functions', ta: 'அனைத்து விழாக்கள்' },
    totalContributions: { en: 'Total Contributions', ta: 'மொத்த வருமானம்' },
    totalExpenses: { en: 'Total Expenses', ta: 'மொத்த செலவுகள்' },
    srivariSavings: { en: 'Srivari Savings', ta: 'ஸ்ரீவாரி சேமிப்பு' },
    balance: { en: 'Net Balance', ta: 'நிகர இருப்பு நிதி' },
    communityServices: { en: 'Community Services • விரைவு சேவைகள்', ta: 'சமுதாய விரைவு சேவைகள்' },
    recentContributions: { en: 'Recent Contributions • சமீபத்திய நன்கொடைகள்', ta: 'சமீபத்திய நன்கொடைகள்' },
    noContributions: { en: 'No contributions found', ta: 'நன்கொடைகள் எதுவும் காணப்படவில்லை' },
    income: { en: 'Income', ta: 'வருமானம்' },
    expenses: { en: 'Expenses', ta: 'செலவுகள்' },
    savings: { en: 'Savings', ta: 'சேமிப்பு' },
    members: { en: 'Members', ta: 'உறுப்பினர்கள்' },
    totalFund: { en: 'Total Fund', ta: 'மொத்த நிதி' },
    fourYrSavings: { en: '4-Yr Savings', ta: '4 வருட சேமிப்பு' },
  },
  contributions: {
    title: { en: 'Contributions', ta: 'நன்கொடைகள் / வருமானம்' },
    totalSeva: { en: 'Total Community Seva', ta: 'மொத்த சமுதாய சேவை நிதி' },
    searchPlaceholder: { en: 'Search by member name...', ta: 'உறுப்பினர் பெயர் கொண்டு தேடுக...' },
    addIncome: { en: 'Add Income', ta: 'வருமானம் சேர்க்க' },
    member: { en: 'Devotee Member', ta: 'பக்தர் / உறுப்பினர்' },
    empty: { en: 'No contributions found', ta: 'நன்கொடைகள் எதுவும் காணப்படவில்லை' },
    ref: { en: 'Ref', ta: 'குறிப்பு எண்' },
    memberId: { en: 'Member ID', ta: 'உறுப்பினர் எண்' },
  },
  expenses: {
    title: { en: 'Expenses', ta: 'சமுதாய செலவுகள்' },
    totalExpenditure: { en: 'Total Community Expenditure', ta: 'மொத்த சமுதாய செலவினம்' },
    searchPlaceholder: { en: 'Search expenses...', ta: 'செலவுகளை தேடுக...' },
    addExpense: { en: 'Add Expense', ta: 'செலவு சேர்க்க' },
    empty: { en: 'No expenses found', ta: 'செலவுகள் எதுவும் காணப்படவில்லை' },
    ref: { en: 'Ref', ta: 'குறிப்பு எண்' },
  },
  members: {
    title: { en: 'Community Members', ta: 'சமுதாய உறுப்பினர்கள்' },
    registered: { en: 'registered devotees', ta: 'பதிவுசெய்த பக்தர்கள்' },
    searchPlaceholder: { en: 'Search members...', ta: 'உறுப்பினர்களை தேடுக...' },
    addMember: { en: 'Add Member', ta: 'உறுப்பினர் சேர்க்க' },
    empty: { en: 'No members found', ta: 'உறுப்பினர்கள் எதுவும் காணப்படவில்லை' },
    id: { en: 'Member ID', ta: 'உறுப்பினர் எண்' },
    phone: { en: 'Phone', ta: 'தொலைபேசி' },
  },
  savings: {
    title: { en: 'Srivari Savings', ta: 'ஸ்ரீவாரி சேமிப்பு' },
    subtitle: { en: 'Community Fund Balance • நிதி இருப்பு', ta: 'சமுதாய நிதி இருப்பு மற்றும் சேமிப்பு' },
    netSavings: { en: 'Total Community Net Savings', ta: 'மொத்த சமுதாய நிகர சேமிப்பு' },
    netBalance: { en: 'Net Balance', ta: 'நிகர இருப்பு' },
    income: { en: 'Income', ta: 'வருமானம்' },
    expenses: { en: 'Expenses', ta: 'செலவுகள்' },
    purattasiYearly: { en: 'Purattasi Sani (Yearly)', ta: 'புரட்டாசி சனி (ஆண்டு விழா)' },
    gokulFourYear: { en: 'Gokulaashdami (4-Year)', ta: 'கோகுலாஷ்டமி (4 வருட விழா)' },
  },
  categories: {
    food: { en: 'Food / Annadhanam', ta: 'அன்னதானம் / உணவு' },
    hall: { en: 'Hall Rental', ta: 'மண்டப வாடகை' },
    decoration: { en: 'Decoration', ta: 'அலங்காரம்' },
    transportation: { en: 'Transportation', ta: 'போக்குவரத்து' },
    cultural_religious: { en: 'Cultural / Religious', ta: 'ஆன்மீக / கலாச்சாரம்' },
    printing: { en: 'Printing', ta: 'அச்சிடுதல்' },
    sound_system: { en: 'Sound System', ta: 'ஒலி பெருக்கி அமைப்பு' },
    gifts: { en: 'Gifts & Prasadam', ta: 'பரிசுகள் / பிரசாதம்' },
    utilities: { en: 'Utilities', ta: 'பயன்பாட்டு செலவுகள்' },
    miscellaneous: { en: 'Miscellaneous', ta: 'இதர செலவுகள்' },
  },
  paymentMethods: {
    cash: { en: 'Cash', ta: 'ரொக்கம்' },
    upi: { en: 'UPI', ta: 'யுபிஐ (UPI)' },
    bank_transfer: { en: 'Bank Transfer', ta: 'வங்கி பரிமாற்றம்' },
    other: { en: 'Other', ta: 'மற்றவை' },
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (path: string) => string;
  formatCategory: (category: string) => string;
  formatMethod: (method: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  toggleLanguage: () => {},
  t: () => '',
  formatCategory: (c: string) => c,
  formatMethod: (m: string) => m,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const saved = localStorage.getItem('namo_language') as Language | null;
    if (saved === 'ta' || saved === 'en') {
      setLanguageState(saved);
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

  const formatCategory = (category: string): string => {
    const cats = translations.categories as Record<string, Record<Language, string>>;
    if (category in cats) {
      return cats[category][language];
    }
    return category;
  };

  const formatMethod = (method: string): string => {
    const methods = translations.paymentMethods as Record<string, Record<Language, string>>;
    const key = method.toLowerCase();
    if (key in methods) {
      return methods[key][language];
    }
    return method;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t, formatCategory, formatMethod }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
