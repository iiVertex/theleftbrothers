import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SHADOWS } from '../constants/theme';

const { width: SCREEN_W } = Dimensions.get('window');
const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

// Card spans the screen minus the 24px ProfileScreen side margins, minus 20px inner padding.
const CARD_INNER = SCREEN_W - 48 - 40;
const SLOT_SIZE = CARD_INNER / 7;
const CELL_GAP = 5;

const hexToRgb = (hex) => {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
};

// Linear interpolation between two hex colors; t in [0, 1].
const lerpRgb = (from, to, t) => {
  const a = hexToRgb(from);
  const b = hexToRgb(to);
  return a.map((v, i) => Math.round(v + (b[i] - v) * t));
};

const rgbStr = ([r, g, b]) => `rgb(${r}, ${g}, ${b})`;

// Perceived brightness — picks readable text against a given cell color.
const isLight = ([r, g, b]) => (r * 299 + g * 587 + b * 114) / 1000 > 140;

export default function ActivityHeatMap({ viewActivity = [], isDark, cardBg, text, subText, border }) {
  const localDateKey = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const todayKey = localDateKey(now);

  const countByDate = {};
  viewActivity.forEach(({ date, count }) => { countByDate[date] = count; });
  const maxCount = Math.max(1, ...Object.values(countByDate));
  const totalViews = Object.values(countByDate).reduce((s, c) => s + c, 0);

  // In light mode activity darkens toward black; in dark mode it lightens toward beige.
  const emptyColor = isDark ? COLORS.darkBorder : COLORS.bg3;
  const fullColor = isDark ? COLORS.bg1 : COLORS.accent;

  // 5 levels (0 = no activity, 4 = busiest). Returns an [r,g,b] array.
  const levelColor = (count) => {
    if (!count) return hexToRgb(emptyColor);
    const level = Math.ceil((count / maxCount) * 4); // 1..4
    return lerpRgb(emptyColor, fullColor, level / 4);
  };

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadingBlanks = new Date(year, month, 1).getDay();

  // Flat list of cells: nulls for the leading-weekday offset, then each day.
  const cells = [];
  for (let i = 0; i < leadingBlanks; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) cells.push(day);

  return (
    <View style={[styles.card, { backgroundColor: cardBg, borderColor: border }]}>
      <View style={styles.header}>
        <View style={[styles.iconWrapper, { backgroundColor: isDark ? COLORS.darkBorder : COLORS.bg3 }]}>
          <Ionicons name="calendar-outline" size={20} color={subText} />
        </View>
        <View>
          <Text style={[styles.title, { color: text }]}>Monthly Activity</Text>
          <Text style={[styles.subtitle, { color: subText }]}>Your daily views this month</Text>
        </View>
      </View>

      {/* Weekday labels */}
      <View style={styles.weekRow}>
        {WEEKDAYS.map((d, i) => (
          <View key={i} style={styles.cellSlot}>
            <Text style={[styles.weekLabel, { color: subText }]}>{d}</Text>
          </View>
        ))}
      </View>

      {/* Day grid */}
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
                  isToday && { borderWidth: 2, borderColor: COLORS.accent },
                ]}
              >
                <Text style={[styles.cellText, { color: isLight(rgb) ? COLORS.accent : COLORS.bg1 }]}>
                  {day}
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      {/* Footer: month total + legend */}
      <View style={[styles.footer, { borderTopColor: border }]}>
        <Text style={[styles.footerText, { color: text }]}>
          {MONTHS[month]} · {totalViews} {totalViews === 1 ? 'view' : 'views'}
        </Text>
        <View style={styles.legend}>
          <Text style={[styles.legendLabel, { color: subText }]}>Less</Text>
          {[0, 1, 2, 3, 4].map((level) => (
            <View
              key={level}
              style={[styles.legendSwatch, { backgroundColor: rgbStr(lerpRgb(emptyColor, fullColor, level / 4)) }]}
            />
          ))}
          <Text style={[styles.legendLabel, { color: subText }]}>More</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 24,
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
    ...SHADOWS.small,
  },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  title: { fontSize: 13, fontWeight: '700', letterSpacing: FONTS.tracking.wide, textTransform: 'uppercase', marginBottom: 2 },
  subtitle: { fontSize: 13, fontWeight: '500' },

  weekRow: { flexDirection: 'row', marginBottom: 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cellSlot: {
    width: SLOT_SIZE,
    height: SLOT_SIZE,
    padding: CELL_GAP / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekLabel: { fontSize: 10, fontWeight: '700' },
  cell: {
    width: '100%',
    height: '100%',
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellText: { fontSize: 10, fontWeight: '600' },

  footer: {
    marginTop: 12,
    paddingTop: 14,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: { fontSize: 13, fontWeight: '700' },
  legend: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  legendLabel: { fontSize: 10, fontWeight: '600', marginHorizontal: 3 },
  legendSwatch: { width: 12, height: 12, borderRadius: 3 },
});
