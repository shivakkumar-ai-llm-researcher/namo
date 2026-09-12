import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
  useWindowDimensions,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { BalajiNamam } from '../ui';
import { formatCurrency } from '../../utils/formatters';
import { CommunityFunction } from '../../types';

export interface FunctionCardSummary {
  contributions: number;
  expenses: number;
  balance: number;
  contributors: number;
}

export interface TwoFunctionsHeroCardsProps {
  annualFunction?: CommunityFunction | null;
  fourYearFunction?: CommunityFunction | null;
  activeFunctionId?: string;
  onSelectFunction?: (fn: CommunityFunction) => void;
  annualSummary?: FunctionCardSummary;
  fourYearSummary?: FunctionCardSummary;
}

export const TwoFunctionsHeroCards: React.FC<TwoFunctionsHeroCardsProps> = ({
  annualFunction,
  fourYearFunction,
  activeFunctionId,
  onSelectFunction,
  annualSummary = { contributions: 0, expenses: 0, balance: 0, contributors: 0 },
  fourYearSummary = { contributions: 0, expenses: 0, balance: 0, contributors: 0 },
}) => {
  const { spacing, borderRadius, fontSize, fontWeight, shadow, colors } = useTheme();
  const { width: windowWidth } = useWindowDimensions();

  // Initial estimate accounting for dashboard padding (spacing.lg * 2 = 48)
  const initialWidth = Math.max(280, windowWidth - (spacing.lg * 2));
  const [containerWidth, setContainerWidth] = useState<number>(initialWidth);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const scrollRef = useRef<ScrollView>(null);
  const userInteractingRef = useRef<boolean>(false);
  const resumeTimerRef = useRef<any>(null);

  const isAnnualActive = annualFunction && activeFunctionId === annualFunction.id;
  const isFourYearActive = fourYearFunction && activeFunctionId === fourYearFunction.id;

  // Auto-carousel timer (cycles every 4.5 seconds)
  useEffect(() => {
    if (containerWidth <= 0) return;

    const interval = setInterval(() => {
      if (userInteractingRef.current) return;
      const nextIndex = activeIndex === 0 ? 1 : 0;
      scrollRef.current?.scrollTo({
        x: nextIndex * containerWidth,
        animated: true,
      });
      setActiveIndex(nextIndex);
    }, 4500);

    return () => clearInterval(interval);
  }, [containerWidth, activeIndex]);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (containerWidth > 0) {
      const offsetX = e.nativeEvent.contentOffset.x;
      const idx = Math.round(offsetX / containerWidth);
      if (idx !== activeIndex && (idx === 0 || idx === 1)) {
        setActiveIndex(idx);
      }
    }
  };

  const handleScrollBeginDrag = () => {
    userInteractingRef.current = true;
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
  };

  const handleScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    handleScroll(e);
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => {
      userInteractingRef.current = false;
    }, 5000);
  };

  const goToSlide = (idx: number) => {
    userInteractingRef.current = true;
    setActiveIndex(idx);
    scrollRef.current?.scrollTo({
      x: idx * containerWidth,
      animated: true,
    });
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => {
      userInteractingRef.current = false;
    }, 5000);
  };

  return (
    <View
      onLayout={(e) => {
        const w = Math.round(e.nativeEvent.layout.width);
        if (w > 0 && Math.abs(w - containerWidth) > 1) {
          setContainerWidth(w);
        }
      }}
      style={{ width: '100%', gap: spacing.xs }}
    >
      {/* Horizontal Carousel */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled={Platform.OS !== 'web'}
        snapToInterval={containerWidth}
        snapToAlignment="start"
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={handleScroll}
        onScrollBeginDrag={handleScrollBeginDrag}
        onMomentumScrollEnd={handleScrollEnd}
        contentContainerStyle={{
          alignItems: 'stretch',
        }}
        style={{
          width: '100%',
        }}
      >
        {/* SLIDE 1: PURATTASI SANI KIYAMAI (ANNUAL) */}
        <View style={{ width: containerWidth, paddingHorizontal: 1 }}>
          <TouchableOpacity
            onPress={() => annualFunction && onSelectFunction && onSelectFunction(annualFunction)}
            activeOpacity={0.88}
            style={{
              backgroundColor: '#851D1D',
              borderRadius: borderRadius.lg,
              borderWidth: isAnnualActive ? 2.5 : 1.5,
              borderColor: isAnnualActive ? '#F59E0B' : '#D97706',
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.md,
              overflow: 'hidden',
              ...shadow.md,
            }}
          >
            {/* Golden Header Highlight */}
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 4,
                backgroundColor: '#F59E0B',
              }}
            />

            {/* Top Meta Bar: responsive layout with no overflow */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: spacing.sm,
                gap: spacing.xs,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1, marginRight: 4 }}>
                <BalajiNamam size={20} variant="colored" />
                <View
                  style={{
                    backgroundColor: '#F59E0B',
                    paddingHorizontal: 6,
                    paddingVertical: 2.5,
                    borderRadius: borderRadius.sm,
                    flexShrink: 1,
                  }}
                >
                  <Text
                    style={{ color: '#451A03', fontSize: 10, fontWeight: '800', letterSpacing: 0.3 }}
                    numberOfLines={1}
                  >
                    YEARLY FESTIVAL • ஆண்டு பெருவிழா
                  </Text>
                </View>
              </View>

              {isAnnualActive ? (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 4,
                    backgroundColor: 'rgba(254, 243, 199, 0.25)',
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    borderRadius: borderRadius.full,
                    borderWidth: 1,
                    borderColor: '#FDE68A',
                    flexShrink: 0,
                  }}
                >
                  <Ionicons name="checkmark-circle" size={12} color="#FDE68A" />
                  <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: '700' }}>Active Seva</Text>
                </View>
              ) : (
                <View
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    borderRadius: borderRadius.full,
                    flexShrink: 0,
                  }}
                >
                  <Text style={{ color: 'rgba(254, 243, 199, 0.9)', fontSize: 10, fontWeight: '600' }}>
                    Tap to Focus
                  </Text>
                </View>
              )}
            </View>

            {/* Main Function Title */}
            <Text style={{ color: '#FFFFFF', fontSize: fontSize.lg, fontWeight: fontWeight.bold, letterSpacing: 0.3 }} numberOfLines={1}>
              Purattasi Sani Kiyamai
            </Text>
            <Text style={{ color: '#FDE68A', fontSize: fontSize.xs, fontWeight: fontWeight.semibold, marginTop: 2 }} numberOfLines={1}>
              புரட்டாசி சனிக்கிழமை • {annualFunction?.name || '2026 Annual Function'}
            </Text>

            {/* Special Day Details Pill */}
            <View
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.28)',
                borderRadius: borderRadius.md,
                padding: spacing.sm,
                marginTop: spacing.sm,
                borderLeftWidth: 3,
                borderLeftColor: '#F59E0B',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <Ionicons name="star" size={12} color="#FDE68A" />
                <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: fontWeight.bold }} numberOfLines={1}>
                  ⭐ 2nd Saturday of Purattasi (Annual Function)
                </Text>
              </View>
              <Text style={{ color: 'rgba(254, 243, 199, 0.85)', fontSize: 10, marginTop: 2, lineHeight: 14 }} numberOfLines={1}>
                Balaji Thirumanjanam • Maavilakku Deepam • Annadhanam
              </Text>
            </View>

            {/* Financial Mini Ledger Strip */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.25)',
                borderRadius: borderRadius.md,
                paddingVertical: spacing.sm - 1,
                paddingHorizontal: spacing.sm,
                marginTop: spacing.sm + 2,
              }}
            >
              <View style={{ alignItems: 'center', flex: 1 }}>
                <Text style={{ color: 'rgba(254, 243, 199, 0.75)', fontSize: 9.5 }}>Income</Text>
                <Text style={{ color: '#BBF7D0', fontSize: fontSize.xs + 1, fontWeight: fontWeight.bold, marginTop: 1 }} numberOfLines={1}>
                  +{formatCurrency(annualSummary.contributions)}
                </Text>
              </View>

              <View style={{ width: 1, height: 22, backgroundColor: 'rgba(255, 255, 255, 0.15)' }} />

              <View style={{ alignItems: 'center', flex: 1 }}>
                <Text style={{ color: 'rgba(254, 243, 199, 0.75)', fontSize: 9.5 }}>Expenses</Text>
                <Text style={{ color: '#FECDD3', fontSize: fontSize.xs + 1, fontWeight: fontWeight.bold, marginTop: 1 }} numberOfLines={1}>
                  −{formatCurrency(annualSummary.expenses)}
                </Text>
              </View>

              <View style={{ width: 1, height: 22, backgroundColor: 'rgba(255, 255, 255, 0.15)' }} />

              <View style={{ alignItems: 'center', flex: 1 }}>
                <Text style={{ color: 'rgba(254, 243, 199, 0.75)', fontSize: 9.5 }}>Net Savings</Text>
                <Text style={{ color: '#FDE68A', fontSize: fontSize.xs + 1, fontWeight: fontWeight.bold, marginTop: 1 }} numberOfLines={1}>
                  {formatCurrency(annualSummary.balance)}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* SLIDE 2: GOKULAASHDAMI (4-YEAR) */}
        <View style={{ width: containerWidth, paddingHorizontal: 1 }}>
          <TouchableOpacity
            onPress={() => fourYearFunction && onSelectFunction && onSelectFunction(fourYearFunction)}
            activeOpacity={0.88}
            style={{
              backgroundColor: '#064E3B',
              borderRadius: borderRadius.lg,
              borderWidth: isFourYearActive ? 2.5 : 1.5,
              borderColor: isFourYearActive ? '#10B981' : '#059669',
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.md,
              overflow: 'hidden',
              ...shadow.md,
            }}
          >
            {/* Emerald Header Highlight */}
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 4,
                backgroundColor: '#10B981',
              }}
            />

            {/* Top Meta Bar */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: spacing.sm,
                gap: spacing.xs,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1, marginRight: 4 }}>
                <Ionicons name="sparkles" size={16} color="#FDE68A" />
                <View
                  style={{
                    backgroundColor: '#10B981',
                    paddingHorizontal: 6,
                    paddingVertical: 2.5,
                    borderRadius: borderRadius.sm,
                    flexShrink: 1,
                  }}
                >
                  <Text
                    style={{ color: '#FFFFFF', fontSize: 10, fontWeight: '800', letterSpacing: 0.3 }}
                    numberOfLines={1}
                  >
                    4-YEAR FESTIVAL • 4 வருட பெருவிழா
                  </Text>
                </View>
              </View>

              {isFourYearActive ? (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 4,
                    backgroundColor: 'rgba(167, 243, 208, 0.25)',
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    borderRadius: borderRadius.full,
                    borderWidth: 1,
                    borderColor: '#A7F3D0',
                    flexShrink: 0,
                  }}
                >
                  <Ionicons name="checkmark-circle" size={12} color="#A7F3D0" />
                  <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: '700' }}>Active Seva</Text>
                </View>
              ) : (
                <View
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    borderRadius: borderRadius.full,
                    flexShrink: 0,
                  }}
                >
                  <Text style={{ color: 'rgba(209, 250, 229, 0.9)', fontSize: 10, fontWeight: '600' }}>
                    Tap to Focus
                  </Text>
                </View>
              )}
            </View>

            {/* Main Function Name */}
            <Text style={{ color: '#FFFFFF', fontSize: fontSize.lg, fontWeight: fontWeight.bold, letterSpacing: 0.3 }} numberOfLines={1}>
              Gokulaashdami Festival
            </Text>
            <Text style={{ color: '#A7F3D0', fontSize: fontSize.xs, fontWeight: fontWeight.semibold, marginTop: 2 }} numberOfLines={1}>
              கோகுலாஷ்டமி 4 வருட பெருவிழா • {fourYearFunction?.name || '2026-2029 Function'}
            </Text>

            {/* 4-Year Cycle Timeline Pill */}
            <View
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                borderRadius: borderRadius.md,
                padding: spacing.sm,
                marginTop: spacing.sm,
                borderLeftWidth: 3,
                borderLeftColor: '#10B981',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <Ionicons name="gift-outline" size={12} color="#A7F3D0" />
                <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: fontWeight.bold }} numberOfLines={1}>
                  Celebrated 2025 ✓ • Next Celebration in 2029 🌟
                </Text>
              </View>
              <Text style={{ color: 'rgba(209, 250, 229, 0.85)', fontSize: 10, marginTop: 2, lineHeight: 14 }} numberOfLines={1}>
                Sri Krishna Janmashtami • Uriyadi • Maha Prasad
              </Text>
            </View>

            {/* Financial Mini Ledger Strip */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.25)',
                borderRadius: borderRadius.md,
                paddingVertical: spacing.sm - 1,
                paddingHorizontal: spacing.sm,
                marginTop: spacing.sm + 2,
              }}
            >
              <View style={{ alignItems: 'center', flex: 1 }}>
                <Text style={{ color: 'rgba(209, 250, 229, 0.75)', fontSize: 9.5 }}>Total Fund</Text>
                <Text style={{ color: '#A7F3D0', fontSize: fontSize.xs + 1, fontWeight: fontWeight.bold, marginTop: 1 }} numberOfLines={1}>
                  +{formatCurrency(fourYearSummary.contributions)}
                </Text>
              </View>

              <View style={{ width: 1, height: 22, backgroundColor: 'rgba(255, 255, 255, 0.15)' }} />

              <View style={{ alignItems: 'center', flex: 1 }}>
                <Text style={{ color: 'rgba(209, 250, 229, 0.75)', fontSize: 9.5 }}>Expenses</Text>
                <Text style={{ color: '#FECDD3', fontSize: fontSize.xs + 1, fontWeight: fontWeight.bold, marginTop: 1 }} numberOfLines={1}>
                  −{formatCurrency(fourYearSummary.expenses)}
                </Text>
              </View>

              <View style={{ width: 1, height: 22, backgroundColor: 'rgba(255, 255, 255, 0.15)' }} />

              <View style={{ alignItems: 'center', flex: 1 }}>
                <Text style={{ color: 'rgba(209, 250, 229, 0.75)', fontSize: 9.5 }}>4-Yr Savings</Text>
                <Text style={{ color: '#FDE68A', fontSize: fontSize.xs + 1, fontWeight: fontWeight.bold, marginTop: 1 }} numberOfLines={1}>
                  {formatCurrency(fourYearSummary.balance)}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Carousel Pagination Dots */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          paddingTop: 8,
          paddingBottom: 2,
        }}
      >
        <TouchableOpacity onPress={() => goToSlide(0)} activeOpacity={0.7} style={{ padding: 4 }}>
          <View
            style={{
              width: activeIndex === 0 ? 22 : 7,
              height: 7,
              borderRadius: 3.5,
              backgroundColor: activeIndex === 0 ? '#851D1D' : 'rgba(150, 150, 150, 0.35)',
              borderWidth: activeIndex === 0 ? 1 : 0,
              borderColor: '#F59E0B',
            }}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => goToSlide(1)} activeOpacity={0.7} style={{ padding: 4 }}>
          <View
            style={{
              width: activeIndex === 1 ? 22 : 7,
              height: 7,
              borderRadius: 3.5,
              backgroundColor: activeIndex === 1 ? '#064E3B' : 'rgba(150, 150, 150, 0.35)',
              borderWidth: activeIndex === 1 ? 1 : 0,
              borderColor: '#10B981',
            }}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};
