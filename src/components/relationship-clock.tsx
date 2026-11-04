import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import {
  CalendarDays,
  CalendarHeart,
  ChevronLeft,
  ChevronRight,
  Clock,
  Gift,
  Heart,
  Lock,
  Sparkles,
  Shirt,
} from 'lucide-react-native';
import { CoupleAvatars, C, Card, F, S, T } from './ui';
import {
  buildCalendarMonthGrid,
  buildRelationshipMilestones,
  dateKey,
  nextAnniversaryCountdown,
  nextMonthiversaryCountdown,
  parseRelationshipStart,
  relationshipDurationBreakdown,
} from '../domain';
import { usePeople, useSpace } from '../store';

const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export function useSecondTicker() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  return now;
}

function formatReadableDate(dateStr: string): string {
  if (!dateStr) return '';
  const dt = parseRelationshipStart(dateStr);
  if (!dt) return dateStr;
  return dt.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function RelationshipClockCard({
  startedAt,
  mode,
  myName,
  partnerName,
  partnerNickname,
  myAvatar,
  partnerAvatar,
  compact = false,
  showCalendarLink = true,
  showAnniversaryBanner = true,
}: {
  startedAt: string;
  mode: 'nearby' | 'distance';
  myName: string;
  partnerName: string;
  partnerNickname?: string;
  myAvatar?: string;
  partnerAvatar?: string;
  compact?: boolean;
  showCalendarLink?: boolean;
  showAnniversaryBanner?: boolean;
}) {
  const now = useSecondTicker();
  const breakdown = relationshipDurationBreakdown(startedAt, now);
  const nextAnniv = nextAnniversaryCountdown(startedAt, now);
  const displayPartner = partnerNickname?.trim() || partnerName || 'My Love';

  const units = [
    { label: 'YEARS', value: String(breakdown.years) },
    { label: 'MONTHS', value: String(breakdown.months) },
    { label: 'DAYS', value: String(breakdown.days) },
    { label: 'HOURS', value: String(breakdown.hours).padStart(2, '0') },
    { label: 'MIN', value: String(breakdown.minutes).padStart(2, '0') },
    { label: 'SEC', value: String(breakdown.seconds).padStart(2, '0') },
  ];

  const formattedStart = (() => {
    if (!startedAt) return 'Your story starts today';
    const dt = parseRelationshipStart(startedAt);
    if (!dt) return startedAt;
    return dt.toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  })();

  return (
    <Card
      style={{
        backgroundColor: '#3A2622',
        borderColor: '#4E352F',
        padding: compact ? 20 : 24,
        gap: 16,
      }}
    >
      <View style={S.between}>
        <View style={[S.row, { flex: 1, minWidth: 0 }]}>
          <CoupleAvatars
            names={[myName || 'You', displayPartner]}
            avatars={[myAvatar, partnerAvatar]}
            size={compact ? 44 : 50}
          />
          <View style={{ flex: 1, minWidth: 0 }}>
            <T numberOfLines={1} style={{ fontFamily: F.serif, fontSize: 19, color: '#FAF5EE' }}>
              {myName || 'You'} & {displayPartner}
            </T>
            <T kind="small" style={{ color: '#D9C3B4', fontSize: 12 }}>
              Since {formattedStart} · {breakdown.totalDays.toLocaleString()} days elapsed
            </T>
          </View>
        </View>
      </View>

      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 8,
          justifyContent: 'space-between',
        }}
      >
        {units.map(unit => (
          <View
            key={unit.label}
            style={{
              flexGrow: 1,
              minWidth: 72,
              backgroundColor: '#2B1B18',
              borderRadius: 14,
              borderWidth: 1,
              borderColor: '#543A33',
              paddingVertical: 10,
              paddingHorizontal: 8,
              alignItems: 'center',
              gap: 2,
            }}
          >
            <T
              style={{
                fontFamily: F.serif,
                fontSize: compact ? 22 : 25,
                lineHeight: compact ? 28 : 31,
                color: '#FAF5EE',
              }}
            >
              {unit.value}
            </T>
            <T
              style={{
                fontFamily: F.bold,
                fontSize: 9,
                letterSpacing: 1.4,
                color: '#C9AE9E',
              }}
            >
              {unit.label}
            </T>
          </View>
        ))}
      </View>

      {showAnniversaryBanner && (
        <View
          style={{
            backgroundColor: '#2B1B18',
            borderRadius: 12,
            borderWidth: 1,
            borderColor: '#543A33',
            paddingHorizontal: 13,
            paddingVertical: 10,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 8,
          }}
        >
          <View style={[S.row, { gap: 8, flex: 1, minWidth: 180 }]}>
            <Gift size={15} color="#E6B99D" />
            <T style={{ fontSize: 12, color: '#FAF5EE', fontFamily: F.medium }}>
              {nextAnniv.label} in {nextAnniv.days}d {String(nextAnniv.hours).padStart(2, '0')}h{' '}
              {String(nextAnniv.minutes).padStart(2, '0')}m {String(nextAnniv.seconds).padStart(2, '0')}s
            </T>
          </View>
          {showCalendarLink && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open milestone calendar and countdowns"
              onPress={() => router.push('/milestones')}
              style={{
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 8,
                backgroundColor: '#4E352F',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <CalendarDays size={13} color="#FAF5EE" />
              <T style={{ fontSize: 11, color: '#FAF5EE', fontFamily: F.bold }}>
                Milestone Calendar
              </T>
            </Pressable>
          )}
        </View>
      )}

      <View style={[S.between, { paddingTop: 4, borderTopWidth: 1, borderTopColor: '#4E352F' }]}>
        <T style={{ fontSize: 12, color: '#E6D5C8', fontFamily: F.italic }}>
          {mode === 'distance' ? 'Long distance · One shared heartbeat' : 'Nearby · Closer every second'}
        </T>
        <T style={{ fontSize: 11, color: '#C9AE9E' }}>LIVE ELAPSED CLOCK</T>
      </View>
    </Card>
  );
}

export function MilestoneCalendarCard({ expanded = false }: { expanded?: boolean }) {
  const { space } = useSpace();
  const { me, partner } = usePeople();
  const now = useSecondTicker();

  const origin = space.originStory;
  const startedAt = origin?.relationshipStartedAt || space.startedOn;
  const displayPartner = origin?.partnerNickname || partner?.nickname || partner?.name || 'My Love';

  const elapsed = relationshipDurationBreakdown(startedAt, now);
  const nextAnniv = nextAnniversaryCountdown(startedAt, now);
  const nextMonthiv = nextMonthiversaryCountdown(startedAt, now);

  const milestones = useMemo(
    () => buildRelationshipMilestones(startedAt, origin, space.plans, now),
    [startedAt, origin, space.plans, now]
  );

  const startParsed = parseRelationshipStart(startedAt);
  const startDateKey = startParsed ? dateKey(startParsed) : dateKey(new Date(now));
  const todayStr = dateKey(new Date(now));

  const [viewYear, setViewYear] = useState(() => {
    const dt = parseRelationshipStart(startedAt) ?? new Date();
    return dt.getFullYear();
  });
  const [viewMonth, setViewMonth] = useState(() => {
    const dt = parseRelationshipStart(startedAt) ?? new Date();
    return dt.getMonth();
  });
  const [selectedDate, setSelectedDate] = useState<string>(() => startDateKey);
  const [filter, setFilter] = useState<'all' | 'origin' | 'anniversary' | 'day-milestone'>('all');

  const gridCells = useMemo(
    () => buildCalendarMonthGrid(viewYear, viewMonth, startedAt, milestones, todayStr),
    [viewYear, viewMonth, startedAt, milestones, todayStr]
  );

  const selectedCell = useMemo(
    () => gridCells.find(c => c.date === selectedDate) ?? null,
    [gridCells, selectedDate]
  );

  const selectedDayMilestones = useMemo(() => {
    if (selectedCell && selectedCell.milestones.length > 0) {
      return selectedCell.milestones;
    }
    return milestones.filter(m => m.date === selectedDate);
  }, [selectedCell, milestones, selectedDate]);

  const nextDayMilestone = useMemo(
    () => milestones.find(m => m.kind === 'day-milestone' && m.daysDelta >= 0) ?? null,
    [milestones]
  );

  const filteredTimeline = useMemo(() => {
    return milestones.filter(m => {
      if (filter === 'origin') {
        return m.kind === 'origin' || m.kind === 'onboarding-chapter' || m.kind === 'linked';
      }
      if (filter === 'anniversary') {
        return m.kind === 'anniversary' || m.kind === 'monthiversary';
      }
      if (filter === 'day-milestone') {
        return m.kind === 'day-milestone' || m.kind === 'date-plan';
      }
      return true;
    });
  }, [milestones, filter]);

  const jumpToDate = (targetDateStr: string) => {
    const parsed = parseRelationshipStart(targetDateStr);
    if (!parsed) return;
    setViewYear(parsed.getFullYear());
    setViewMonth(parsed.getMonth());
    setSelectedDate(dateKey(parsed));
  };

  const shiftMonth = (delta: number) => {
    let nextM = viewMonth + delta;
    let nextY = viewYear;
    if (nextM < 0) {
      nextM = 11;
      nextY -= 1;
    } else if (nextM > 11) {
      nextM = 0;
      nextY += 1;
    }
    setViewMonth(nextM);
    setViewYear(nextY);
  };

  const totalHoursTogether = Math.max(0, elapsed.totalDays * 24 + elapsed.hours);

  return (
    <Card style={{ gap: 18 }}>
      {/* Header */}
      <View style={[S.between, { flexWrap: 'wrap', gap: 10 }]}>
        <View style={{ gap: 2, flex: 1, minWidth: 200 }}>
          <T kind="label" style={{ color: C.green }}>
            RELATIONSHIP MILESTONE CALENDAR
          </T>
          <T kind="sub">
            {me.name} & {displayPartner}’s Timeline & Countdowns
          </T>
          <T kind="small">
            Started {formatReadableDate(startDateKey)} · {elapsed.years}y {elapsed.months}m {elapsed.days}d (
            {totalHoursTogether.toLocaleString()} hours elapsed)
          </T>
        </View>
        {!expanded && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open full milestone calendar view"
            onPress={() => router.push('/milestones')}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 10,
              backgroundColor: C.bg,
              borderWidth: 1,
              borderColor: C.line,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <CalendarDays size={14} color={C.green} />
            <T kind="small" style={{ color: C.green, fontFamily: F.bold }}>
              Full View
            </T>
          </Pressable>
        )}
      </View>

      {/* Live Anniversary & Monthiversary Countdowns */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        {/* Next Annual Anniversary Countdown */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Jump to ${nextAnniv.label} on calendar`}
          onPress={() => jumpToDate(nextAnniv.targetDate)}
          style={{
            flex: 1,
            minWidth: 250,
            backgroundColor: '#F5DFDA',
            borderRadius: 16,
            borderWidth: 1,
            borderColor: '#E4BEB6',
            padding: 15,
            gap: 10,
          }}
        >
          <View style={S.between}>
            <View style={{ gap: 2 }}>
              <T style={{ fontSize: 10, fontFamily: F.bold, letterSpacing: 1.2, color: '#8E352E' }}>
                NEXT ANNUAL ANNIVERSARY
              </T>
              <T style={{ fontFamily: F.serif, fontSize: 18, color: '#3B1B18' }}>
                {nextAnniv.label}
              </T>
              <T kind="small" style={{ color: '#6E352F', fontSize: 12 }}>
                {formatReadableDate(nextAnniv.targetDate)} · {nextAnniv.progressPercent}% of year complete
              </T>
            </View>
            <Gift size={20} color="#8E352E" />
          </View>

          <View style={{ flexDirection: 'row', gap: 6 }}>
            {[
              { label: 'DAYS', value: String(nextAnniv.days) },
              { label: 'HRS', value: String(nextAnniv.hours).padStart(2, '0') },
              { label: 'MIN', value: String(nextAnniv.minutes).padStart(2, '0') },
              { label: 'SEC', value: String(nextAnniv.seconds).padStart(2, '0') },
            ].map(unit => (
              <View
                key={unit.label}
                style={{
                  flex: 1,
                  backgroundColor: '#FAF5EE',
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: '#E4BEB6',
                  paddingVertical: 7,
                  alignItems: 'center',
                }}
              >
                <T style={{ fontFamily: F.serif, fontSize: 17, color: '#3B1B18' }}>{unit.value}</T>
                <T style={{ fontSize: 8, fontFamily: F.bold, letterSpacing: 1, color: '#8E352E' }}>
                  {unit.label}
                </T>
              </View>
            ))}
          </View>

          <View
            style={{
              height: 5,
              borderRadius: 3,
              backgroundColor: '#E4BEB6',
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                width: `${nextAnniv.progressPercent}%`,
                height: '100%',
                backgroundColor: '#9E3B33',
              }}
            />
          </View>
        </Pressable>

        {/* Next Monthiversary & Day-Count Milestone Countdown */}
        <View style={{ flex: 1, minWidth: 240, gap: 10 }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Jump to ${nextMonthiv.label} on calendar`}
            onPress={() => jumpToDate(nextMonthiv.targetDate)}
            style={{
              flex: 1,
              backgroundColor: '#E4EDE4',
              borderRadius: 14,
              borderWidth: 1,
              borderColor: '#BDD2BC',
              padding: 13,
              justifyContent: 'space-between',
              gap: 6,
            }}
          >
            <View style={S.between}>
              <T style={{ fontSize: 10, fontFamily: F.bold, letterSpacing: 1.1, color: '#3D5A45' }}>
                NEXT MONTHIVERSARY
              </T>
              <T style={{ fontSize: 11, fontFamily: F.medium, color: '#233D29' }}>
                {formatReadableDate(nextMonthiv.targetDate)}
              </T>
            </View>
            <T style={{ fontFamily: F.serif, fontSize: 16, color: '#233D29' }}>
              {nextMonthiv.label}
            </T>
            <T kind="small" style={{ color: '#3D5A45', fontSize: 12 }}>
              Countdown: {nextMonthiv.days}d {String(nextMonthiv.hours).padStart(2, '0')}h{' '}
              {String(nextMonthiv.minutes).padStart(2, '0')}m {String(nextMonthiv.seconds).padStart(2, '0')}s
            </T>
          </Pressable>

          {nextDayMilestone && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Jump to ${nextDayMilestone.title} on calendar`}
              onPress={() => jumpToDate(nextDayMilestone.date)}
              style={{
                flex: 1,
                backgroundColor: '#F6E8D5',
                borderRadius: 14,
                borderWidth: 1,
                borderColor: '#E5CEA8',
                padding: 13,
                justifyContent: 'space-between',
                gap: 4,
              }}
            >
              <View style={S.between}>
                <T style={{ fontSize: 10, fontFamily: F.bold, letterSpacing: 1.1, color: '#8C4A27' }}>
                  UPCOMING DAY MILESTONE
                </T>
                <T style={{ fontSize: 11, fontFamily: F.medium, color: '#5C3A21' }}>
                  {formatReadableDate(nextDayMilestone.date)}
                </T>
              </View>
              <T style={{ fontFamily: F.serif, fontSize: 16, color: '#4A2C18' }}>
                {nextDayMilestone.title}
              </T>
              <T kind="small" style={{ color: '#7A4828', fontSize: 12 }}>
                {nextDayMilestone.daysDelta === 0
                  ? 'Celebrating today!'
                  : `${nextDayMilestone.daysDelta} days to go · ${elapsed.totalDays} days completed`}
              </T>
            </Pressable>
          )}
        </View>
      </View>

      {/* Interactive Monthly Calendar Navigation */}
      <View
        style={{
          backgroundColor: C.bg,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: C.line,
          padding: 14,
          gap: 12,
        }}
      >
        <View style={[S.between, { flexWrap: 'wrap', gap: 8 }]}>
          <View style={[S.row, { gap: 8 }]}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Previous month"
              onPress={() => shiftMonth(-1)}
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                backgroundColor: C.paper,
                borderWidth: 1,
                borderColor: C.line,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ChevronLeft size={17} color={C.ink} />
            </Pressable>
            <View style={{ minWidth: 135, alignItems: 'center' }}>
              <T style={{ fontFamily: F.serif, fontSize: 17, color: C.ink }}>
                {MONTH_NAMES[viewMonth]} {viewYear}
              </T>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Next month"
              onPress={() => shiftMonth(1)}
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                backgroundColor: C.paper,
                borderWidth: 1,
                borderColor: C.line,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ChevronRight size={17} color={C.ink} />
            </Pressable>
          </View>

          {/* Quick Jump Buttons */}
          <View style={[S.row, { gap: 6, flexWrap: 'wrap' }]}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Jump to relationship start month"
              onPress={() => jumpToDate(startDateKey)}
              style={{
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 8,
                backgroundColor: selectedDate === startDateKey ? C.green : C.paper,
                borderWidth: 1,
                borderColor: selectedDate === startDateKey ? C.green : C.line,
              }}
            >
              <T
                style={{
                  fontSize: 11,
                  fontFamily: F.medium,
                  color: selectedDate === startDateKey ? '#FAF5EE' : C.ink,
                }}
              >
                First Day
              </T>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Jump to today"
              onPress={() => jumpToDate(todayStr)}
              style={{
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 8,
                backgroundColor: selectedDate === todayStr ? C.green : C.paper,
                borderWidth: 1,
                borderColor: selectedDate === todayStr ? C.green : C.line,
              }}
            >
              <T
                style={{
                  fontSize: 11,
                  fontFamily: F.medium,
                  color: selectedDate === todayStr ? '#FAF5EE' : C.ink,
                }}
              >
                Today
              </T>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Jump to next anniversary month"
              onPress={() => jumpToDate(nextAnniv.targetDate)}
              style={{
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 8,
                backgroundColor: selectedDate === nextAnniv.targetDate ? C.green : C.paper,
                borderWidth: 1,
                borderColor: selectedDate === nextAnniv.targetDate ? C.green : C.line,
              }}
            >
              <T
                style={{
                  fontSize: 11,
                  fontFamily: F.medium,
                  color: selectedDate === nextAnniv.targetDate ? '#FAF5EE' : C.ink,
                }}
              >
                Next Anniversary
              </T>
            </Pressable>
          </View>
        </View>

        {/* Weekday Headers */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          {WEEKDAYS.map(day => (
            <View key={day} style={{ width: '13.6%', alignItems: 'center', paddingVertical: 4 }}>
              <T style={{ fontSize: 10, fontFamily: F.bold, color: C.muted, letterSpacing: 0.8 }}>
                {day}
              </T>
            </View>
          ))}
        </View>

        {/* 6-Week Calendar Grid */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 6 }}>
          {gridCells.map(cell => {
            const isSelected = cell.date === selectedDate;
            const hasOrigin = cell.isStartDay || cell.milestones.some(m => m.kind === 'origin' || m.kind === 'onboarding-chapter');
            const hasAnniv = cell.isAnniversaryDay || cell.milestones.some(m => m.kind === 'anniversary');
            const hasMonthiv = cell.isMonthiversaryDay || cell.milestones.some(m => m.kind === 'monthiversary');
            const hasSpecial = cell.milestones.some(m => m.kind === 'day-milestone' || m.kind === 'date-plan' || m.kind === 'linked');

            let cellBg = cell.inCurrentMonth ? C.paper : 'transparent';
            let cellBorder = cell.inCurrentMonth ? C.line : 'transparent';
            let textColor = cell.inCurrentMonth ? C.ink : '#B8ACA3';

            if (hasOrigin) {
              cellBg = '#F5DFDA';
              cellBorder = '#9E3B33';
              textColor = '#6E241E';
            } else if (hasAnniv) {
              cellBg = '#F6E8D5';
              cellBorder = '#8C4A27';
              textColor = '#5C3A21';
            } else if (hasMonthiv || hasSpecial) {
              cellBg = '#E4EDE4';
              cellBorder = '#3D5A45';
              textColor = '#233D29';
            }

            if (isSelected) {
              cellBg = C.green;
              cellBorder = C.green;
              textColor = '#FAF5EE';
            }

            return (
              <Pressable
                key={cell.date}
                accessibilityRole="button"
                accessibilityLabel={`${cell.date}${cell.milestones.length ? `, ${cell.milestones.map(m => m.title).join(', ')}` : ''}`}
                onPress={() => setSelectedDate(cell.date)}
                style={{
                  width: '13.6%',
                  minHeight: 42,
                  borderRadius: 10,
                  backgroundColor: cellBg,
                  borderWidth: isSelected || cell.isToday || hasOrigin || hasAnniv || hasMonthiv || hasSpecial ? 1.5 : 1,
                  borderColor: cell.isToday && !isSelected ? C.ink : cellBorder,
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingVertical: 5,
                  gap: 3,
                }}
              >
                <T
                  style={{
                    fontSize: 13,
                    fontFamily: isSelected || cell.isToday || hasOrigin || hasAnniv ? F.bold : F.body,
                    color: textColor,
                  }}
                >
                  {cell.dayOfMonth}
                </T>
                {/* Milestone Indicator Dots */}
                <View style={{ flexDirection: 'row', gap: 3, height: 5, alignItems: 'center' }}>
                  {hasOrigin && (
                    <View
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: 2.5,
                        backgroundColor: isSelected ? '#FAF5EE' : '#9E3B33',
                      }}
                    />
                  )}
                  {hasAnniv && (
                    <View
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: 2.5,
                        backgroundColor: isSelected ? '#FAF5EE' : '#8C4A27',
                      }}
                    />
                  )}
                  {(hasMonthiv || hasSpecial) && (
                    <View
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: 2.5,
                        backgroundColor: isSelected ? '#FAF5EE' : '#3D5A45',
                      }}
                    />
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Legend (Clean Unboxed Typography with Dot Indicators) */}
        <View style={[S.row, { flexWrap: 'wrap', gap: 12, paddingTop: 4 }]}>
          <View style={[S.row, { gap: 5 }]}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#9E3B33' }} />
            <T kind="small" style={{ fontSize: 11 }}>Origin & Onboarding</T>
          </View>
          <View style={[S.row, { gap: 5 }]}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#8C4A27' }} />
            <T kind="small" style={{ fontSize: 11 }}>Annual Anniversary</T>
          </View>
          <View style={[S.row, { gap: 5 }]}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#3D5A45' }} />
            <T kind="small" style={{ fontSize: 11 }}>Monthiversary & Milestones</T>
          </View>
        </View>
      </View>

      {/* Selected Calendar Day Details */}
      <View
        style={{
          backgroundColor: C.bg,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: C.line,
          padding: 14,
          gap: 10,
        }}
      >
        <View style={S.between}>
          <T kind="small" style={{ fontFamily: F.bold, color: C.ink }}>
            {formatReadableDate(selectedDate)}
          </T>
          <T kind="small" style={{ fontSize: 11, color: C.muted }}>
            {selectedDayMilestones.length === 0
              ? 'No milestone recorded on this date'
              : `${selectedDayMilestones.length} ${selectedDayMilestones.length === 1 ? 'milestone' : 'milestones'}`}
          </T>
        </View>

        {selectedDayMilestones.length > 0 ? (
          selectedDayMilestones.map(item => (
            <View
              key={item.id}
              style={{
                backgroundColor: C.paper,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: C.line,
                padding: 12,
                gap: 4,
              }}
            >
              <View style={[S.between, { gap: 8 }]}>
                <T style={{ fontFamily: F.medium, fontSize: 14, color: C.ink, flex: 1 }}>
                  {item.title}
                </T>
                <T kind="small" style={{ fontSize: 11, color: C.green, fontFamily: F.medium }}>
                  {item.categoryLabel}
                  {item.timeLabel ? ` · ${item.timeLabel}` : ''}
                </T>
              </View>
              <T style={{ fontSize: 13, color: C.ink }}>{item.subtitle}</T>
              {item.detail && (
                <T kind="small" style={{ fontSize: 11, color: C.muted }}>
                  {item.detail} ·{' '}
                  {item.isToday
                    ? 'Happening today!'
                    : item.daysDelta > 0
                      ? `In ${item.daysDelta} ${item.daysDelta === 1 ? 'day' : 'days'}`
                      : `${Math.abs(item.daysDelta)} ${Math.abs(item.daysDelta) === 1 ? 'day' : 'days'} ago`}
                </T>
              )}
            </View>
          ))
        ) : (
          <View style={[S.between, { flexWrap: 'wrap', gap: 8 }]}>
            <T kind="small" style={{ fontSize: 12 }}>
              Tap a highlighted date on the calendar or select a milestone below to inspect your story.
            </T>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Jump to relationship start date"
              onPress={() => jumpToDate(startDateKey)}
            >
              <T kind="small" style={{ color: C.green, fontFamily: F.bold }}>
                View Our Start Date →
              </T>
            </Pressable>
          </View>
        )}
      </View>

      {/* Filterable Onboarding & Milestone Timeline */}
      <View style={{ gap: 10 }}>
        <View style={[S.between, { flexWrap: 'wrap', gap: 8 }]}>
          <T kind="small" style={{ fontFamily: F.bold, color: C.ink }}>
            COLLECTED MILESTONES & UPCOMING DATES
          </T>
          <View
            style={{
              flexDirection: 'row',
              backgroundColor: C.bg,
              padding: 3,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: C.line,
              gap: 4,
            }}
          >
            {(
              [
                { id: 'all', label: 'All' },
                { id: 'origin', label: 'Onboarding' },
                { id: 'anniversary', label: 'Anniversaries' },
                { id: 'day-milestone', label: 'Days' },
              ] as const
            ).map(tab => {
              const active = filter === tab.id;
              return (
                <Pressable
                  key={tab.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Filter milestones by ${tab.label}`}
                  onPress={() => setFilter(tab.id)}
                  style={{
                    paddingHorizontal: 9,
                    paddingVertical: 5,
                    borderRadius: 7,
                    backgroundColor: active ? C.paper : 'transparent',
                  }}
                >
                  <T
                    style={{
                      fontSize: 11,
                      fontFamily: active ? F.bold : F.medium,
                      color: active ? C.ink : C.muted,
                    }}
                  >
                    {tab.label}
                  </T>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={{ gap: 8 }}>
          {(expanded ? filteredTimeline : filteredTimeline.slice(0, 7)).map(m => {
            const isSelected = m.date === selectedDate;
            return (
              <Pressable
                key={m.id}
                accessibilityRole="button"
                accessibilityLabel={`Show ${m.title} on calendar`}
                onPress={() => jumpToDate(m.date)}
                style={{
                  backgroundColor: isSelected ? C.pale : C.bg,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: isSelected ? C.green : C.line,
                  paddingHorizontal: 13,
                  paddingVertical: 10,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10,
                }}
              >
                <View style={{ flex: 1, gap: 2 }}>
                  <View style={[S.row, { gap: 6, flexWrap: 'wrap' }]}>
                    <T style={{ fontFamily: F.medium, fontSize: 13, color: C.ink }}>{m.title}</T>
                    <T kind="small" style={{ fontSize: 11, color: C.muted }}>
                      · {m.categoryLabel}
                    </T>
                  </View>
                  <T numberOfLines={2} kind="small" style={{ fontSize: 12, color: C.ink }}>
                    {m.subtitle}
                  </T>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 2 }}>
                  <T style={{ fontSize: 11, fontFamily: F.bold, color: C.green }}>
                    {formatReadableDate(m.date)}
                  </T>
                  <T kind="small" style={{ fontSize: 10, color: C.muted }}>
                    {m.isToday
                      ? 'Today'
                      : m.daysDelta > 0
                        ? `In ${m.daysDelta}d`
                        : `${Math.abs(m.daysDelta)}d ago`}
                  </T>
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>
    </Card>
  );
}

export function OriginStoryCard() {
  const { space } = useSpace();
  const { me, partner } = usePeople();
  const origin = space.originStory;

  if (!origin) return null;

  const pronounPossessive = origin.partnerGender === 'girl' ? 'her' : 'his';
  const pronounSubject = origin.partnerGender === 'girl' ? 'she' : 'he';
  const displayNickname = origin.partnerNickname || partner?.name || 'My Love';
  const startParsed = parseRelationshipStart(origin.relationshipStartedAt || space.startedOn);
  const formattedExactStart = startParsed
    ? `${startParsed.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })} · ${String(startParsed.getHours()).padStart(2, '0')}:${String(startParsed.getMinutes()).padStart(2, '0')}:${String(startParsed.getSeconds()).padStart(2, '0')}`
    : space.startedOn;

  return (
    <Card style={{ gap: 16 }}>
      <View style={S.between}>
        <View style={{ gap: 2 }}>
          <T kind="label" style={{ color: C.green }}>
            OUR FIRST CHAPTER
          </T>
          <T kind="sub">
            {me.name} & {displayNickname}
          </T>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="View milestones on calendar"
          onPress={() => router.push('/milestones')}
          style={[
            S.row,
            {
              gap: 5,
              paddingVertical: 6,
              paddingHorizontal: 10,
              borderRadius: 10,
              backgroundColor: C.bg,
              borderWidth: 1,
              borderColor: C.line,
            },
          ]}
        >
          <Lock size={12} color={C.green} />
          <T kind="small" style={{ color: C.green, fontFamily: F.medium, fontSize: 11 }}>
            Saved Memory Keepsake
          </T>
        </Pressable>
      </View>

      <View style={{ gap: 10 }}>
        <View style={{ backgroundColor: C.bg, borderRadius: 14, padding: 13, gap: 4 }}>
          <View style={[S.row, { gap: 7 }]}>
            <CalendarHeart size={15} color={C.green} />
            <T kind="small" style={{ fontFamily: F.medium, color: C.ink }}>
              1. When we first met
            </T>
          </View>
          <T style={{ fontSize: 14 }}>{origin.whenWeMet || 'Our unforgettable first hello'}</T>
        </View>

        <View style={{ backgroundColor: C.bg, borderRadius: 14, padding: 13, gap: 4 }}>
          <View style={[S.row, { gap: 7 }]}>
            <Shirt size={15} color={C.green} />
            <T kind="small" style={{ fontFamily: F.medium, color: C.ink }}>
              2. What {pronounSubject} was wearing
            </T>
          </View>
          <T style={{ fontSize: 14 }}>{origin.partnerOutfit || `Still remember ${pronounPossessive} look`}</T>
        </View>

        <View style={{ backgroundColor: C.bg, borderRadius: 14, padding: 13, gap: 4 }}>
          <View style={[S.row, { gap: 7 }]}>
            <Sparkles size={15} color={C.green} />
            <T kind="small" style={{ fontFamily: F.medium, color: C.ink }}>
              3. Who proposed first
            </T>
          </View>
          <T style={{ fontSize: 14 }}>
            {origin.whoProposed || 'Both of us'}
            {origin.proposalNote ? ` — ${origin.proposalNote}` : ''}
          </T>
        </View>

        <View style={{ backgroundColor: C.bg, borderRadius: 14, padding: 13, gap: 4 }}>
          <View style={[S.row, { gap: 7 }]}>
            <Heart size={15} color={C.green} />
            <T kind="small" style={{ fontFamily: F.medium, color: C.ink }}>
              4. When we got in a relationship
            </T>
          </View>
          <T style={{ fontSize: 14 }}>{origin.whenRelationshipStarted || space.startedOn}</T>
          <View style={[S.row, { gap: 5, marginTop: 2 }]}>
            <Clock size={12} color={C.muted} />
            <T kind="small" style={{ fontSize: 11 }}>
              Official start clock: {formattedExactStart}
            </T>
          </View>
        </View>
      </View>
    </Card>
  );
}


