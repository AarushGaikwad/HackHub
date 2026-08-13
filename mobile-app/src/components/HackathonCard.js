import React from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { ChevronRight, Clock, Calendar, Users } from 'lucide-react-native';
import Card from './Card';
import Badge from './Badge';
import { getHackathonTiming, getRegistrationUrgency } from '../utils/dateUtils';
import { getStatusLabel } from '../constants/statusLabels';
import { useTheme } from '../context/ThemeContext';

function formatShortDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatDateRange(startDate, endDate) {
  const start = formatShortDate(startDate);
  const end = formatShortDate(endDate);
  if (start && end) return `${start} - ${end}`;
  return start || end || null;
}

export default function HackathonCard({ hackathon, onPress }) {
  const { colors, spacing, radius, typography } = useTheme();
  const styles = getStyles(colors, spacing, radius, typography);

  const {
    title,
    organizationName,
    description,
    startDate,
    endDate,
    maxTeamSize,
    registrationDeadline,
    status,
  } = hackathon;

  const timing = getHackathonTiming(startDate, endDate);
  const urgency = getRegistrationUrgency(registrationDeadline);
  const dateRange = formatDateRange(startDate, endDate);

  return (
    <Pressable onPress={onPress}>
      <Card style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          <Badge label={status} displayLabel={getStatusLabel(status)} />
        </View>
        {organizationName ? <Text style={styles.org}>Hosted by {organizationName}</Text> : null}
        {description ? (
          <Text style={styles.description} numberOfLines={2}>{description}</Text>
        ) : null}

        {(dateRange || maxTeamSize) && (
          <View style={styles.statsRow}>
            {dateRange ? (
              <View style={styles.statBox}>
                <View style={styles.statLabelRow}>
                  <Calendar size={12} color={colors.textMuted} />
                  <Text style={styles.statLabel}>Dates</Text>
                </View>
                <Text style={styles.statValue}>{dateRange}</Text>
              </View>
            ) : null}
            {maxTeamSize ? (
              <View style={styles.statBox}>
                <View style={styles.statLabelRow}>
                  <Users size={12} color={colors.textMuted} />
                  <Text style={styles.statLabel}>Team size</Text>
                </View>
                <Text style={styles.statValue}>Up to {maxTeamSize}</Text>
              </View>
            ) : null}
          </View>
        )}

        {urgency ? (
          <View style={styles.urgencyBox}>
            <Clock size={14} color={colors.warning} />
            <Text style={styles.urgencyText}>{urgency}</Text>
          </View>
        ) : null}

        <View style={styles.footerRow}>
          {timing ? (
            <Text style={styles.timingText}>{timing}</Text>
          ) : (
            <Text style={styles.viewText}>View details</Text>
          )}
          <ChevronRight size={18} color={colors.textMuted} />
        </View>
      </Card>
    </Pressable>
  );
}

const getStyles = (colors, spacing, radius, typography) => StyleSheet.create({
  card: { marginBottom: spacing.md },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { ...typography.h3, flex: 1, marginRight: spacing.sm },
  org: { ...typography.bodySecondary, marginTop: spacing.xs },
  description: { ...typography.bodySecondary, marginTop: spacing.sm, lineHeight: 19 },

  statsRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  statBox: { flex: 1, backgroundColor: colors.bgElevated, borderRadius: radius.sm, padding: spacing.sm },
  statLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statLabel: { ...typography.caption, color: colors.textMuted },
  statValue: { ...typography.bodySecondary, fontWeight: '600', color: colors.textPrimary, marginTop: 2 },

  urgencyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.warningMuted,
    borderRadius: radius.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    marginTop: spacing.sm,
  },
  urgencyText: { ...typography.caption, color: colors.warning, fontWeight: '600' },

  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  timingText: { ...typography.caption, color: colors.textSecondary, fontWeight: '600' },
  viewText: { ...typography.caption, color: colors.primary, fontWeight: '600' },
});