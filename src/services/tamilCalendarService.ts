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

// Tamil Solar Month Names (approx start dates)
export const TAMIL_MONTHS = [
  { name: 'Chithirai', nameTamil: 'சித்திரை', startMonth: 3, startDay: 14 },
  { name: 'Vaikasi', nameTamil: 'வைகாசி', startMonth: 4, startDay: 15 },
  { name: 'Aani', nameTamil: 'ஆனி', startMonth: 5, startDay: 15 },
  { name: 'Aadi', nameTamil: 'ஆடி', startMonth: 6, startDay: 16 },
  { name: 'Avani', nameTamil: 'ஆவணி', startMonth: 7, startDay: 17 },
  { name: 'Purattasi', nameTamil: 'புரட்டாசி', startMonth: 8, startDay: 17 },
  { name: 'Aippasi', nameTamil: 'ஐப்பசி', startMonth: 9, startDay: 17 },
  { name: 'Karthigai', nameTamil: 'கார்த்திகை', startMonth: 10, startDay: 16 },
  { name: 'Margazhi', nameTamil: 'மார்கழி', startMonth: 11, startDay: 16 },
  { name: 'Thai', nameTamil: 'தை', startMonth: 0, startDay: 14 },
  { name: 'Masi', nameTamil: 'மாசி', startMonth: 1, startDay: 13 },
  { name: 'Panguni', nameTamil: 'பங்குனி', startMonth: 2, startDay: 14 },
];

const CACHE_PREFIX = 'namo_panchangam_v1_';

export const tamilCalendarService = {
  /**
   * Convert Gregorian Date to Tamil Month and Day
   */
  getTamilDate(date: Date) {
    const year = date.getFullYear();
    const day = date.getDate();

    let tamilMonthObj = TAMIL_MONTHS[TAMIL_MONTHS.length - 1];
    let tamilDay = day;

    for (let i = 0; i < TAMIL_MONTHS.length; i++) {
      const tm = TAMIL_MONTHS[i];
      const nextTm = TAMIL_MONTHS[(i + 1) % TAMIL_MONTHS.length];

      const start = new Date(year, tm.startMonth, tm.startDay);
      const endYear = tm.startMonth === 11 ? year + 1 : year;
      const end = new Date(endYear, nextTm.startMonth, nextTm.startDay);

      if (date >= start && date < end) {
        tamilMonthObj = tm;
        const diffTime = Math.abs(date.getTime() - start.getTime());
        tamilDay = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
        break;
      }
    }

    return {
      tamilMonth: tamilMonthObj.name,
      tamilMonthTamil: tamilMonthObj.nameTamil,
      tamilDay,
      tamilYear: 'குரோதி (Krodhi)',
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
  getPurattasiSaturdays(year: number) {
    const purattasiStart = new Date(year, 8, 17); // Sep 17
    const purattasiEnd = new Date(year, 9, 17);   // Oct 17

    const saturdays: {
      date: string;
      index: number;
      isSecond: boolean;
      title: string;
      titleTamil: string;
      description: string;
    }[] = [];

    const cur = new Date(purattasiStart);
    let saturdayIndex = 1;

    while (cur <= purattasiEnd) {
      if (cur.getDay() === 6) {
        const yyyy = cur.getFullYear();
        const mm = String(cur.getMonth() + 1).padStart(2, '0');
        const dd = String(cur.getDate()).padStart(2, '0');
        const dateStr = `${yyyy}-${mm}-${dd}`;
        const isSecond = saturdayIndex === 2;

        saturdays.push({
          date: dateStr,
          index: saturdayIndex,
          isSecond,
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
    const raw = getPanchangam(date, observer);
    const tamilDate = this.getTamilDate(date);

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
      const allSats = this.getPurattasiSaturdays(yyyy);
      const matched = allSats.find((s) => s.date === dateStr);
      if (matched) {
        purattasiSaturdayIndex = matched.index;
        isPurattasiSecondSaturday = matched.isSecond;
      }
    }

    // 5. Detect Gokulashtami / Sri Krishna Jayanthi
    const hasGokulaFestival = raw.festivals?.some(
      (f: any) =>
        f.name?.toLowerCase().includes('krishna') ||
        f.name?.toLowerCase().includes('gokul') ||
        f.name?.toLowerCase().includes('janmashtami')
    );
    const isAvaniAshtami = tamilDate.tamilMonth === 'Avani' && (tithiNumber === 23 || tithiNumber === 8);
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
      hasNarasimhaJayanti;

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
    } else if (isGokulashtami) {
      specialEventTitle = 'Gokulaashdami (4-Year Cycle Function)';
      specialEventTitleTamil = 'கோகுலாஷ்டமி (4 ஆண்டு சுழற்சி திருவிழா)';
      specialEventDescription = 'Celebrated in 2025 • Next Grand Celebration is coming in 2029! Sri Krishna Jayanthi pooja and uri-yadi utsavam.';
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
