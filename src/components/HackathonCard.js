import React from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { ChevronRight, Clock } from 'lucide-react-native';
import Card from './Card';
import Badge from './Badge';
import { getHackathonTiming } from '../utils/dateUtils';
import { getStatusLabel } from '../constants/statusLabels';
import { colors, spacing, typography } from '../constants/theme';

export default function HackathonCard({ hackathon, onPress }) {
  const { title, organizationName, startDate, endDate, status } = hackathon;
  const timing = getHackathonTiming(startDate, endDate);
  return (
    <Pressable onPress={onPress}>
      <Card style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          <Badge label={status} displayLabel={getStatusLabel(status)} />
        </View>
        {organizationName ? <Text style={styles.org}>{organizationName}</Text> : null}
        {(startDate || endDate) && <Text style={styles.dates}>{startDate} → {endDate}</Text>}
        <View style={styles.footerRow}>
          {timing ? (
            <View style={styles.timingRow}>
              <Clock size={13} color={colors.textSecondary} />
              <Text style={styles.timingText}>{timing}</Text>
            </View>
          ) : (
            <Text style={styles.viewText}>View details</Text>
          )}
          <ChevronRight size={18} color={colors.textMuted} />
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing.md },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { ...typography.h3, flex: 1, marginRight: spacing.sm },
  org: { ...typography.bodySecondary, marginTop: spacing.xs },
  dates: { ...typography.caption, marginTop: spacing.xs },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
  timingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  timingText: { ...typography.caption, color: colors.textSecondary, fontWeight: '600' },
  viewText: { ...typography.caption, color: colors.primary, fontWeight: '600' },
});