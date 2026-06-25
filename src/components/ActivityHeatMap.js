import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SHADOWS } from '../constants/theme';
import { computeCurrentStreak, computeLongestStreak } from '../utils/streak';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTHS = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];

const hexToRgb = (hex) => {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
};

const lerpRgb = (from, to, t) => {
  const a = hexToRgb(from);
  const b = hexToRgb(to);
  return a.map((v, i) => Math.round(v + (b[i] - v) * t));
};

const rgbStr = ([r, g, b]) => `rgb(${r}, ${g}, ${b})`;

export default function ActivityHeatMap({ viewActivity = [], currentStreak: currentStreakProp, isDark, cardBg, text, subText, border }) {
  const localDateKey = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const todayKey = localDateKey(now);

  const countByDate = {};
  viewActivity.forEach(({ date, count }) => { countByDate[date] = count; });
  const maxCount = Math.max(1, ...Object.values(countByDate));
  
  const dates = Object.keys(countByDate);
  let totalViews = 0;
  dates.forEach((date) => { totalViews += countByDate[date]; });

  // Longest streak within the displayed month; current streak comes from the
  // context (which spans month boundaries) when provided, falling back to the
  // month-scoped data otherwise.
  const longestStreak = computeLongestStreak(dates);
  const currentStreak = currentStreakProp ?? computeCurrentStreak(dates);

  const daysPassed = now.getDate();
  const dailyAverage = daysPassed > 0 ? Math.round(totalViews / daysPassed) : 0;

  const emptyColor = isDark ? COLORS.darkBorder : COLORS.bg3;
  const fullColor = isDark ? COLORS.bg1 : COLORS.accent;

  const levelColor = (count) => {
    if (!count) return hexToRgb(emptyColor);
    const level = Math.ceil((count / maxCount) * 4);
    return lerpRgb(emptyColor, fullColor, level / 4);
  };

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadingBlanks = new Date(year, month, 1).getDay();

  const cells = [];
  for (let i = 0; i < leadingBlanks; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) cells.push(day);

  return (
    <View style={[styles.card, { backgroundColor: cardBg, borderColor: border }]}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <View style={[styles.iconWrapper, { backgroundColor: emptyColor }]}>
            <Ionicons name="calendar-outline" size={24} color={text} />
          </View>
          <View style={{ marginLeft: 14 }}>
            <Text style={[styles.title, { color: text }]}>{MONTHS[month]} ACTIVITY</Text>
            <Text style={[styles.subtitle, { color: subText }]}>Your daily views</Text>
          </View>
        </View>
      </View>

      <View style={styles.weekRow}>
        {WEEKDAYS.map((d, i) => (
          <View key={`wd-${i}`} style={styles.weekSlot}>
            <Text style={[styles.weekLabel, { color: text }]}>{d}</Text>
          </View>
        ))}
      </View>

      <View style={styles.grid}>
        {cells.map((day, i) => {
          if (day === null) return <View key={`b${i}`} style={styles.cellSlot} />;
          const key = localDateKey(new Date(year, month, day));
          const count = countByDate[key] || 0;
          const isToday = key === todayKey;
          const rgb = levelColor(count);
          return (
            <View key={key} style={styles.cellSlot}>
              <View
                style={[
                  styles.cell,
                  { backgroundColor: rgbStr(rgb) },
                  isToday && { borderWidth: 2, borderColor: isDark ? COLORS.bg2 : COLORS.accentWarm },
                ]}
              />
            </View>
          );
        })}
      </View>

      <View style={[styles.statsOuter, { borderTopColor: border }]}>
        <View style={styles.statsLeft}>
          <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
            <Text style={[styles.statTitle, { color: subText }]}>Daily average: </Text>
            <Text style={[styles.statTitle, { color: text, fontWeight: '700' }]}>{dailyAverage} views</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: 8 }}>
            <Text style={[styles.statTitle, { color: subText }]}>Current streak: </Text>
            <Text style={[styles.statTitle, { color: text, fontWeight: '700' }]}>{currentStreak} {currentStreak === 1 ? 'day' : 'days'}</Text>
          </View>
        </View>
        <View style={styles.statsRight}>
          <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
            <Text style={[styles.statTitle, { color: subText }]}>Longest streak: </Text>
            <Text style={[styles.statTitle, { color: text, fontWeight: '700' }]}>{longestStreak} {longestStreak === 1 ? 'day' : 'days'}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const { width: SCREEN_W } = Dimensions.get('window');
const CARD_INNER = Math.min(SCREEN_W, 800) - 48 - 40;
const SLOT_SIZE = CARD_INNER / 7;

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 24,
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
    ...SHADOWS.small,
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'flex-start', 
    marginBottom: 24, 
    justifyContent: 'space-between' 
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: { 
    fontSize: 14, 
    fontWeight: '800', 
    letterSpacing: FONTS.tracking.wide, 
    textTransform: 'uppercase', 
    marginBottom: 2 
  },
  subtitle: { 
    fontSize: 14, 
    fontWeight: '600' 
  },

  legend: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 4,
    marginTop: 4
  },
  legendLabel: { 
    fontSize: 10, 
    fontWeight: '700', 
    marginHorizontal: 2 
  },
  legendSwatch: { 
    width: 12, 
    height: 12, 
    borderRadius: 3 
  },

  weekRow: { 
    flexDirection: 'row', 
    marginBottom: 8 
  },
  weekSlot: {
    width: `${100 / 7}%`,
    alignItems: 'center',
  },
  grid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap' 
  },
  cellSlot: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    padding: 3,
  },
  weekLabel: { 
    fontSize: 11, 
    fontWeight: '800' 
  },
  cell: {
    flex: 1,
    borderRadius: 4,
  },

  statsOuter: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statsLeft: {
    flex: 1,
  },
  statsRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  statTitle: { 
    fontSize: 12, 
    fontWeight: '600' 
  },
});
