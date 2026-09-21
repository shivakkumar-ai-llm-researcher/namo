'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Gift,
  CheckCircle2,
  CalendarDays,
  Star,
  Clock,
  Flame,
  RefreshCw,
  Bell,
  Radio,
} from 'lucide-react';
import { Card, Badge } from '../ui';
import { BalajiNamam } from '../ui/BalajiNamam';
import {
  tamilCalendarService,
  DailyPanchangamData,
} from '../../services/tamilCalendarService';
import {
  calendarScraperService,
  CalendarSyncResult,
  ScrapedFestival,
} from '../../services/calendarScraperService';
import { useAuth } from '../../hooks/useAuth';
import { CommunityFunction } from '../../types';

interface TamilCalendarViewProps {
  functions?: CommunityFunction[];
  onSelectFunction?: (fn: CommunityFunction) => void;
  isAdmin?: boolean;
}

const MONTH_NAMES_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAYS = [
  { en: 'Sun', ta: 'ஞா' },
  { en: 'Mon', ta: 'தி' },
  { en: 'Tue', ta: 'செ' },
  { en: 'Wed', ta: 'பு' },
  { en: 'Thu', ta: 'வி' },
  { en: 'Fri', ta: 'வெ' },
  { en: 'Sat', ta: 'சனி' },
];

export const TamilCalendarView: React.FC<TamilCalendarViewProps> = ({
  functions = [],
  onSelectFunction,
  isAdmin: propIsAdmin,
}) => {
  const pathname = usePathname();
  const { isAdmin: authIsAdmin, profile } = useAuth();

  // Show Auto-Sync status bar and manual 'Sync Now' only for Admin logins; hide completely for visitor portal and devotee logins
  const isVisitor = propIsAdmin === false || (pathname ? pathname.startsWith('/visitor') : false) || profile?.role === 'visitor';
  const showAdminSyncBar = propIsAdmin === true || (!isVisitor && authIsAdmin);

  const today = useMemo(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }, []);

  const [selectedDate, setSelectedDate] = useState<string>(today);
  const [currentYearMonth, setCurrentYearMonth] = useState<string>(today.substring(0, 7));
  const [monthData, setMonthData] = useState<Record<string, DailyPanchangamData>>({});
  const [loadingMonth, setLoadingMonth] = useState<boolean>(true);
  const [filterCategory, setFilterCategory] = useState<'ALL' | 'PERUMAL' | 'PURATTASI' | 'GOKULASHTAMI' | 'EKADASHI' | 'THIRUVONAM'>('ALL');
  const [syncResult, setSyncResult] = useState<CalendarSyncResult | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string>('');

  const selectedYear = parseInt(currentYearMonth.split('-')[0], 10) || new Date().getFullYear();
  const selectedMonthNum = parseInt(currentYearMonth.split('-')[1], 10) || (new Date().getMonth() + 1);

  // Month navigation handlers
  const handlePrevMonth = () => {
    const [y, m] = currentYearMonth.split('-').map(Number);
    const prev = new Date(y, m - 2, 1);
    const newY = prev.getFullYear();
    const newM = String(prev.getMonth() + 1).padStart(2, '0');
    setCurrentYearMonth(`${newY}-${newM}`);
  };

  const handleNextMonth = () => {
    const [y, m] = currentYearMonth.split('-').map(Number);
    const next = new Date(y, m, 1);
    const newY = next.getFullYear();
    const newM = String(next.getMonth() + 1).padStart(2, '0');
    setCurrentYearMonth(`${newY}-${newM}`);
  };

  const handleToday = () => {
    setCurrentYearMonth(today.substring(0, 7));
    setSelectedDate(today);
  };

  // 1. Automated 8-Hour Sync from SrirangamInfo & TamilCalendarz
  const loadSyncData = async (force = false) => {
    setIsSyncing(true);
    try {
      const data = await calendarScraperService.getOrSyncCalendarData(force);
      setSyncResult(data);
      const status = calendarScraperService.getSyncStatus(data.lastSyncedAt);
      setSyncStatusMsg(status.text);

      // Refresh current month's panchangam to reflect newly scraped data
      const updated = await tamilCalendarService.getMonthPanchangam(currentYearMonth);
      setMonthData(updated);
    } catch (err) {
      console.warn('Failed to load sync data:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    loadSyncData(false);
  }, []);

  // 2. Fetch dynamic panchangam data for visible month (with localStorage caching)
  useEffect(() => {
    let isMounted = true;
    async function loadMonth() {
      setLoadingMonth(true);
      try {
        const data = await tamilCalendarService.getMonthPanchangam(currentYearMonth);
        if (isMounted) {
          setMonthData(data);
        }
      } catch (e) {
        console.warn('Failed to load month panchangam:', e);
      } finally {
        if (isMounted) {
          setLoadingMonth(false);
        }
      }
    }

    loadMonth();
    return () => {
      isMounted = false;
    };
  }, [currentYearMonth]);

  // 3. 4-Year Gokulaashdami cycle information
  const gokulashtamiCycle = useMemo(() => {
    try {
      return tamilCalendarService.getGokulashtamiCycleInfo(selectedYear);
    } catch {
      return null;
    }
  }, [selectedYear]);

  // 4. Purattasi Saturdays for the year
  const purattasiSaturdays = useMemo(() => {
    try {
      return tamilCalendarService.getPurattasiSaturdays(selectedYear);
    } catch {
      return [];
    }
  }, [selectedYear]);

  // 5. Identify the 2nd Saturday of Purattasi
  const secondSaturday = useMemo(() => {
    return purattasiSaturdays.find((s) => s.isSecond);
  }, [purattasiSaturdays]);

  // 6. Selected Day Panchangam Data
  const selectedDayInfo = useMemo(() => {
    if (monthData[selectedDate]) {
      return monthData[selectedDate];
    }
    try {
      const d = new Date(selectedDate);
      if (isNaN(d.getTime())) return null;
      return tamilCalendarService.computeDayPanchangam(d);
    } catch (e) {
      console.warn('Failed to compute selected day panchangam:', e);
      return null;
    }
  }, [monthData, selectedDate]);

  // 7. Special days list for the visible month
  const specialDaysInMonth = useMemo(() => {
    const list = Object.values(monthData).filter((d) => d.isPerumalSpecialDay);
    return list.sort((a, b) => a.date.localeCompare(b.date));
  }, [monthData]);

  // 8. Filtered list based on category
  const filteredSpecialDays = useMemo(() => {
    switch (filterCategory) {
      case 'PERUMAL':
        return specialDaysInMonth.filter((d) => d.isPerumalSpecialDay);
      case 'PURATTASI':
        return specialDaysInMonth.filter((d) => d.isPurattasiSaturday);
      case 'GOKULASHTAMI':
        return specialDaysInMonth.filter((d) => d.isGokulashtami);
      case 'EKADASHI':
        return specialDaysInMonth.filter((d) => d.isEkadashi);
      case 'THIRUVONAM':
        return specialDaysInMonth.filter((d) => d.isThiruvonam);
      default:
        return specialDaysInMonth;
    }
  }, [specialDaysInMonth, filterCategory]);

  // 9. Active / Upcoming Perumal Special Day for Notification Alert
  const activeVishnuDay = useMemo(() => {
    if (selectedDayInfo?.isPerumalSpecialDay) {
      return selectedDayInfo;
    }
    if (monthData[today]?.isPerumalSpecialDay) {
      return monthData[today];
    }
    const upcoming = Object.values(monthData)
      .filter((d) => d.isPerumalSpecialDay && d.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date))[0];
    if (upcoming) return upcoming;

    if (syncResult?.upcomingVishnuDay) {
      return syncResult.upcomingVishnuDay as any;
    }
    return null;
  }, [selectedDayInfo, monthData, today, syncResult]);

  // Calendar Grid Computations
  const calendarGrid = useMemo(() => {
    const y = selectedYear;
    const m = selectedMonthNum;
    const firstDayIndex = new Date(y, m - 1, 1).getDay(); // 0 = Sun, 1 = Mon ...
    const totalDaysInMonth = new Date(y, m, 0).getDate();
    const totalDaysInPrevMonth = new Date(y, m - 1, 0).getDate();

    const cells: Array<{
      dateStr: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      tamilDay?: number;
      tamilMonthTamil?: string;
      isMonthStart?: boolean;
      isSecondSat?: boolean;
      isPurattasiSat?: boolean;
      isGokula?: boolean;
      isEkadashi?: boolean;
      isThiruvonam?: boolean;
      isSpecial?: boolean;
      isSaturday?: boolean;
    }> = [];

    // Prev month padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = totalDaysInPrevMonth - i;
      const prevM = m === 1 ? 12 : m - 1;
      const prevY = m === 1 ? y - 1 : y;
      const dateStr = `${prevY}-${String(prevM).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({
        dateStr,
        dayNumber: d,
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let d = 1; d <= totalDaysInMonth; d++) {
      const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayData = monthData[dateStr];
      const isSat = new Date(y, m - 1, d).getDay() === 6;
      cells.push({
        dateStr,
        dayNumber: d,
        isCurrentMonth: true,
        tamilDay: dayData?.tamilDay,
        tamilMonthTamil: dayData?.tamilMonthTamil,
        isMonthStart: dayData?.isMonthStart || dayData?.tamilDay === 1,
        isSecondSat: dayData?.isPurattasiSecondSaturday,
        isPurattasiSat: dayData?.isPurattasiSaturday,
        isGokula: dayData?.isGokulashtami,
        isEkadashi: dayData?.isEkadashi,
        isThiruvonam: dayData?.isThiruvonam,
        isSpecial: dayData?.isPerumalSpecialDay,
        isSaturday: isSat,
      });
    }

    // Next month padding to fill weeks (rows of 7)
    const remainder = cells.length % 7;
    if (remainder !== 0) {
      const nextDaysNeeded = 7 - remainder;
      for (let d = 1; d <= nextDaysNeeded; d++) {
        const nextM = m === 12 ? 1 : m + 1;
        const nextY = m === 12 ? y + 1 : y;
        const dateStr = `${nextY}-${String(nextM).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        cells.push({
          dateStr,
          dayNumber: d,
          isCurrentMonth: false,
        });
      }
    }

    return cells;
  }, [selectedYear, selectedMonthNum, monthData]);

  // Dual Tamil months spanning this Gregorian month (e.g. "ஆவணி – புரட்டாசி (Avani – Purattasi)")
  const monthTamilSpan = useMemo(() => {
    try {
      return tamilCalendarService.getMonthTamilSpan(currentYearMonth, monthData);
    } catch {
      return { titleEn: '', titleTamil: '', subtitle: '' };
    }
  }, [currentYearMonth, monthData]);

  return (
    <div className="space-y-6">
      {/* Automated 8-Hour Sync Status Bar (SrirangamInfo & TamilCalendarz) - Admin Only */}
      {showAdminSyncBar && (
        <div
          className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 rounded-2xl border transition-all"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border)',
          }}
        >
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
              <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                SrirangamInfo & TamilCalendarz Auto-Sync
              </span>
              <span className="text-[11px] text-stone-500 dark:text-stone-400">
                {syncStatusMsg || 'Automated background sync every 8 hours'}
              </span>
            </div>
          </div>

          <button
            onClick={() => loadSyncData(true)}
            disabled={isSyncing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer disabled:opacity-50"
            style={{
              backgroundColor: 'var(--surface-variant)',
              borderColor: 'var(--border)',
              color: 'var(--primary)',
            }}
            title="Run instant synchronization from SrirangamInfo"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
          </button>
        </div>
      )}

      {/* Perumal Sacred Days Live Notification Alert Card */}
      {activeVishnuDay && (
        <div
          className="rounded-2xl p-5 text-white relative overflow-hidden shadow-lg border-2"
          style={{
            background: 'linear-gradient(135deg, #450A0A 0%, #7F1D1D 50%, #78350F 100%)',
            borderColor: '#F59E0B',
          }}
        >
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-black/30 border border-yellow-400/80 shadow-md">
                <BalajiNamam size={26} />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="inline-flex items-center rounded-full text-[10px] font-extrabold px-2.5 py-0.5 uppercase tracking-wider text-stone-900 shadow-sm"
                    style={{ backgroundColor: '#F59E0B' }}
                  >
                    PERUMAL SPECIAL DAY • பெருமாள் விசேஷ நாள்
                  </span>
                  {activeVishnuDay.date === today && (
                    <span className="bg-red-500 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-full animate-pulse shadow-sm">
                      TODAY • இன்று
                    </span>
                  )}
                  {activeVishnuDay.isPurattasiSecondSaturday && (
                    <span className="bg-amber-400 text-stone-900 font-extrabold text-[10px] px-2 py-0.5 rounded-full shadow-sm">
                      ANNUAL COMMUNITY FUNCTION
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-white mt-1">
                  {activeVishnuDay.specialEventTitle || (activeVishnuDay as any).title}
                </h3>
                <p className="text-xs font-semibold text-amber-200 mt-0.5">
                  {activeVishnuDay.specialEventTitleTamil || (activeVishnuDay as any).titleTamil}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setSelectedDate(activeVishnuDay.date);
                setCurrentYearMonth(activeVishnuDay.date.substring(0, 7));
              }}
              className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-bold transition-all shadow-md cursor-pointer self-start"
            >
              View on Calendar 📅
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
            <div className="bg-black/30 rounded-xl p-3 border border-amber-500/30">
              <p className="text-[11px] font-bold text-amber-300 uppercase tracking-wide">
                Sacred Date & Day • புனித நாள்
              </p>
              <p className="text-sm font-bold text-white mt-0.5">
                {new Date(activeVishnuDay.date).toLocaleDateString('en-IN', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
              <p className="text-xs text-amber-100/90 mt-1">
                {activeVishnuDay.tamilMonthTamil} {activeVishnuDay.tamilDay} ({activeVishnuDay.tamilMonth}) • {activeVishnuDay.tamilYear}
              </p>
            </div>

            <div className="bg-black/30 rounded-xl p-3 border border-amber-500/30">
              <p className="text-[11px] font-bold text-amber-300 uppercase tracking-wide">
                Spiritual Seva & Fasting • விரத வழிபாட்டு முறை
              </p>
              <p className="text-xs text-stone-100 leading-relaxed mt-0.5">
                {activeVishnuDay.specialEventDescription ||
                  (activeVishnuDay as any).descriptionEn ||
                  'Auspicious day for Lord Venkateswara Balaji worship, fasting, and reciting Sri Vishnu Sahasranamam.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 1. Sacred Purattasi 2nd Saturday Special Feature Banner */}
      <div
        className="rounded-2xl p-5 text-white relative overflow-hidden shadow-lg border-2"
        style={{
          backgroundColor: '#851D1D',
          borderColor: '#F59E0B',
        }}
      >
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-black/20 border border-yellow-400">
            <BalajiNamam size={26} />
          </div>
          <span
            className="inline-flex items-center rounded-full text-xs font-bold px-3 py-1 text-stone-900"
            style={{ backgroundColor: '#F59E0B' }}
          >
            ANNUAL COMMUNITY FUNCTION • ஆண்டு பெருவிழா
          </span>
        </div>

        <h2 className="text-xl font-bold text-white">
          Purattasi Sani Kiyamai (2nd Saturday)
        </h2>
        <p className="text-xs font-semibold text-amber-200 mt-0.5">
          புரட்டாசி 2-வது சனிக்கிழமை ஆண்டு பெருவிழா
        </p>

        <div className="bg-black/30 rounded-xl p-3.5 mt-3 border-l-4 border-amber-500">
          <p className="text-sm font-bold text-white flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-amber-400" />
            {secondSaturday
              ? new Date(secondSaturday.date).toLocaleDateString('en-IN', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })
              : '2nd Saturday of Purattasi Month'}
          </p>
          <p className="text-xs text-amber-100 mt-1">
            Tamil Date: புரட்டாசி சனிக்கிழமை • Sri Venkateswara Perumal Maha Utsavam
          </p>
        </div>

        <p className="text-xs text-white/90 mt-3 leading-relaxed">
          Special Thirumanjanam, Thaligai, Maavilakku Deepam, and Grand Annadhanam will be celebrated by our community.
        </p>
      </div>

      {/* 2. 4-Year Gokulaashdami Special Cycle Banner */}
      <div
        className="rounded-2xl p-5 border shadow-sm transition-colors"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: '#10B981',
          borderWidth: '1.5px',
        }}
      >
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">
              4-Year Function: Gokulaashdami
            </h3>
          </div>
          <Badge label="QUADRENNIAL" variant="success" size="sm" />
        </div>

        <p className="text-base font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
          கோகுலாஷ்டமி 4 வருடத்திற்கு ஒருமுறை பெருவிழா
        </p>

        <div className="mt-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Celebrated in 2025 (Completed)</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-300">
            <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <span>🌟 Next Grand Celebration is coming in 2029!</span>
          </div>
        </div>

        {/* 4-Year Stepper Timeline */}
        <div className="flex items-center justify-between mt-4 px-2">
          {[
            { yr: 2025, label: 'Celebrated', isPast: true },
            { yr: 2026, label: 'Year 1 (Active)', isCurrent: selectedYear === 2026 },
            { yr: 2027, label: 'Year 2', isFuture: true },
            { yr: 2028, label: 'Year 3', isFuture: true },
            { yr: 2029, label: 'Next Festival!', isTarget: true },
          ].map((step) => (
            <div key={step.yr} className="flex flex-col items-center flex-1">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                style={{
                  backgroundColor: step.isPast
                    ? '#15803D'
                    : step.isTarget
                    ? '#D97706'
                    : step.isCurrent
                    ? 'var(--primary)'
                    : 'var(--surface-variant)',
                  color: step.isPast || step.isTarget || step.isCurrent ? '#FFFFFF' : 'var(--text-secondary)',
                  border: step.isTarget ? '2px solid #F59E0B' : 'none',
                }}
              >
                {String(step.yr).substring(2)}
              </div>
              <span
                className="text-[10px] mt-1 text-center font-medium leading-tight"
                style={{
                  color: step.isTarget ? '#D97706' : 'var(--text-secondary)',
                  fontWeight: step.isTarget || step.isCurrent ? 700 : 400,
                }}
              >
                {step.yr}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Bespoke Native Tamil Calendar Grid */}
      <div
        className="rounded-2xl border overflow-hidden shadow-sm"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
        }}
      >
        {/* Calendar Month Navigation Header */}
        <div
          className="px-4 py-3 flex items-center justify-between border-b"
          style={{
            backgroundColor: 'var(--surface-variant)',
            borderColor: 'var(--border)',
          }}
        >
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
            style={{ color: 'var(--primary)' }}
            aria-label="Previous Month"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="text-center">
            <h3 className="text-base sm:text-lg font-bold" style={{ color: 'var(--primary)' }}>
              {MONTH_NAMES_EN[selectedMonthNum - 1]} {selectedYear}
            </h3>
            <div className="flex items-center justify-center gap-1.5 mt-0.5 flex-wrap">
              <span className="text-xs sm:text-sm font-bold text-amber-600 dark:text-amber-400">
                {monthTamilSpan.titleTamil || 'தமிழ் மாதம்'}
              </span>
              {monthTamilSpan.titleEn && (
                <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400">
                  ({monthTamilSpan.titleEn})
                </span>
              )}
            </div>
            {monthTamilSpan.subtitle && (
              <p className="text-[10px] font-medium text-stone-500 dark:text-stone-400 mt-0.5">
                {monthTamilSpan.subtitle}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToday}
              className="px-3 py-1 rounded-lg text-xs font-bold border transition-colors hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
              style={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border)',
                color: 'var(--primary)',
              }}
            >
              Today
            </button>
            <button
              onClick={handleNextMonth}
              className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
              style={{ color: 'var(--primary)' }}
              aria-label="Next Month"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Weekday Labels Header */}
        <div
          className="grid grid-cols-7 border-b py-2 text-center text-xs font-bold"
          style={{
            backgroundColor: 'var(--surface-variant)',
            borderColor: 'var(--border)',
          }}
        >
          {WEEKDAYS.map((w, idx) => (
            <div key={w.en} className="flex flex-col items-center">
              <span style={{ color: idx === 6 ? '#D97706' : 'var(--text-secondary)' }}>
                {w.en}
              </span>
              <span
                className="text-[10px] mt-0.5"
                style={{ color: idx === 6 ? '#D97706' : 'var(--text-tertiary)' }}
              >
                {w.ta}
              </span>
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="p-2 grid grid-cols-7 gap-1">
          {calendarGrid.map((cell, idx) => {
            const isSelected = cell.dateStr === selectedDate;
            const isToday = cell.dateStr === today;
            const isSecondSat = cell.isSecondSat;
            const isPurattasiSat = cell.isPurattasiSat;
            const isGokula = cell.isGokula;
            const isEkadashi = cell.isEkadashi;
            const isSpecial = cell.isSpecial;

            if (!cell.isCurrentMonth) {
              return (
                <div
                  key={cell.dateStr + '-' + idx}
                  className="aspect-square flex items-center justify-center opacity-25 text-xs select-none"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  {cell.dayNumber}
                </div>
              );
            }

            // Cell styling
            let cellBg = 'transparent';
            let textColor = 'var(--text-primary)';
            if (isSelected) {
              cellBg = isSecondSat ? '#851D1D' : 'var(--primary)';
              textColor = '#FFFFFF';
            } else if (isSecondSat) {
              cellBg = 'rgba(217, 119, 6, 0.15)';
            } else if (isGokula) {
              cellBg = 'rgba(16, 185, 129, 0.15)';
            } else if (isSpecial) {
              cellBg = 'rgba(217, 119, 6, 0.08)';
            }

            return (
              <button
                key={cell.dateStr}
                onClick={() => setSelectedDate(cell.dateStr)}
                className="aspect-square rounded-xl flex flex-col items-center justify-center p-1 transition-all relative border cursor-pointer"
                style={{
                  backgroundColor: cellBg,
                  borderColor: isToday && !isSelected
                    ? 'var(--primary)'
                    : isSecondSat
                    ? '#F59E0B'
                    : isGokula
                    ? '#10B981'
                    : isSelected
                    ? 'var(--primary)'
                    : isSpecial
                    ? '#F59E0B'
                    : 'transparent',
                  borderWidth: isToday || isSecondSat || isGokula || isSelected || isSpecial ? '1.5px' : '1px',
                }}
              >
                {/* Gregorian Day */}
                <span
                  className="text-xs md:text-sm leading-tight"
                  style={{
                    color: textColor,
                    fontWeight: isSelected || cell.isSaturday || isSpecial ? 700 : 500,
                  }}
                >
                  {cell.dayNumber}
                </span>

                {/* Tamil Solar Day & Month Start Badge */}
                {cell.tamilDay && (
                  <div className="flex items-center gap-0.5 mt-0.5 leading-tight">
                    {cell.isMonthStart ? (
                      <span
                        className="text-[8px] font-bold px-1 rounded-sm uppercase tracking-tighter"
                        style={{
                          backgroundColor: isSelected ? 'rgba(255,255,255,0.25)' : 'rgba(217, 119, 6, 0.18)',
                          color: isSelected ? '#FFFFFF' : '#D97706',
                          border: isSelected ? '1px solid rgba(255,255,255,0.4)' : '1px solid rgba(217, 119, 6, 0.3)',
                        }}
                      >
                        {cell.tamilMonthTamil?.slice(0, 3)} 1
                      </span>
                    ) : (
                      <span
                        className="text-[9px] font-semibold leading-tight"
                        style={{
                          color: isSelected
                            ? '#FEF3C7'
                            : isSecondSat
                            ? '#B45309'
                            : isSpecial
                            ? '#B45309'
                            : 'var(--text-tertiary)',
                        }}
                      >
                        {cell.tamilDay}
                      </span>
                    )}
                  </div>
                )}

                {/* Auspicious Dots Row */}
                <div className="flex items-center gap-0.5 mt-0.5 h-1.5">
                  {isSecondSat && (
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-sm" title="2nd Purattasi Saturday" />
                  )}
                  {!isSecondSat && isPurattasiSat && (
                    <div className="w-1 h-1 rounded-full bg-amber-600" title="Purattasi Saturday" />
                  )}
                  {isGokula && (
                    <div className="w-1 h-1 rounded-full bg-emerald-500" title="Gokulaashdami" />
                  )}
                  {isEkadashi && (
                    <div className="w-1 h-1 rounded-full bg-purple-500" title="Ekadashi" />
                  )}
                  {cell.isThiruvonam && (
                    <div className="w-1 h-1 rounded-full bg-amber-400" title="Thiruvonam Nakshatra" />
                  )}
                  {(isSpecial && !isSecondSat && !isPurattasiSat && !isGokula && !isEkadashi && !cell.isThiruvonam) && (
                    <div
                      className="w-1 h-1 rounded-full"
                      style={{ backgroundColor: isSelected ? '#FFFFFF' : 'var(--primary)' }}
                      title="Perumal Sacred Day"
                    />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div
          className="flex flex-wrap items-center justify-around py-2.5 px-4 border-t text-xs gap-2"
          style={{
            backgroundColor: 'var(--surface-variant)',
            borderColor: 'var(--border)',
            color: 'var(--text-secondary)',
          }}
        >
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>Purattasi 2nd Sat</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-amber-600" />
            <span>Purattasi Sat</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Gokulaashdami</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-purple-500" />
            <span>Ekadashi Vratam</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-amber-400" />
            <span>Thiruvonam / Perumal Day</span>
          </div>
        </div>
      </div>

      {/* 4. Daily Dynamic Panchangam Card for Selected Date */}
      <div
        className="rounded-2xl p-5 border shadow-sm"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              Selected Date Panchangam
            </p>
            <h4 className="text-lg font-bold mt-0.5" style={{ color: 'var(--primary)' }}>
              {new Date(selectedDate).toLocaleDateString('en-IN', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </h4>
            {selectedDayInfo && (
              <p className="text-sm font-semibold text-amber-600 dark:text-amber-400 mt-0.5">
                {selectedDayInfo.tamilMonthTamil} {selectedDayInfo.tamilDay} ({selectedDayInfo.tamilMonth}) • {selectedDayInfo.tamilYear}
              </p>
            )}
          </div>
          <div
            className="p-2 rounded-xl"
            style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}
          >
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        {selectedDayInfo && (
          <div className="mt-4 space-y-3">
            {/* Tithi, Nakshatra, Rahu Kalam Chips */}
            <div className="flex flex-wrap gap-2 text-xs font-semibold">
              <div
                className="px-3 py-1.5 rounded-lg border"
                style={{
                  backgroundColor: 'var(--surface-variant)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)',
                }}
              >
                Tithi: {selectedDayInfo.paksha} {selectedDayInfo.tithiName}
              </div>
              <div
                className="px-3 py-1.5 rounded-lg border"
                style={{
                  backgroundColor: 'var(--surface-variant)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)',
                }}
              >
                Star: {selectedDayInfo.nakshatraName}
              </div>
              {selectedDayInfo.rahuKalam && (
                <div
                  className="px-3 py-1.5 rounded-lg border"
                  style={{
                    backgroundColor: 'var(--surface-variant)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  Rahu: {selectedDayInfo.rahuKalam.start} - {selectedDayInfo.rahuKalam.end}
                </div>
              )}
              {selectedDayInfo.yamagandaKalam && (
                <div
                  className="px-3 py-1.5 rounded-lg border"
                  style={{
                    backgroundColor: 'var(--surface-variant)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  Yamaganda: {selectedDayInfo.yamagandaKalam.start} - {selectedDayInfo.yamagandaKalam.end}
                </div>
              )}
            </div>

            {/* Special Event Description Banner */}
            {selectedDayInfo.isPerumalSpecialDay ? (
              <div
                className="p-4 sm:p-5 rounded-xl border mt-2 shadow-sm transition-all"
                style={{
                  backgroundColor: 'var(--surface-variant)',
                  borderColor: selectedDayInfo.isPurattasiSecondSaturday
                    ? '#D97706'
                    : selectedDayInfo.isGokulashtami
                    ? '#059669'
                    : selectedDayInfo.isThiruvonam
                    ? '#EA580C'
                    : selectedDayInfo.isEkadashi
                    ? '#7C3AED'
                    : '#851D1D',
                  borderLeftWidth: '6px',
                  borderLeftColor: selectedDayInfo.isPurattasiSecondSaturday
                    ? '#D97706'
                    : selectedDayInfo.isGokulashtami
                    ? '#059669'
                    : selectedDayInfo.isThiruvonam
                    ? '#EA580C'
                    : selectedDayInfo.isEkadashi
                    ? '#7C3AED'
                    : '#851D1D',
                }}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 shadow-xs"
                    style={{
                      backgroundColor: 'var(--primary)',
                      border: '1.5px solid #F59E0B',
                    }}
                  >
                    <BalajiNamam size={17} />
                  </div>
                  <h5
                    className="text-base sm:text-lg font-black tracking-tight"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {selectedDayInfo.specialEventTitle}
                  </h5>
                </div>
                <p
                  className="text-xs sm:text-sm font-bold mt-1.5"
                  style={{ color: 'var(--primary)' }}
                >
                  {selectedDayInfo.specialEventTitleTamil}
                </p>
                <p
                  className="text-xs sm:text-sm mt-1.5 leading-relaxed font-normal"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {selectedDayInfo.specialEventDescription}
                </p>
              </div>
            ) : (
              <p
                className="text-xs font-medium italic pt-1"
                style={{ color: 'var(--text-tertiary)' }}
              >
                Auspicious day for Balaji seva and prayer.
              </p>
            )}
          </div>
        )}
      </div>

      {/* 5. Special Days for Perumal in Visible Month with Filter */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <h3
              className="text-base sm:text-lg font-black tracking-tight"
              style={{ color: 'var(--text-primary)' }}
            >
              Perumal Special Days ({MONTH_NAMES_EN[selectedMonthNum - 1]} {selectedYear})
            </h3>
            <span
              className="px-2.5 py-0.5 rounded-full text-xs font-bold border"
              style={{
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary)',
                borderColor: 'var(--border)',
              }}
            >
              {filteredSpecialDays.length} {filteredSpecialDays.length === 1 ? 'Day' : 'Days'}
            </span>
          </div>
          {loadingMonth && (
            <span className="text-xs font-semibold animate-pulse" style={{ color: 'var(--gold)' }}>
              Calculating...
            </span>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'ALL', label: 'All Sacred Days (அனைத்தும்)' },
            { id: 'PERUMAL', label: '🛕 All Perumal Days (பெருமாள் விசேஷங்கள்)' },
            { id: 'PURATTASI', label: '⭐ Purattasi Saturdays (புரட்டாசி சனி)' },
            { id: 'GOKULASHTAMI', label: '🌟 Gokulaashdami (கோகுலாஷ்டமி)' },
            { id: 'EKADASHI', label: '✨ Ekadashi (ஏகாதசி விரதம்)' },
            { id: 'THIRUVONAM', label: '🔱 Thiruvonam (திருவோணம்)' },
          ].map((cat) => {
            const isSel = filterCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setFilterCategory(cat.id as any)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-xs"
                style={{
                  backgroundColor: isSel ? '#851D1D' : 'var(--surface)',
                  color: isSel ? '#FFFFFF' : 'var(--text-secondary)',
                  borderColor: isSel ? '#F59E0B' : 'var(--border)',
                  borderWidth: isSel ? '2px' : '1px',
                }}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* List of Special Days */}
        <div className="space-y-3">
          {filteredSpecialDays.length === 0 ? (
            <div
              className="rounded-2xl p-8 text-center border shadow-xs"
              style={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border)',
                color: 'var(--text-tertiary)',
              }}
            >
              <p className="text-sm font-semibold">
                No specific filtered Perumal special days in this month. Browse other months using the calendar above.
              </p>
            </div>
          ) : (
            filteredSpecialDays.map((day) => {
              const isSecondSat = day.isPurattasiSecondSaturday;
              const isGokula = day.isGokulashtami;
              const isThiru = day.isThiruvonam;
              const isEka = day.isEkadashi;
              const isSelected = selectedDate === day.date;

              // Left stripe accent
              let leftBorderColor = '#851D1D';
              if (isSecondSat) {
                leftBorderColor = '#D97706';
              } else if (day.isPurattasiSaturday) {
                leftBorderColor = '#B45309';
              } else if (isGokula) {
                leftBorderColor = '#059669';
              } else if (isThiru) {
                leftBorderColor = '#EA580C';
              } else if (isEka) {
                leftBorderColor = '#7C3AED';
              }

              const dateObj = new Date(day.date);
              const dayNum = dateObj.getDate();
              const monthStr = dateObj.toLocaleDateString('en-IN', { month: 'short' });
              const weekdayStr = dateObj.toLocaleDateString('en-IN', { weekday: 'short' });

              return (
                <div
                  key={day.date}
                  onClick={() => setSelectedDate(day.date)}
                  className="rounded-2xl p-4 sm:p-5 border transition-all cursor-pointer shadow-xs hover:shadow-md"
                  style={{
                    backgroundColor: 'var(--surface)',
                    borderColor: isSelected ? '#F59E0B' : 'var(--border)',
                    borderLeftColor: leftBorderColor,
                    borderLeftWidth: '6px',
                    borderWidth: isSelected ? '2px' : '1px',
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Content */}
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{
                            backgroundColor: 'var(--primary-light)',
                            border: '1px solid var(--border)',
                            color: 'var(--primary)',
                          }}
                        >
                          <BalajiNamam size={17} />
                        </div>
                        <h4
                          className="text-sm sm:text-base font-extrabold leading-snug"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {day.specialEventTitle}
                        </h4>

                        {isSecondSat && (
                          <span
                            className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold border"
                            style={{
                              backgroundColor: 'var(--primary-light)',
                              color: 'var(--primary)',
                              borderColor: 'var(--border)',
                            }}
                          >
                            ANNUAL COMMUNITY FUNCTION
                          </span>
                        )}
                        {isGokula && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-800">
                            4-YEAR CYCLE
                          </span>
                        )}
                        {isThiru && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-orange-100 text-orange-900 border border-orange-300 dark:bg-orange-950 dark:text-orange-200 dark:border-orange-800">
                            PERUMAL JANMA STAR
                          </span>
                        )}
                        {isEka && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-purple-100 text-purple-900 border border-purple-300 dark:bg-purple-950 dark:text-purple-200 dark:border-purple-800">
                            EKADASHI VRATAM
                          </span>
                        )}
                      </div>

                      <p
                        className="text-xs sm:text-sm font-bold"
                        style={{ color: 'var(--primary)' }}
                      >
                        {day.specialEventTitleTamil} • <span style={{ color: 'var(--text-secondary)' }} className="font-semibold">{day.tamilMonthTamil} {day.tamilDay}</span>
                      </p>

                      <p
                        className="text-xs sm:text-[13px] leading-relaxed font-normal"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {day.specialEventDescription}
                      </p>
                    </div>

                    {/* Tear-Off Calendar Date Stamp */}
                    <div
                      className="flex flex-col items-center justify-center rounded-xl border shadow-xs overflow-hidden flex-shrink-0 w-14 sm:w-16"
                      style={{
                        backgroundColor: 'var(--surface-variant)',
                        borderColor: 'var(--border)',
                      }}
                    >
                      <div className="w-full py-0.5 bg-[#851D1D] text-white text-[10px] font-extrabold tracking-wider uppercase text-center">
                        {monthStr}
                      </div>
                      <div
                        className="text-lg sm:text-xl font-black py-1 leading-none"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {dayNum}
                      </div>
                      <div
                        className="text-[10px] font-bold pb-1 text-center uppercase tracking-tight"
                        style={{ color: 'var(--text-tertiary)' }}
                      >
                        {weekdayStr}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
