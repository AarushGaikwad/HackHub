import React from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import Card from './Card';
import Badge from './Badge';
import { colors, spacing, typography } from '../constants/theme';

export default function HackathonCard({ hackathon, onPress }) {
  const { title, organizationName, startDate, endDate, status } = hackathon;
  return (
    <Pressable onPress={onPress}>
      <Card style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          <Badge label={status} />
        </View>
        {organizationName ? <Text style={styles.org}>{organizationName}</Text> : null}
        {(startDate || endDate) && <Text style={styles.dates}>{startDate} → {endDate}</Text>}
        <View style={styles.footerRow}>
          <Text style={styles.viewText}>View details</Text>
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
  viewText: { ...typography.caption, color: colors.primary, fontWeight: '600' },
});