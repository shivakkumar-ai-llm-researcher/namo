'use client';
import React, { useState, useEffect, useMemo } from 'react';
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
} from 'lucide-react';
import { Card, Badge } from '../ui';
import { BalajiNamam } from '../ui/BalajiNamam';
import {
  tamilCalendarService,
  DailyPanchangamData,
} from '../../services/tamilCalendarService';
import { CommunityFunction } from '../../types';

interface TamilCalendarViewProps {
  functions?: CommunityFunction[];
  onSelectFunction?: (fn: CommunityFunction) => void;
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
}) => {
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
  const [filterCategory, setFilterCategory] = useState<'ALL' | 'PURATTASI' | 'GOKULASHTAMI' | 'EKADASHI'>('ALL');

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

  // 1. Fetch dynamic panchangam data for visible month (with localStorage caching)
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

  // 2. 4-Year Gokulaashdami cycle information
  const gokulashtamiCycle = useMemo(() => {
    try {
      return tamilCalendarService.getGokulashtamiCycleInfo(selectedYear);
    } catch {
      return null;
    }
  }, [selectedYear]);

  // 3. Purattasi Saturdays for the year
  const purattasiSaturdays = useMemo(() => {
    try {
      return tamilCalendarService.getPurattasiSaturdays(selectedYear);
    } catch {
      return [];
    }
  }, [selectedYear]);

  // 4. Identify the 2nd Saturday of Purattasi
  const secondSaturday = useMemo(() => {
    return purattasiSaturdays.find((s) => s.isSecond);
  }, [purattasiSaturdays]);

  // 5. Selected Day Panchangam Data
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

  // 6. Special days list for the visible month
  const specialDaysInMonth = useMemo(() => {
    const list = Object.values(monthData).filter((d) => d.isPerumalSpecialDay);
    return list.sort((a, b) => a.date.localeCompare(b.date));
  }, [monthData]);

  // Filtered list
  const filteredSpecialDays = useMemo(() => {
    switch (filterCategory) {
      case 'PURATTASI':
        return specialDaysInMonth.filter((d) => d.isPurattasiSaturday);
      case 'GOKULASHTAMI':
        return specialDaysInMonth.filter((d) => d.isGokulashtami);
      case 'EKADASHI':
        return specialDaysInMonth.filter((d) => d.isEkadashi);
      default:
        return specialDaysInMonth;
    }
  }, [specialDaysInMonth, filterCategory]);

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
      isSecondSat?: boolean;
      isPurattasiSat?: boolean;
      isGokula?: boolean;
      isEkadashi?: boolean;
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
        isSecondSat: dayData?.isPurattasiSecondSaturday,
        isPurattasiSat: dayData?.isPurattasiSaturday,
        isGokula: dayData?.isGokulashtami,
        isEkadashi: dayData?.isEkadashi,
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

  // Current primary Tamil month active
  const primaryTamilMonth = useMemo(() => {
    try {
      const midDate = `${currentYearMonth}-15`;
      if (monthData[midDate]) {
        return `${monthData[midDate].tamilMonthTamil} மாதம் (${monthData[midDate].tamilMonth})`;
      }
      const tDate = tamilCalendarService.getTamilDate(new Date(selectedYear, selectedMonthNum - 1, 15));
      return `${tDate.tamilMonthTamil} மாதம் (${tDate.tamilMonth})`;
    } catch {
      return '';
    }
  }, [currentYearMonth, monthData, selectedYear, selectedMonthNum]);

  return (
    <div className="space-y-6">
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
            <h3 className="text-base font-bold" style={{ color: 'var(--primary)' }}>
              {MONTH_NAMES_EN[selectedMonthNum - 1]} {selectedYear}
            </h3>
            <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mt-0.5">
              {primaryTamilMonth}
            </p>
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
                    : 'transparent',
                  borderWidth: isToday || isSecondSat || isGokula || isSelected ? '1.5px' : '1px',
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

                {/* Tamil Solar Day */}
                {cell.tamilDay && (
                  <span
                    className="text-[9px] font-semibold leading-tight mt-0.5"
                    style={{
                      color: isSelected
                        ? '#FEF3C7'
                        : isSecondSat
                        ? '#B45309'
                        : 'var(--text-tertiary)',
                    }}
                  >
                    {cell.tamilDay}
                  </span>
                )}

                {/* Auspicious Dots Row */}
                <div className="flex items-center gap-0.5 mt-0.5 h-1.5">
                  {isSecondSat && (
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-sm" />
                  )}
                  {!isSecondSat && isPurattasiSat && (
                    <div className="w-1 h-1 rounded-full bg-amber-600" />
                  )}
                  {isGokula && (
                    <div className="w-1 h-1 rounded-full bg-emerald-500" />
                  )}
                  {(isEkadashi || (isSpecial && !isSecondSat && !isPurattasiSat && !isGokula)) && (
                    <div
                      className="w-1 h-1 rounded-full"
                      style={{ backgroundColor: isSelected ? '#FFFFFF' : 'var(--primary)' }}
                    />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div
          className="flex flex-wrap items-center justify-around py-2.5 px-4 border-t text-xs"
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
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Gokulaashdami</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--primary)' }} />
            <span>Ekadashi / Utsavam</span>
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
                {selectedDayInfo.tamilMonthTamil} {selectedDayInfo.tamilDay} ({selectedDayInfo.tamilMonth})
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
                className="p-4 rounded-xl border-l-4 mt-2"
                style={{
                  backgroundColor: selectedDayInfo.isPurattasiSecondSaturday
                    ? 'rgba(217, 119, 6, 0.1)'
                    : selectedDayInfo.isGokulashtami
                    ? 'rgba(16, 185, 129, 0.1)'
                    : 'var(--primary-light)',
                  borderLeftColor: selectedDayInfo.isPurattasiSecondSaturday
                    ? '#F59E0B'
                    : selectedDayInfo.isGokulashtami
                    ? '#10B981'
                    : 'var(--primary)',
                }}
              >
                <h5 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                  {selectedDayInfo.specialEventTitle}
                </h5>
                <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mt-0.5">
                  {selectedDayInfo.specialEventTitleTamil}
                </p>
                <p className="text-xs text-stone-600 dark:text-stone-300 mt-2 leading-relaxed">
                  {selectedDayInfo.specialEventDescription}
                </p>
              </div>
            ) : (
              <p className="text-xs italic" style={{ color: 'var(--text-tertiary)' }}>
                Auspicious day for Balaji seva and prayer.
              </p>
            )}
          </div>
        )}
      </div>

      {/* 5. Special Days for Perumal in Visible Month with Filter */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
            Perumal Special Days ({MONTH_NAMES_EN[selectedMonthNum - 1]} {selectedYear})
          </h3>
          {loadingMonth && (
            <span className="text-xs animate-pulse" style={{ color: 'var(--primary)' }}>
              Calculating...
            </span>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'ALL', label: 'All Days' },
            { id: 'PURATTASI', label: '⭐ Purattasi Saturdays' },
            { id: 'GOKULASHTAMI', label: '🌟 Gokulaashdami' },
            { id: 'EKADASHI', label: 'Ekadashi Vratams' },
          ].map((cat) => {
            const isSel = filterCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setFilterCategory(cat.id as any)}
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer"
                style={{
                  backgroundColor: isSel ? 'var(--primary)' : 'var(--surface)',
                  color: isSel ? '#FFFFFF' : 'var(--text-secondary)',
                  borderColor: isSel ? 'var(--primary)' : 'var(--border)',
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
              className="rounded-xl p-6 text-center border"
              style={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border)',
                color: 'var(--text-tertiary)',
              }}
            >
              <p className="text-xs">
                No specific filtered Perumal special days in this month. Browse other months using the calendar above.
              </p>
            </div>
          ) : (
            filteredSpecialDays.map((day) => {
              const isSecondSat = day.isPurattasiSecondSaturday;
              const isGokula = day.isGokulashtami;

              return (
                <div
                  key={day.date}
                  onClick={() => setSelectedDate(day.date)}
                  className="rounded-xl p-4 border transition-all cursor-pointer hover:shadow-md"
                  style={{
                    backgroundColor: isSecondSat
                      ? 'rgba(217, 119, 6, 0.08)'
                      : isGokula
                      ? 'rgba(16, 185, 129, 0.08)'
                      : 'var(--surface)',
                    borderColor: isSecondSat ? '#F59E0B' : isGokula ? '#10B981' : 'var(--border)',
                    borderWidth: isSecondSat || isGokula ? '1.5px' : '1px',
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h5 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                          {day.specialEventTitle}
                        </h5>
                        {isSecondSat && (
                          <Badge label="ANNUAL FUNCTION" variant="warning" size="sm" />
                        )}
                        {isGokula && (
                          <Badge label="4-YEAR CYCLE" variant="success" size="sm" />
                        )}
                      </div>

                      <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                        {day.specialEventTitleTamil} • {day.tamilMonthTamil} {day.tamilDay}
                      </p>

                      <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                        {day.specialEventDescription}
                      </p>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold" style={{ color: 'var(--primary)' }}>
                        {new Date(day.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </p>
                      <p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                        {new Date(day.date).toLocaleDateString('en-IN', { weekday: 'short' })}
                      </p>
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
