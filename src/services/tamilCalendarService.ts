/**
 * Dynamic Tamil Calendar & Panchangam Calculation Service for Web
 * Powered by @ishubhamx/panchangam-js (Swiss Ephemeris astronomical calculations)
 * with localStorage caching for instant monthly lookups.
 * English & Tamil only.
 */

import { Observer } from 'astronomy-engine';
import { getPanchangam } from '@ishubhamx/panchangam-js/dist/core/panchangam.js';
import { tithiNames, nakshatraNames } from '@ishubhamx/panchangam-js/dist/core/constants.js';
import { getEkadashiName } from '@ishubhamx/panchangam-js/dist/core/festivals.js';

// Tamil Nadu Coordinates (Neyveli / Chennai region: 11.7480 N, 79.4970 E)
export const TAMIL_NADU_OBSERVER = new Observer(11.7480, 79.4970, 0);

export interface DailyPanchangamData {
  date: string; // YYYY-MM-DD
  tithiNumber: number; // 1-30
  tithiName: string;
  paksha: 'Shukla' | 'Krishna';
  nakshatraNumber: number; // 1-27
  nakshatraName: string;
  tamilMonth: string;
  tamilMonthTamil: string;
  tamilDay: number;
  tamilYear: string;
  isMonthStart?: boolean;
  isEkadashi: boolean;
  ekadashiName?: string;
  isThiruvonam: boolean;
  isPurattasiSaturday: boolean;
  isPurattasiSecondSaturday: boolean;
  purattasiSaturdayIndex?: number;
  isGokulashtami: boolean;
  gokulashtamiNote?: string;
  isPerumalSpecialDay: boolean;
  specialEventTitle?: string;
  specialEventTitleTamil?: string;
  specialEventDescription?: string;
  rahuKalam?: { start: string; end: string };
  yamagandaKalam?: { start: string; end: string };
}

export interface GokulashtamiCycleInfo {
  lastCelebrationYear: number;
  nextCelebrationYear: number;
  currentYear: number;
  cycleIntervalYears: number;
  yearsRemaining: number;
  cycleStatusText: string;
  cycleHistory: {
    year: number;
    status: 'celebrated' | 'upcoming' | 'next_grand_celebration' | 'future';
    description: string;
  }[];
}

// 12 Tamil Solar Months matching astronomical Sun Rashi indices 0-11
export const TAMIL_MONTHS = [
  { name: 'Chithirai', nameTamil: 'சித்திரை' }, // Sun in Mesha (0)
  { name: 'Vaikasi', nameTamil: 'வைகாசி' },     // Sun in Vrishabha (1)
  { name: 'Aani', nameTamil: 'ஆனி' },           // Sun in Mithuna (2)
  { name: 'Aadi', nameTamil: 'ஆடி' },           // Sun in Kataka (3)
  { name: 'Avani', nameTamil: 'ஆவணி' },         // Sun in Simha (4)
  { name: 'Purattasi', nameTamil: 'புரட்டாசி' }, // Sun in Kanya (5)
  { name: 'Aippasi', nameTamil: 'ஐப்பசி' },     // Sun in Tula (6)
  { name: 'Karthigai', nameTamil: 'கார்த்திகை' },// Sun in Vrischika (7)
  { name: 'Margazhi', nameTamil: 'மார்கழி' },   // Sun in Dhanus (8)
  { name: 'Thai', nameTamil: 'தை' },           // Sun in Makara (9)
  { name: 'Masi', nameTamil: 'மாசி' },           // Sun in Kumbha (10)
  { name: 'Panguni', nameTamil: 'பங்குனி' },     // Sun in Meena (11)
];

// 60-Year Tamil Cycle (அறுபது தமிழ் வருடங்கள்)
export const TAMIL_60_YEARS = [
  { name: 'Prabhava', nameTamil: 'பிரபவ' },       // 1987
  { name: 'Vibhava', nameTamil: 'விபவ' },
  { name: 'Shukla', nameTamil: 'சுக்ல' },
  { name: 'Pramodoota', nameTamil: 'பிரமோதூத' },
  { name: 'Prajorpatti', nameTamil: 'பிரசோற்பத்தி' },
  { name: 'Angirasa', nameTamil: 'ஆங்கீரச' },
  { name: 'Srimukha', nameTamil: 'ஸ்ரீமுக' },
  { name: 'Bhava', nameTamil: 'பவ' },
  { name: 'Yuva', nameTamil: 'யுவ' },
  { name: 'Dhatru', nameTamil: 'தாது' },
  { name: 'Ishvara', nameTamil: 'ஈஸ்வர' },
  { name: 'Vehudhanya', nameTamil: 'வெகுதானிய' },
  { name: 'Pramathi', nameTamil: 'பிரமாதி' },
  { name: 'Vikrama', nameTamil: 'விக்ரம' },
  { name: 'Vishu', nameTamil: 'விஷு' },
  { name: 'Chitrabhanu', nameTamil: 'சித்திரபானு' },
  { name: 'Subhanu', nameTamil: 'சுபானு' },
  { name: 'Dharana', nameTamil: 'தாரண' },
  { name: 'Parthiba', nameTamil: 'பார்த்திப' },
  { name: 'Viya', nameTamil: 'விய' },
  { name: 'Sarvajit', nameTamil: 'சர்வஜித்' },
  { name: 'Sarvadhari', nameTamil: 'சர்வதாரி' },
  { name: 'Virodhi', nameTamil: 'விரோதி' },
  { name: 'Vikruti', nameTamil: 'விக்ருதி' },
  { name: 'Kara', nameTamil: 'கர' },
  { name: 'Nandana', nameTamil: 'நந்தன' },
  { name: 'Vijaya', nameTamil: 'விஜய' },
  { name: 'Jaya', nameTamil: 'ஜய' },
  { name: 'Manmatha', nameTamil: 'மன்மத' },
  { name: 'Dunmukhi', nameTamil: 'துன்முகி' },
  { name: 'Hevilambi', nameTamil: 'ஹேவிளம்பி' },
  { name: 'Vilambi', nameTamil: 'விளம்பி' },
  { name: 'Vikari', nameTamil: 'விகாரி' },
  { name: 'Sarvari', nameTamil: 'சார்வரி' },
  { name: 'Plava', nameTamil: 'பிலவ' },
  { name: 'Subhakritu', nameTamil: 'சுபகிருது' },
  { name: 'Sobhakritu', nameTamil: 'சோபகிருது' },
  { name: 'Krodhi', nameTamil: 'குரோதி' },       // 2024-2025
  { name: 'Visvavasu', nameTamil: 'விசுவாவசு' },   // 2025-2026
  { name: 'Parabhava', nameTamil: 'பராபவ' },       // 2026-2027
  { name: 'Plavanga', nameTamil: 'பிலவங்க' },     // 2027-2028
  { name: 'Kilaka', nameTamil: 'கீலக' },           // 2028-2029
  { name: 'Saumya', nameTamil: 'சௌமிய' },         // 2029-2030 (4-Year Gokulaashdami!)
  { name: 'Sadharana', nameTamil: 'சாதாரண' },
  { name: 'Virodhikritu', nameTamil: 'விரோதிகிருது' },
  { name: 'Paridhavi', nameTamil: 'பரிதாபி' },
  { name: 'Pramadicha', nameTamil: 'பிரமாதீச' },
  { name: 'Ananda', nameTamil: 'ஆனந்த' },
  { name: 'Rakshasa', nameTamil: 'ராட்சச' },
  { name: 'Nala', nameTamil: 'நள' },
  { name: 'Pingala', nameTamil: 'பிங்கள' },
  { name: 'Kalayukthi', nameTamil: 'காளயுக்தி' },
  { name: 'Siddharthi', nameTamil: 'சித்தார்த்தி' },
  { name: 'Raudri', nameTamil: 'ரௌத்திரி' },
  { name: 'Dunmathi', nameTamil: 'துன்மதி' },
  { name: 'Dundubhi', nameTamil: 'துந்துபி' },
  { name: 'Rudhrodhkari', nameTamil: 'ருத்ரோத்காரி' },
  { name: 'Raktakshi', nameTamil: 'ரக்தாட்சி' },
  { name: 'Krodhana', nameTamil: 'குரோதன' },
  { name: 'Akshaya', nameTamil: 'அட்சய' },
];

export function getTamilYearName(date: Date, rashiIndex: number): { name: string; nameTamil: string } {
  const gYear = date.getFullYear();
  const effectiveYear = rashiIndex >= 9 ? gYear - 1 : gYear;
  const cycleIndex = ((effectiveYear - 1987) % 60 + 60) % 60;
  return TAMIL_60_YEARS[cycleIndex];
}

const CACHE_PREFIX = 'namo_panchangam_v2_';

export const tamilCalendarService = {
  /**
   * Convert Gregorian Date to 100% Astronomical Tamil Month and Day
   * using exact Solar Ingress (Sankranti / சூரிய சங்கிரமணம்).
   */
  getTamilDate(date: Date, observer = TAMIL_NADU_OBSERVER) {
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 6, 0, 0);
    const p = getPanchangam(d, observer);
    const curRashi = p.sunRashi.index;

    // Walk backwards day-by-day to find Day 1 (Sankranti day)
    let count = 1;
    let walk = new Date(d);
    while (true) {
      const prev = new Date(walk);
      prev.setDate(prev.getDate() - 1);
      const prevP = getPanchangam(prev, observer);
      if (prevP.sunRashi.index !== curRashi) {
        break; // prev was previous solar month, so walk is Day 1
      }
      count++;
      walk = prev;
      if (count > 35) break; // safety
    }

    const tMonth = TAMIL_MONTHS[curRashi];
    const tYear = getTamilYearName(date, curRashi);

    return {
      tamilMonth: tMonth.name,
      tamilMonthTamil: tMonth.nameTamil,
      tamilDay: count,
      tamilYear: `${tYear.nameTamil} (${tYear.name})`,
      rashiIndex: curRashi,
      isMonthStart: count === 1,
    };
  },

  /**
   * 4-Year Gokulaashdami cycle management
   * Last celebrated: 2025
   * Next grand celebration: 2029
   */
  getGokulashtamiCycleInfo(currentYear: number = new Date().getFullYear()): GokulashtamiCycleInfo {
    const lastCelebrationYear = 2025;
    const nextCelebrationYear = 2029;
    const cycleIntervalYears = 4;
    const yearsRemaining = Math.max(0, nextCelebrationYear - currentYear);

    let cycleStatusText = '';
    if (currentYear === 2025) {
      cycleStatusText = 'Celebrated in 2025 (Completed)';
    } else if (currentYear === 2029) {
      cycleStatusText = 'Grand 4-Year Celebration Year (2029)!';
    } else {
      cycleStatusText = `Celebrated in 2025. Next Grand Celebration is coming in ${nextCelebrationYear} (${yearsRemaining} year${yearsRemaining > 1 ? 's' : ''} to go)`;
    }

    const cycleHistory: GokulashtamiCycleInfo['cycleHistory'] = [
      {
        year: 2025,
        status: 'celebrated',
        description: 'Celebrated in 2025 with grand Sri Krishna Jayanthi pooja, Uri-yadi utsavam & community feast.',
      },
      {
        year: 2026,
        status: 'upcoming',
        description: 'Year 1: Community Seva, monthly poojas, and 4-Year Fund accumulation.',
      },
      {
        year: 2027,
        status: 'upcoming',
        description: 'Year 2: Mid-cycle Sri Krishna Aradhana and spiritual activities.',
      },
      {
        year: 2028,
        status: 'upcoming',
        description: 'Year 3: Preparatory year for the quadrennial Mahotsavam.',
      },
      {
        year: 2029,
        status: 'next_grand_celebration',
        description: 'NEXT GRAND CELEBRATION! Quadrennial Gokulaashdami Maha Utsavam.',
      },
      {
        year: 2033,
        status: 'future',
        description: 'Subsequent 4-Year celebration cycle.',
      },
    ];

    return {
      lastCelebrationYear,
      nextCelebrationYear,
      currentYear,
      cycleIntervalYears,
      yearsRemaining,
      cycleStatusText,
      cycleHistory,
    };
  },

  /**
   * Get all Saturdays in Purattasi month for a given year,
   * specifically flagging the 2nd Saturday.
   */
  getPurattasiSaturdays(year: number, observer = TAMIL_NADU_OBSERVER) {
    const searchStart = new Date(year, 8, 15, 6, 0, 0); // Sep 15
    const searchEnd = new Date(year, 9, 20, 6, 0, 0);   // Oct 20

    const saturdays: {
      date: string;
      index: number;
      isSecond: boolean;
      title: string;
      titleTamil: string;
      description: string;
      tamilDay: number;
    }[] = [];

    let saturdayIndex = 1;
    const cur = new Date(searchStart);

    while (cur <= searchEnd) {
      const p = getPanchangam(cur, observer);
      if (p.sunRashi.index === 5 && cur.getDay() === 6) {
        const yyyy = cur.getFullYear();
        const mm = String(cur.getMonth() + 1).padStart(2, '0');
        const dd = String(cur.getDate()).padStart(2, '0');
        const dateStr = `${yyyy}-${mm}-${dd}`;
        const isSecond = saturdayIndex === 2;

        const tDate = this.getTamilDate(cur, observer);

        saturdays.push({
          date: dateStr,
          index: saturdayIndex,
          isSecond,
          tamilDay: tDate.tamilDay,
          title: isSecond
            ? '2nd Purattasi Saturday - Annual Community Function'
            : `Purattasi Saturday ${saturdayIndex}`,
          titleTamil: isSecond
            ? 'புரட்டாசி 2-வது சனிக்கிழமை (ஆண்டு பெருவிழா)'
            : `புரட்டாசி ${saturdayIndex}-வது சனிக்கிழமை`,
          description: isSecond
            ? 'OUR ANNUAL COMMUNITY FUNCTION: Grand Tirupati Balaji Thaligai, Thirumanjanam, Deepam Aradhana & Annadhanam feast. Most auspicious day for Lord Venkateswara!'
            : `Purattasi Sani Kizhamai ${saturdayIndex}: Auspicious fasting, Maavilakku Deepam offering, and Perumal pooja.`,
        });

        saturdayIndex++;
      }
      cur.setDate(cur.getDate() + 1);
    }

    return saturdays;
  },

  /**
   * Compute dynamic panchangam for a single day using @ishubhamx/panchangam-js
   */
  computeDayPanchangam(date: Date, observer = TAMIL_NADU_OBSERVER): DailyPanchangamData {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;

    // 1. Dynamic astronomical calculation
    const raw = getPanchangam(new Date(yyyy, date.getMonth(), date.getDate(), 6, 0, 0), observer);
    const tamilDate = this.getTamilDate(date, observer);

    // Tithi & Paksha
    const tithiNumber = raw.tithi ?? 1;
    const tithiName = tithiNames[(tithiNumber - 1) % 15] ?? 'Prathama';
    const paksha: 'Shukla' | 'Krishna' = (raw.paksha as any) ?? (tithiNumber <= 15 ? 'Shukla' : 'Krishna');

    // Nakshatra
    const nakshatraNumber = raw.nakshatra ?? 1;
    const nakshatraName = nakshatraNames[nakshatraNumber - 1] ?? 'Ashwini';

    // 2. Detect Ekadashi (Tithi 11 or 26)
    const isEkadashi = tithiNumber === 11 || tithiNumber === 26 || tithiName.toLowerCase().includes('ekadashi');
    let ekadashiName: string | undefined = undefined;
    if (isEkadashi) {
      try {
        const masaIdx = raw.masa?.index ?? 0;
        ekadashiName = getEkadashiName(masaIdx, paksha, raw.masa?.isAdhika ?? false);
      } catch {
        ekadashiName = `${paksha} Ekadashi`;
      }
    }

    // 3. Detect Thiruvonam (Shravana Nakshatra, index 22) - Perumal Janma Nakshatram
    const isThiruvonam = nakshatraNumber === 22 || nakshatraName.toLowerCase().includes('shravana');

    // 4. Check Purattasi Saturdays (with explicit 2nd Saturday flag)
    let isPurattasiSaturday = false;
    let isPurattasiSecondSaturday = false;
    let purattasiSaturdayIndex: number | undefined = undefined;

    if (tamilDate.tamilMonth === 'Purattasi' && date.getDay() === 6) {
      isPurattasiSaturday = true;
      const allSats = this.getPurattasiSaturdays(yyyy, observer);
      const matched = allSats.find((s) => s.date === dateStr);
      if (matched) {
        purattasiSaturdayIndex = matched.index;
        isPurattasiSecondSaturday = matched.isSecond;
      }
    }

    // 5. Detect Gokulashtami / Sri Krishna Jayanthi accurately (Strict check, avoids false positives on Pradosham)
    const hasGokulaFestival = raw.festivals?.some(
      (f: any) =>
        /\b(janmashtami|gokulashtami|gokula\s*ashtami|krishna\s*jayanthi)\b/i.test(f.name || '')
    );
    const isAvaniAshtami = tamilDate.tamilMonth === 'Avani' && paksha === 'Krishna' && (tithiNumber === 22 || tithiNumber === 23) && nakshatraName.toLowerCase().includes('rohini');
    const isGokulashtami = Boolean(hasGokulaFestival || isAvaniAshtami);

    // 6. Detect other major Perumal festivals
    const hasRamaNavami = raw.festivals?.some((f: any) => f.name?.toLowerCase().includes('rama navami')) ||
      (tamilDate.tamilMonth === 'Chithirai' && tithiNumber === 9 && paksha === 'Shukla');

    const hasNarasimhaJayanti = raw.festivals?.some((f: any) => f.name?.toLowerCase().includes('narasimha')) ||
      (tamilDate.tamilMonth === 'Vaikasi' && tithiNumber === 14 && paksha === 'Shukla');

    const isVaikuntaEkadashi = isEkadashi && tamilDate.tamilMonth === 'Margazhi' && paksha === 'Shukla';

    // Combine special day status
    const isPerumalSpecialDay =
      isPurattasiSaturday ||
      isGokulashtami ||
      isEkadashi ||
      isThiruvonam ||
      hasRamaNavami ||
      hasNarasimhaJayanti ||
      (tamilDate.tamilMonth === 'Purattasi' && tamilDate.tamilDay === 1);

    let specialEventTitle: string | undefined;
    let specialEventTitleTamil: string | undefined;
    let specialEventDescription: string | undefined;

    if (isPurattasiSecondSaturday) {
      specialEventTitle = '2nd Purattasi Saturday - Annual Community Function';
      specialEventTitleTamil = 'புரட்டாசி 2-வது சனிக்கிழமை (ஆண்டு பெருவிழா)';
      specialEventDescription = 'OUR ANNUAL COMMUNITY FUNCTION: Grand Tirupati Balaji Thaligai, Thirumanjanam, Deepam Aradhana & Annadhanam feast. Most auspicious day for Lord Venkateswara!';
    } else if (isPurattasiSaturday) {
      specialEventTitle = `Purattasi Saturday ${purattasiSaturdayIndex ?? ''}`;
      specialEventTitleTamil = `புரட்டாசி ${purattasiSaturdayIndex ?? ''}-வது சனிக்கிழமை`;
      specialEventDescription = 'Auspicious Purattasi Sani Kizhamai: Special Venkateswara fasting, Maavilakku Deepam offering, and Perumal pooja.';
    } else if (tamilDate.tamilMonth === 'Purattasi' && tamilDate.tamilDay === 1) {
      specialEventTitle = 'Purattasi Masappirappu (Holy Month Begins)';
      specialEventTitleTamil = 'புரட்டாசி மாதப்பிறப்பு (புனித மாதம் ஆரம்பம்)';
      specialEventDescription = 'Auspicious commencement of the sacred Purattasi month dedicated to Lord Venkateswara. Daily fasting, Vishnu Sahasranama chanting, and deepam devotion begin.';
    } else if (isGokulashtami) {
      specialEventTitle = 'Gokulaashdami (4-Year Cycle Function)';
      specialEventTitleTamil = 'கோகுலாஷ்டமி (4 ஆண்டு சுழற்சி திருவிழா)';
      specialEventDescription = 'Annual Sri Krishna Jayanthi pooja • Celebrated in 2025 • Next Grand Celebration in 2029!';
    } else if (isVaikuntaEkadashi) {
      specialEventTitle = 'Vaikunta Ekadashi (Paramapada Vaasal)';
      specialEventTitleTamil = 'வைகுண்ட ஏகாதசி (சொர்க்கவாசல் திறப்பு)';
      specialEventDescription = 'The crown jewel festival of Lord Venkateswara. Paramapada Vaasal opens in Tirumala and all Vishnu temples.';
    } else if (isEkadashi) {
      specialEventTitle = `${ekadashiName ?? 'Ekadashi'} Fasting`;
      specialEventTitleTamil = `${paksha === 'Shukla' ? 'வளர்பிறை' : 'தேய்பிறை'} ஏகாதசி விரதம்`;
      specialEventDescription = `Auspicious Vishnu fasting day (${tithiName} Tithi). Reading Vishnu Sahasranamam and chanting brings great merit.`;
    } else if (isThiruvonam) {
      specialEventTitle = 'Thiruvonam (Shravana Nakshatram)';
      specialEventTitleTamil = 'திருவோணம் நட்சத்திரம்';
      specialEventDescription = "Lord Venkateswara's sacred Janma Nakshatram. Special Sahasranama archana & thirumanjanam day.";
    } else if (hasRamaNavami) {
      specialEventTitle = 'Sri Rama Navami';
      specialEventTitleTamil = 'ஸ்ரீ ராம நவமி';
      specialEventDescription = 'Divine incarnation of Lord Sri Rama, 7th avatar of Lord Maha Vishnu.';
    } else if (hasNarasimhaJayanti) {
      specialEventTitle = 'Narasimha Jayanti';
      specialEventTitleTamil = 'ஸ்ரீ நரசிம்ம ஜெயந்தி';
      specialEventDescription = 'Divine incarnation of Lord Sri Narasimha Swami to protect devotee Prahlada.';
    } else if (tamilDate.isMonthStart) {
      specialEventTitle = `${tamilDate.tamilMonth} Masappirappu (Month Ingress)`;
      specialEventTitleTamil = `${tamilDate.tamilMonthTamil} மாதப்பிறப்பு`;
      specialEventDescription = `Auspicious first day of the Tamil month of ${tamilDate.tamilMonthTamil} (${tamilDate.tamilMonth}). Surya Bhagavan transitions into ${raw.sunRashi?.name ?? 'Sign'} (Sankranti).`;
    }

    return {
      date: dateStr,
      tithiNumber,
      tithiName,
      paksha,
      nakshatraNumber,
      nakshatraName,
      tamilMonth: tamilDate.tamilMonth,
      tamilMonthTamil: tamilDate.tamilMonthTamil,
      tamilDay: tamilDate.tamilDay,
      tamilYear: tamilDate.tamilYear,
      isMonthStart: tamilDate.isMonthStart,
      isEkadashi,
      ekadashiName,
      isThiruvonam,
      isPurattasiSaturday,
      isPurattasiSecondSaturday,
      purattasiSaturdayIndex,
      isGokulashtami,
      gokulashtamiNote: '4-Year Function: Celebrated in 2025 • Next in 2029',
      isPerumalSpecialDay,
      specialEventTitle,
      specialEventTitleTamil,
      specialEventDescription,
      rahuKalam: (raw.rahuKalamStart && raw.rahuKalamEnd)
        ? {
            start: new Date(raw.rahuKalamStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            end: new Date(raw.rahuKalamEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }
        : undefined,
      yamagandaKalam: (raw.yamagandaKalam?.start && raw.yamagandaKalam?.end)
        ? {
            start: new Date(raw.yamagandaKalam.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            end: new Date(raw.yamagandaKalam.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }
        : undefined,
    };
  },

  /**
   * Get the dual Tamil month span for any Gregorian month (e.g. September -> "Avani – Purattasi")
   */
  getMonthTamilSpan(yearMonth: string, monthData: Record<string, DailyPanchangamData>) {
    const dates = Object.keys(monthData).sort();
    if (dates.length === 0) {
      return {
        titleEn: '',
        titleTamil: '',
        subtitle: '',
      };
    }

    const firstDay = monthData[dates[0]];
    const lastDay = monthData[dates[dates.length - 1]];

    if (!firstDay || !lastDay) {
      return { titleEn: '', titleTamil: '', subtitle: '' };
    }

    if (firstDay.tamilMonth === lastDay.tamilMonth) {
      return {
        titleEn: `${firstDay.tamilMonth} Month`,
        titleTamil: `${firstDay.tamilMonthTamil} மாதம்`,
        subtitle: `${firstDay.tamilMonthTamil} (${firstDay.tamilDay} – ${lastDay.tamilDay})`,
      };
    }

    // Two Tamil months span this Gregorian month
    const ingressDate = dates.find((d) => monthData[d]?.isMonthStart || monthData[d]?.tamilDay === 1);
    const ingressDayNum = ingressDate ? parseInt(ingressDate.split('-')[2], 10) : null;

    return {
      titleEn: `${firstDay.tamilMonth} – ${lastDay.tamilMonth}`,
      titleTamil: `${firstDay.tamilMonthTamil} – ${lastDay.tamilMonthTamil}`,
      subtitle: ingressDayNum
        ? `${firstDay.tamilMonthTamil} (1–${ingressDayNum - 1}) • ${lastDay.tamilMonthTamil} (${ingressDayNum}–${dates.length})`
        : `${firstDay.tamilMonthTamil} & ${lastDay.tamilMonthTamil}`,
    };
  },

  /**
   * Compute and cache all days of a month dynamically.
   * Checks localStorage first; if found, returns instantly.
   */
  async getMonthPanchangam(yearMonth: string, observer = TAMIL_NADU_OBSERVER): Promise<Record<string, DailyPanchangamData>> {
    const cacheKey = `${CACHE_PREFIX}${yearMonth}`;

    // 1. Try reading from localStorage cache
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          return JSON.parse(cached);
        }
      } catch (e) {
        console.warn('Panchangam cache read failed:', e);
      }
    }

    // 2. Compute dynamically for each day of the month
    const parts = yearMonth.split('-');
    const year = parseInt(parts[0], 10);
    const monthIndex = parseInt(parts[1], 10) - 1; // 0-11
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

    const monthMap: Record<string, DailyPanchangamData> = {};

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, monthIndex, d);
      const dayData = this.computeDayPanchangam(date, observer);
      monthMap[dayData.date] = dayData;
    }

    // 3. Cache to localStorage for instant subsequent loads
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(cacheKey, JSON.stringify(monthMap));
      } catch (e) {
        console.warn('Panchangam cache write failed:', e);
      }
    }

    return monthMap;
  },
};
