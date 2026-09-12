import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme';
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
  const { t } = useTranslation();
  const { colors, spacing, borderRadius, fontSize, fontWeight, isDark } = useTheme();

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

  // 1. Fetch dynamic panchangam data for visible month (with AsyncStorage caching)
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
    return tamilCalendarService.getGokulashtamiCycleInfo(selectedYear);
  }, [selectedYear]);

  // 3. Purattasi Saturdays for the year
  const purattasiSaturdays = useMemo(() => {
    return tamilCalendarService.getPurattasiSaturdays(selectedYear);
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
    const d = new Date(selectedDate);
    if (isNaN(d.getTime())) return null;
    return tamilCalendarService.computeDayPanchangam(d);
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
    const midDate = `${currentYearMonth}-15`;
    if (monthData[midDate]) {
      return `${monthData[midDate].tamilMonthTamil} மாதம் (${monthData[midDate].tamilMonth})`;
    }
    const tDate = tamilCalendarService.getTamilDate(new Date(selectedYear, selectedMonthNum - 1, 15));
    return `${tDate.tamilMonthTamil} மாதம் (${tDate.tamilMonth})`;
  }, [currentYearMonth, monthData, selectedYear, selectedMonthNum]);

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
      {/* 1. Sacred Purattasi 2nd Saturday Special Feature Banner */}
      <View style={{ marginHorizontal: spacing.lg, marginTop: spacing.md }}>
        <Card
          variant="default"
          style={{
            backgroundColor: colors.primary,
            borderColor: '#F59E0B',
            borderWidth: 2,
            padding: spacing.md,
            overflow: 'hidden',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: 6 }}>
            <BalajiNamam size={26} variant="colored" />
            <View style={{ flex: 1 }}>
              <Badge
                label="ANNUAL COMMUNITY FUNCTION • ஆண்டு பெருவிழா"
                variant="warning"
                size="sm"
                style={{ alignSelf: 'flex-start', backgroundColor: '#F59E0B' }}
              />
            </View>
          </View>

          <Text style={{ color: '#FFFFFF', fontSize: fontSize.lg, fontWeight: fontWeight.bold, marginTop: 2 }}>
            Purattasi Sani Kiyamai (2nd Saturday)
          </Text>
          <Text style={{ color: '#FDE68A', fontSize: fontSize.xs, fontWeight: fontWeight.semibold, marginTop: 2 }}>
            புரட்டாசி 2-வது சனிக்கிழமை ஆண்டு பெருவிழா
          </Text>

          <View
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.25)',
              padding: spacing.sm,
              borderRadius: borderRadius.sm,
              marginTop: spacing.sm,
              borderLeftWidth: 3,
              borderLeftColor: '#F59E0B',
            }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: fontSize.sm, fontWeight: fontWeight.bold }}>
              {secondSaturday
                ? `📅 ${new Date(secondSaturday.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}`
                : `📅 2nd Saturday of Purattasi Month`}
            </Text>
            <Text style={{ color: '#FEF3C7', fontSize: fontSize.xs, marginTop: 2 }}>
              Tamil Date: புரட்டாசி சனிக்கிழமை • Sri Venkateswara Perumal Maha Utsavam
            </Text>
          </View>

          <Text style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: fontSize.xs, marginTop: spacing.sm, lineHeight: 18 }}>
            Special Thirumanjanam, Thaligai, Maavilakku Deepam, and Grand Annadhanam will be celebrated by our community.
          </Text>
        </Card>
      </View>

      {/* 2. 4-Year Gokulaashdami Special Cycle Banner */}
      <View style={{ marginHorizontal: spacing.lg, marginTop: spacing.md }}>
        <Card
          variant="default"
          style={{
            backgroundColor: isDark ? '#1C271E' : '#ECFDF5',
            borderColor: '#10B981',
            borderWidth: 1.5,
            padding: spacing.md,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="gift-outline" size={18} color="#059669" />
              <Text style={{ color: isDark ? '#A7F3D0' : '#065F46', fontSize: fontSize.sm, fontWeight: fontWeight.bold }}>
                4-YEAR FUNCTION: GOKULAASHDAMI
              </Text>
            </View>
            <Badge label="QUADRENNIAL" variant="success" size="sm" />
          </View>

          <Text style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: fontWeight.bold, marginTop: 4 }}>
            கோகுலாஷ்டமி 4 வருடத்திற்கு ஒருமுறை பெருவிழா
          </Text>

          <View style={{ marginTop: spacing.sm, backgroundColor: isDark ? '#152E20' : '#DCFCE7', padding: spacing.sm, borderRadius: borderRadius.sm }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="checkmark-circle" size={16} color="#15803D" />
              <Text style={{ color: isDark ? '#FEF3C7' : '#92400E', fontSize: fontSize.xs, fontWeight: fontWeight.bold }}>
                Celebrated in 2025 (Completed)
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
              <Ionicons name="sparkles" size={16} color="#D97706" />
              <Text style={{ color: isDark ? '#FDE68A' : '#B45309', fontSize: fontSize.xs, fontWeight: fontWeight.bold }}>
                🌟 Next Grand Celebration is coming in 2029!
              </Text>
            </View>
          </View>

          {/* 4-Year Stepper Timeline */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.md, paddingHorizontal: 4 }}>
            {[
              { yr: 2025, label: 'Celebrated', isPast: true },
              { yr: 2026, label: 'Year 1 (Active)', isCurrent: selectedYear === 2026 },
              { yr: 2027, label: 'Year 2', isFuture: true },
              { yr: 2028, label: 'Year 3', isFuture: true },
              { yr: 2029, label: 'Next Festival!', isTarget: true },
            ].map((step) => (
              <View key={step.yr} style={{ alignItems: 'center', flex: 1 }}>
                <View
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    backgroundColor: step.isPast
                      ? '#15803D'
                      : step.isTarget
                      ? '#D97706'
                      : step.isCurrent
                      ? colors.primary
                      : colors.surfaceVariant,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 2,
                    borderColor: step.isTarget ? '#F59E0B' : 'transparent',
                  }}
                >
                  <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: '700' }}>
                    {String(step.yr).substring(2)}
                  </Text>
                </View>
                <Text
                  style={{
                    color: step.isTarget ? '#D97706' : colors.textSecondary,
                    fontSize: 9,
                    fontWeight: step.isTarget || step.isCurrent ? '700' : '400',
                    marginTop: 3,
                    textAlign: 'center',
                  }}
                >
                  {step.yr}
                </Text>
              </View>
            ))}
          </View>
        </Card>
      </View>

      {/* 3. Bespoke Native Tamil Calendar Grid */}
      <View style={{ marginHorizontal: spacing.lg, marginTop: spacing.md }}>
        <Card variant="default" style={{ padding: 0, overflow: 'hidden', borderWidth: 1.5, borderColor: colors.border }}>
          {/* Calendar Month Navigation Header */}
          <View
            style={{
              paddingVertical: spacing.sm + 2,
              paddingHorizontal: spacing.md,
              backgroundColor: isDark ? '#2E2218' : '#F7EFE0',
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <TouchableOpacity
              onPress={handlePrevMonth}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={{ padding: 4 }}
            >
              <Ionicons name="chevron-back" size={22} color={colors.primary} />
            </TouchableOpacity>

            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: colors.primary, fontSize: fontSize.md, fontWeight: fontWeight.bold }}>
                {MONTH_NAMES_EN[selectedMonthNum - 1]} {selectedYear}
              </Text>
              <Text style={{ color: '#D97706', fontSize: fontSize.xs, fontWeight: fontWeight.semibold, marginTop: 1 }}>
                {primaryTamilMonth}
              </Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
              <TouchableOpacity
                onPress={handleToday}
                style={{
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderRadius: borderRadius.sm,
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <Text style={{ color: colors.primary, fontSize: 10, fontWeight: '700' }}>Today</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleNextMonth}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={{ padding: 4 }}
              >
                <Ionicons name="chevron-forward" size={22} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Weekday Labels Header */}
          <View
            style={{
              flexDirection: 'row',
              backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
              paddingVertical: 8,
            }}
          >
            {WEEKDAYS.map((w, idx) => (
              <View key={w.en} style={{ flex: 1, alignItems: 'center' }}>
                <Text
                  style={{
                    color: idx === 6 ? '#D97706' : colors.textSecondary,
                    fontSize: 11,
                    fontWeight: '700',
                  }}
                >
                  {w.en}
                </Text>
                <Text
                  style={{
                    color: idx === 6 ? '#D97706' : colors.textTertiary,
                    fontSize: 9,
                    marginTop: 1,
                  }}
                >
                  {w.ta}
                </Text>
              </View>
            ))}
          </View>

          {/* Days Grid */}
          <View style={{ padding: 6 }}>
            {Array.from({ length: Math.ceil(calendarGrid.length / 7) }).map((_, rowIndex) => (
              <View key={`row-${rowIndex}`} style={{ flexDirection: 'row', marginBottom: 4 }}>
                {calendarGrid.slice(rowIndex * 7, rowIndex * 7 + 7).map((cell) => {
                  const isSelected = cell.dateStr === selectedDate;
                  const isToday = cell.dateStr === today;
                  const isSecondSat = cell.isSecondSat;
                  const isPurattasiSat = cell.isPurattasiSat;
                  const isGokula = cell.isGokula;
                  const isEkadashi = cell.isEkadashi;
                  const isSpecial = cell.isSpecial;

                  if (!cell.isCurrentMonth) {
                    return (
                      <View
                        key={cell.dateStr}
                        style={{
                          flex: 1,
                          aspectRatio: 1,
                          alignItems: 'center',
                          justifyContent: 'center',
                          opacity: 0.25,
                        }}
                      >
                        <Text style={{ color: colors.textTertiary, fontSize: 12 }}>
                          {cell.dayNumber}
                        </Text>
                      </View>
                    );
                  }

                  // Determine cell background
                  let cellBg = 'transparent';
                  let textColor = colors.textPrimary;
                  if (isSelected) {
                    cellBg = isSecondSat ? '#851D1D' : colors.primary;
                    textColor = '#FFFFFF';
                  } else if (isSecondSat) {
                    cellBg = isDark ? '#3D1717' : '#FEF3C7';
                  } else if (isGokula) {
                    cellBg = isDark ? '#102A1C' : '#ECFDF5';
                  }

                  return (
                    <TouchableOpacity
                      key={cell.dateStr}
                      onPress={() => setSelectedDate(cell.dateStr)}
                      activeOpacity={0.7}
                      style={{
                        flex: 1,
                        aspectRatio: 1,
                        borderRadius: borderRadius.md,
                        backgroundColor: cellBg,
                        borderWidth: isToday && !isSelected ? 1.5 : 1,
                        borderColor: isToday && !isSelected
                          ? colors.primary
                          : isSecondSat
                          ? '#F59E0B'
                          : isGokula
                          ? '#10B981'
                          : isSelected
                          ? colors.primary
                          : 'transparent',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 2,
                        marginHorizontal: 1,
                      }}
                    >
                      {/* Gregorian Day Number */}
                      <Text
                        style={{
                          color: textColor,
                          fontSize: 13,
                          fontWeight: isSelected || cell.isSaturday || isSpecial ? '700' : '500',
                        }}
                      >
                        {cell.dayNumber}
                      </Text>

                      {/* Tamil Solar Day Number */}
                      {cell.tamilDay ? (
                        <Text
                          style={{
                            color: isSelected
                              ? '#FEF3C7'
                              : isSecondSat
                              ? '#B45309'
                              : isDark
                              ? '#94A3B8'
                              : '#78716C',
                            fontSize: 9,
                            fontWeight: '600',
                            marginTop: -1,
                          }}
                        >
                          {cell.tamilDay}
                        </Text>
                      ) : null}

                      {/* Auspicious Dots Row */}
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 1, height: 5 }}>
                        {isSecondSat && (
                          <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#F59E0B' }} />
                        )}
                        {!isSecondSat && isPurattasiSat && (
                          <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: '#D97706' }} />
                        )}
                        {isGokula && (
                          <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: '#10B981' }} />
                        )}
                        {(isEkadashi || (isSpecial && !isSecondSat && !isPurattasiSat && !isGokula)) && (
                          <View
                            style={{
                              width: 4,
                              height: 4,
                              borderRadius: 2,
                              backgroundColor: isSelected ? '#FFFFFF' : colors.primary,
                            }}
                          />
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>

          {/* Legend */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-around',
              paddingVertical: spacing.sm,
              paddingHorizontal: spacing.md,
              borderTopWidth: 1,
              borderTopColor: colors.border,
              backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#F59E0B' }} />
              <Text style={{ color: colors.textSecondary, fontSize: 10 }}>Purattasi 2nd Sat</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981' }} />
              <Text style={{ color: colors.textSecondary, fontSize: 10 }}>Gokulaashdami</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary }} />
              <Text style={{ color: colors.textSecondary, fontSize: 10 }}>Ekadashi / Utsavam</Text>
            </View>
          </View>
        </Card>
      </View>

      {/* 4. Daily Dynamic Panchangam Card for Selected Date */}
      <View style={{ marginHorizontal: spacing.lg, marginTop: spacing.md }}>
        <Card variant="default" padding="md" style={{ borderColor: colors.border, borderWidth: 1 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs }}>Selected Date Panchangam</Text>
              <Text style={{ color: colors.primary, fontSize: fontSize.lg, fontWeight: fontWeight.bold, marginTop: 2 }}>
                {new Date(selectedDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </Text>
              {selectedDayInfo && (
                <Text style={{ color: '#D97706', fontSize: fontSize.sm, fontWeight: fontWeight.semibold, marginTop: 2 }}>
                  {selectedDayInfo.tamilMonthTamil} {selectedDayInfo.tamilDay} ({selectedDayInfo.tamilMonth})
                </Text>
              )}
            </View>
            <View style={{ padding: 6, backgroundColor: colors.primaryLight, borderRadius: borderRadius.sm }}>
              <Ionicons name="sparkles-outline" size={20} color={colors.primary} />
            </View>
          </View>

          {selectedDayInfo && (
            <View style={{ marginTop: spacing.sm }}>
              {/* Tithi and Nakshatra Chips */}
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.sm }}>
                <View style={{ backgroundColor: colors.surfaceVariant, paddingHorizontal: 8, paddingVertical: 4, borderRadius: borderRadius.sm }}>
                  <Text style={{ color: colors.textPrimary, fontSize: fontSize.xs, fontWeight: fontWeight.semibold }}>
                    Tithi: {selectedDayInfo.paksha} {selectedDayInfo.tithiName}
                  </Text>
                </View>
                <View style={{ backgroundColor: colors.surfaceVariant, paddingHorizontal: 8, paddingVertical: 4, borderRadius: borderRadius.sm }}>
                  <Text style={{ color: colors.textPrimary, fontSize: fontSize.xs, fontWeight: fontWeight.semibold }}>
                    Star: {selectedDayInfo.nakshatraName}
                  </Text>
                </View>
                {selectedDayInfo.rahuKalam && (
                  <View style={{ backgroundColor: colors.surfaceVariant, paddingHorizontal: 8, paddingVertical: 4, borderRadius: borderRadius.sm }}>
                    <Text style={{ color: colors.textTertiary, fontSize: fontSize.xs }}>
                      Rahu: {selectedDayInfo.rahuKalam.start} - {selectedDayInfo.rahuKalam.end}
                    </Text>
                  </View>
                )}
                {selectedDayInfo.yamagandaKalam && (
                  <View style={{ backgroundColor: colors.surfaceVariant, paddingHorizontal: 8, paddingVertical: 4, borderRadius: borderRadius.sm }}>
                    <Text style={{ color: colors.textTertiary, fontSize: fontSize.xs }}>
                      Yamaganda: {selectedDayInfo.yamagandaKalam.start} - {selectedDayInfo.yamagandaKalam.end}
                    </Text>
                  </View>
                )}
              </View>

              {/* Special Event Description Banner if Auspicious Day */}
              {selectedDayInfo.isPerumalSpecialDay ? (
                <View
                  style={{
                    backgroundColor: selectedDayInfo.isPurattasiSecondSaturday
                      ? (isDark ? '#2E1C14' : '#FFFBEB')
                      : selectedDayInfo.isGokulashtami
                      ? (isDark ? '#132A1C' : '#F0FDF4')
                      : (isDark ? '#2E2218' : '#FEF3C7'),
                    padding: spacing.sm,
                    borderRadius: borderRadius.sm,
                    borderLeftWidth: 3,
                    borderLeftColor: selectedDayInfo.isPurattasiSecondSaturday
                      ? '#F59E0B'
                      : selectedDayInfo.isGokulashtami
                      ? '#10B981'
                      : colors.primary,
                  }}
                >
                  <Text style={{ color: colors.textPrimary, fontWeight: fontWeight.bold, fontSize: fontSize.sm }}>
                    {selectedDayInfo.specialEventTitle}
                  </Text>
                  <Text style={{ color: '#D97706', fontSize: fontSize.xs, marginTop: 2, fontWeight: fontWeight.semibold }}>
                    {selectedDayInfo.specialEventTitleTamil}
                  </Text>
                  <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, marginTop: 4, lineHeight: 16 }}>
                    {selectedDayInfo.specialEventDescription}
                  </Text>
                </View>
              ) : (
                <Text style={{ color: colors.textTertiary, fontSize: fontSize.xs, fontStyle: 'italic' }}>
                  Auspicious day for Balaji seva and prayer.
                </Text>
              )}
            </View>
          )}
        </Card>
      </View>

      {/* 5. Special Days for Perumal in Visible Month with Filter */}
      <View style={{ marginHorizontal: spacing.lg, marginTop: spacing.lg }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm }}>
          <Text style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: fontWeight.bold }}>
            Perumal Special Days ({MONTH_NAMES_EN[selectedMonthNum - 1]} {selectedYear})
          </Text>
          {loadingMonth && <ActivityIndicator size="small" color={colors.primary} />}
        </View>

        {/* Filter Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.md }}>
          {[
            { id: 'ALL', label: 'All Days' },
            { id: 'PURATTASI', label: '⭐ Purattasi Saturdays' },
            { id: 'GOKULASHTAMI', label: '🌟 Gokulaashdami' },
            { id: 'EKADASHI', label: 'Ekadashi Vratams' },
          ].map((cat) => {
            const isSel = filterCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setFilterCategory(cat.id as any)}
                style={{
                  marginRight: spacing.xs,
                  paddingHorizontal: spacing.sm + 4,
                  paddingVertical: spacing.xs,
                  borderRadius: borderRadius.full,
                  backgroundColor: isSel ? colors.primary : colors.surface,
                  borderWidth: 1,
                  borderColor: isSel ? colors.primary : colors.border,
                }}
              >
                <Text
                  style={{
                    color: isSel ? '#FFFFFF' : colors.textSecondary,
                    fontSize: fontSize.xs,
                    fontWeight: isSel ? '700' : '500',
                  }}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* List of Special Days */}
        <View style={{ gap: spacing.sm }}>
          {filteredSpecialDays.length === 0 ? (
            <Card variant="default" padding="md">
              <Text style={{ color: colors.textTertiary, fontSize: fontSize.xs, textAlign: 'center' }}>
                No specific filtered Perumal special days in this month. Browse other months using the calendar above.
              </Text>
            </Card>
          ) : (
            filteredSpecialDays.map((day) => {
              const isSecondSat = day.isPurattasiSecondSaturday;
              const isGokula = day.isGokulashtami;

              return (
                <TouchableOpacity
                  key={day.date}
                  onPress={() => setSelectedDate(day.date)}
                  activeOpacity={0.8}
                >
                  <Card
                    variant="default"
                    padding="sm"
                    style={{
                      borderColor: isSecondSat ? '#F59E0B' : isGokula ? '#10B981' : colors.border,
                      borderWidth: isSecondSat || isGokula ? 1.5 : 1,
                      backgroundColor: isSecondSat
                        ? (isDark ? '#2E1C14' : '#FFFBEB')
                        : isGokula
                        ? (isDark ? '#132A1C' : '#F0FDF4')
                        : colors.surface,
                    }}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                          <Text style={{ color: colors.textPrimary, fontWeight: fontWeight.bold, fontSize: fontSize.sm }}>
                            {day.specialEventTitle}
                          </Text>
                          {isSecondSat && (
                            <Badge
                              label="ANNUAL FUNCTION"
                              variant="warning"
                              size="sm"
                            />
                          )}
                          {isGokula && (
                            <Badge
                              label="4-YEAR CYCLE"
                              variant="success"
                              size="sm"
                            />
                          )}
                        </View>

                        <Text style={{ color: '#D97706', fontSize: fontSize.xs, fontWeight: fontWeight.semibold, marginTop: 2 }}>
                          {day.specialEventTitleTamil} • {day.tamilMonthTamil} {day.tamilDay}
                        </Text>

                        <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, marginTop: 4, lineHeight: 16 }}>
                          {day.specialEventDescription}
                        </Text>
                      </View>

                      <View style={{ alignItems: 'flex-end', marginLeft: spacing.sm }}>
                        <Text style={{ color: colors.primary, fontWeight: fontWeight.bold, fontSize: fontSize.sm }}>
                          {new Date(day.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </Text>
                        <Text style={{ color: colors.textTertiary, fontSize: 10 }}>
                          {new Date(day.date).toLocaleDateString('en-IN', { weekday: 'short' })}
                        </Text>
                      </View>
                    </View>
                  </Card>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </View>
    </ScrollView>
  );
};
