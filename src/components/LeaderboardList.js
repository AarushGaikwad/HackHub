import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Trophy } from 'lucide-react-native';
import Card from './Card';
import EmptyState from './EmptyState';
import { colors, spacing, typography } from '../constants/theme';

const RANK_COLORS = { 1: '#F5B94D', 2: '#C7CCD6', 3: '#C97B4A' };

export default function LeaderboardList({ entries = [] }) {
  if (entries.length === 0) {
    return <EmptyState title="No scores yet" subtitle="The leaderboard fills in as evaluations are submitted." />;
  }

  return (
    <View>
      {entries.map((entry, index) => {
        const rank = entry.rank ?? index + 1;
        const rankColor = RANK_COLORS[rank] || colors.textMuted;
        return (
          <Card key={entry.teamId ?? entry.id ?? rank} style={styles.row}>
            <View style={[styles.rankBadge, { borderColor: rankColor }]}>
              {rank <= 3 ? <Trophy size={14} color={rankColor} /> : <Text style={[styles.rankText, { color: rankColor }]}>{rank}</Text>}
            </View>
            <View style={{ flex: 1, marginLeft: spacing.md }}>
              <Text style={styles.teamName}>{entry.teamName}</Text>
              {entry.projectTitle ? <Text style={styles.projectTitle}>{entry.projectTitle}</Text> : null}
            </View>
            <Text style={styles.score}>{entry.averageScore ?? entry.score}</Text>
          </Card>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm, paddingVertical: spacing.md },
  rankBadge: { width: 32, height: 32, borderRadius: 16, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  rankText: { fontSize: 13, fontWeight: '700' },
  teamName: { ...typography.h3, fontSize: 16 },
  projectTitle: { ...typography.bodySecondary, marginTop: 2 },
  score: { ...typography.h2, color: colors.primary },
});