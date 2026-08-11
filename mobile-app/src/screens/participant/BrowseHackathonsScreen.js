import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, ScrollView, Pressable } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import HackathonCard from '../../components/HackathonCard';
import Input from '../../components/Input';
import LoadingState from '../../components/LoadingState';
import ErrorState from '../../components/ErrorState';
import EmptyState from '../../components/EmptyState';
import * as commonApi from '../../api/commonApi';
import { colors, radius, spacing, typography } from '../../constants/theme';


const STATUS_FILTERS = [
  { key: 'ALL', label: 'All' },
  { key: 'ACTIVE', label: 'Active' },
  { key: 'UPCOMING', label: 'Upcoming' },
  { key: 'COMPLETED', label: 'Completed' },
];

export default function BrowseHackathonsScreen({ navigation }) {
  const [hackathons, setHackathons] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data =
        statusFilter === 'ALL'
          ? await commonApi.getAllHackathons()
          : await commonApi.filterHackathonsByStatus(statusFilter);
      setHackathons(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load hackathons');
    }
  }, [statusFilter]);

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  // Client-side title filter on top of whatever the status filter already
  // returned — commonApi.searchHackathons is ORGANIZER-only on the backend,
  // so this is the participant-facing workaround.
  const filtered = keyword.trim()
    ? hackathons.filter((h) => h.title?.toLowerCase().includes(keyword.trim().toLowerCase()))
    : hackathons;

  if (loading) return <ScreenContainer scroll={false}><LoadingState label="Loading hackathons..." /></ScreenContainer>;
  if (error) return <ScreenContainer scroll={false}><ErrorState message={error} onRetry={load} /></ScreenContainer>;

  return (
    <ScreenContainer scroll={false}>
      <View style={styles.searchWrap}>
        <Input placeholder="Search hackathons..." value={keyword} onChangeText={setKeyword} style={styles.searchInput} />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
        style={styles.chipScroll}
      >
        {STATUS_FILTERS.map((f) => {
          const active = f.key === statusFilter;
          return (
            <Pressable
              key={f.key}
              onPress={() => setStatusFilter(f.key)}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{f.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <HackathonCard hackathon={item} onPress={() => navigation.navigate('HackathonDetail', { hackathonId: item.id })} />
        )}
        ListEmptyComponent={<EmptyState title="No hackathons found" subtitle="Try a different search or filter." />}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  searchWrap: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  searchInput: { marginBottom: 0 },
  chipScroll: { flexGrow: 0, marginTop: spacing.sm },
  chipRow: { paddingHorizontal: spacing.lg, gap: spacing.xs, paddingBottom: spacing.sm },
  chip: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { borderColor: colors.primary, backgroundColor: colors.primaryMuted },
  chipText: { ...typography.caption, fontWeight: '600', color: colors.textSecondary },
  chipTextActive: { color: colors.primary },
  listContent: { padding: spacing.lg, paddingTop: spacing.sm, flexGrow: 1 },
});