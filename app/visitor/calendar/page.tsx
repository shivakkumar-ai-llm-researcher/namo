'use client';
import { useState, useEffect } from 'react';
import {
  CalendarDays,
  List,
  Clock,
  Sparkles,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { Card, Badge, EmptyState } from '@/components/ui';
import { functionService } from '@/services';
import type { CommunityFunction } from '@/types';
import { formatFunctionType, formatFunctionStatus } from '@/utils/formatters';

const TamilCalendarView = dynamic(
  () => import('@/components/calendar/TamilCalendarView').then((mod) => mod.TamilCalendarView),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="w-10 h-10 border-4 rounded-full animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--primary)' }} />
        <p className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
          Loading Tamil Calendar & Panchangam • பஞ்சாங்கம் கணக்கிடப்படுகிறது...
        </p>
      </div>
    ),
  }
);

export default function VisitorCalendarPage() {
  const [functions, setFunctions] = useState<CommunityFunction[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'TAMIL_CALENDAR' | 'FUNCTIONS'>('TAMIL_CALENDAR');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [filterType, setFilterType] = useState<'ALL' | 'ANNUAL' | 'FOUR_YEAR'>('ALL');

  useEffect(() => {
    async function load() {
      try {
        const data = await functionService.getAll();
        setFunctions(data);
      } catch (e) {
        console.warn('Failed to load functions:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const years = [2024, 2025, 2026, 2027, 2028, 2029, 2030];

  const filteredFunctions = functions.filter((fn: CommunityFunction) => {
    if (filterType !== 'ALL' && fn.type !== filterType) return false;
    if (fn.type === 'ANNUAL') {
      return fn.start_year === selectedYear;
    } else {
      const end = fn.end_year ?? fn.start_year + 3;
      return selectedYear >= fn.start_year && selectedYear <= end;
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'var(--income)';
      case 'completed': return 'var(--primary)';
      case 'planning': return 'var(--warning)';
      case 'archived': return 'var(--text-tertiary)';
      default: return 'var(--primary)';
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          {viewMode === 'TAMIL_CALENDAR' ? 'Tamil Calendar & Perumal Days' : 'Functions Schedule'}
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {viewMode === 'TAMIL_CALENDAR'
            ? 'தமிழ் நாட்காட்டி • புரட்டாசி சனி & கோகுலாஷ்டமி'
            : 'Annual & 4-Year Community Events Schedule • நிகழ்வுகள் அட்டவணை'}
        </p>
      </div>

      {/* Segmented View Mode Toggle */}
      <div
        className="flex rounded-xl p-1 border max-w-md"
        style={{
          backgroundColor: 'var(--surface-variant)',
          borderColor: 'var(--border)',
        }}
      >
        <button
          onClick={() => setViewMode('TAMIL_CALENDAR')}
          className="flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
          style={{
            backgroundColor: viewMode === 'TAMIL_CALENDAR' ? 'var(--surface)' : 'transparent',
            color: viewMode === 'TAMIL_CALENDAR' ? 'var(--primary)' : 'var(--text-secondary)',
            boxShadow: viewMode === 'TAMIL_CALENDAR' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
          }}
        >
          <CalendarDays size={15} />
          <span>Tamil Calendar (நாட்காட்டி)</span>
        </button>

        <button
          onClick={() => setViewMode('FUNCTIONS')}
          className="flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
          style={{
            backgroundColor: viewMode === 'FUNCTIONS' ? 'var(--surface)' : 'transparent',
            color: viewMode === 'FUNCTIONS' ? 'var(--primary)' : 'var(--text-secondary)',
            boxShadow: viewMode === 'FUNCTIONS' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
          }}
        >
          <List size={15} />
          <span>Functions Schedule (அட்டவணை)</span>
        </button>
      </div>

      {/* Content */}
      {viewMode === 'TAMIL_CALENDAR' ? (
        <TamilCalendarView functions={functions} isAdmin={false} />
      ) : (
        <div className="space-y-4">
          {/* Year Pills & Filter Pills */}
          <div className="space-y-3">
            {/* Year selector */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {years.map((y) => {
                const isSel = selectedYear === y;
                return (
                  <button
                    key={y}
                    onClick={() => setSelectedYear(y)}
                    className="px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex-shrink-0"
                    style={{
                      backgroundColor: isSel ? 'var(--primary)' : 'var(--surface-variant)',
                      color: isSel ? '#FFFFFF' : 'var(--text-secondary)',
                    }}
                  >
                    {y}
                  </button>
                );
              })}
            </div>

            {/* Filter type */}
            <div className="flex flex-wrap gap-2">
              {(['ALL', 'ANNUAL', 'FOUR_YEAR'] as const).map((t) => {
                const isSel = filterType === t;
                return (
                  <button
                    key={t}
                    onClick={() => setFilterType(t)}
                    className="px-3 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer"
                    style={{
                      backgroundColor: isSel ? 'var(--primary-light)' : 'transparent',
                      color: isSel ? 'var(--primary)' : 'var(--text-tertiary)',
                      borderColor: isSel ? 'var(--primary)' : 'var(--border)',
                    }}
                  >
                    {t === 'ALL'
                      ? 'All Functions'
                      : t === 'ANNUAL'
                      ? 'Purattasi Sani Kiyamai (Annual)'
                      : 'Gokulaashdami (4-Year)'}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Overview Card */}
          <Card className="border-l-4" style={{ borderLeftColor: 'var(--primary)' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Selected Year Overview
                </p>
                <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                  {selectedYear} Community Timeline
                </h3>
              </div>
              <Badge
                label={`${filteredFunctions.length} ${filteredFunctions.length === 1 ? 'Function' : 'Functions'}`}
                variant="primary"
                size="sm"
              />
            </div>
          </Card>

          {/* Functions Timeline List */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div
                className="w-8 h-8 border-4 rounded-full animate-spin"
                style={{ borderColor: 'var(--border)', borderTopColor: 'var(--primary)' }}
              />
            </div>
          ) : filteredFunctions.length === 0 ? (
            <EmptyState
              icon="📅"
              title={`No Functions in ${selectedYear}`}
              subtitle="No community functions scheduled for this year."
            />
          ) : (
            <div className="space-y-3">
              {filteredFunctions.map((fn) => {
                const statusColor = getStatusColor(fn.status);
                return (
                  <Card key={fn.id} className="p-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <Badge
                          label={formatFunctionType(fn.type)}
                          variant={fn.type === 'ANNUAL' ? 'info' : 'primary'}
                          size="sm"
                        />
                        <div className="flex items-center gap-1.5 text-xs font-bold uppercase">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: statusColor }}
                          />
                          <span style={{ color: statusColor }}>
                            {formatFunctionStatus(fn.status)}
                          </span>
                        </div>
                      </div>

                      <h4 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                        {fn.name}
                      </h4>

                      <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                        <Clock size={13} />
                        <span>
                          {fn.type === 'FOUR_YEAR'
                            ? `${fn.start_year} - ${fn.end_year ?? fn.start_year + 3} (4-Year Cycle)`
                            : `Year: ${fn.start_year}`}
                        </span>
                      </div>

                      {fn.description && (
                        <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                          {fn.description}
                        </p>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
