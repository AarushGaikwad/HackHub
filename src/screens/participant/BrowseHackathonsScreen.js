import React, { useCallback, useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, RefreshControl } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import HackathonCard from '../../components/HackathonCard';
import Input from '../../components/Input';
import LoadingState from '../../components/LoadingState';
import ErrorState from '../../components/ErrorState';
import EmptyState from '../../components/EmptyState';
import * as commonApi from '../../api/commonApi';
import { spacing } from '../../constants/theme';

export default function BrowseHackathonsScreen({ navigation }) {
  const [hackathons, setHackathons] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await commonApi.getAllHackathons();
      setHackathons(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load hackathons');
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  // Client-side filter for now — commonApi.searchHackathons is currently
  // ORGANIZER-only on the backend (see the note in common.api.js).
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

      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <HackathonCard hackathon={item} onPress={() => navigation.navigate('HackathonDetail', { hackathonId: item.id })} />
        )}
        ListEmptyComponent={<EmptyState title="No hackathons found" subtitle="Check back soon or try a different search." />}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  searchWrap: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  searchInput: { marginBottom: 0 },
  listContent: { padding: spacing.lg, flexGrow: 1 },
});