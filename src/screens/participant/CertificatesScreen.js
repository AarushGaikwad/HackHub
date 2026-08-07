import React, { useCallback, useEffect, useState } from 'react';
import { Text, View, StyleSheet, Alert, Pressable } from 'react-native';
import { Award, Download, Share2, ChevronRight } from 'lucide-react-native';
import ScreenContainer from '../../components/ScreenContainer';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import LoadingState from '../../components/LoadingState';
import ErrorState from '../../components/ErrorState';
import EmptyState from '../../components/EmptyState';
import * as participantApi from '../../api/participantApi';
import { savePdfAndShare } from '../../utils/downloadFile';
import { useAuth } from '../../context/AuthContext';
import { colors, radius, spacing, typography } from '../../constants/theme';

// WINNER gets the success/gold treatment, everything else (PARTICIPATION,
// RUNNER_UP, etc.) falls back to the neutral accent style.
const TYPE_ACCENT = {
  WINNER: colors.success,
};

export default function CertificatesScreen() {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await participantApi.getMyCertificates();
      setCertificates(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load certificates');
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [load]);

  const handleDownload = async (cert) => {
    setDownloadingId(cert.id);
    try {
      const response = await participantApi.downloadCertificate(cert.id);
      const filename = `HackHub_Certificate_${cert.hackathonName || cert.id}.pdf`.replace(/\s+/g, '_');
      await savePdfAndShare(response.data, filename);
    } catch (err) {
      Alert.alert('Download failed', err.message || 'Please try again.');
    } finally {
      setDownloadingId(null);
    }
  };

  const toggleExpand = (certId) => {
    setExpandedId((current) => (current === certId ? null : certId));
  };

  if (loading) return <ScreenContainer scroll={false}><LoadingState /></ScreenContainer>;
  if (error) return <ScreenContainer scroll={false}><ErrorState message={error} onRetry={load} /></ScreenContainer>;

  return (
    <ScreenContainer>
      <Text style={styles.title}>My Certificates</Text>

      {certificates.length === 0 ? (
        <EmptyState title="Participate to earn more!" subtitle="Certificates appear here after a hackathon ends." />
      ) : (
        certificates.map((cert) => {
          const type = (cert.type || 'PARTICIPATION').toUpperCase();
          const accent = TYPE_ACCENT[type] || colors.primary;
          const isExpanded = expandedId === cert.id;
          const isDownloading = downloadingId === cert.id;

          return (
            <View key={cert.id} style={{ marginBottom: spacing.md }}>
              <Pressable onPress={() => toggleExpand(cert.id)}>
                <Card style={[styles.card, { borderLeftColor: accent, borderLeftWidth: 3 }]}>
                  <View style={styles.rowHeader}>
                    <Badge label={type} />
                    <ChevronRight
                      size={18}
                      color={colors.textMuted}
                      style={{ transform: [{ rotate: isExpanded ? '90deg' : '0deg' }] }}
                    />
                  </View>
                  <Text style={styles.hackathon}>{cert.hackathonName}</Text>
                  <Text style={styles.date}>Issued {cert.issuedDate}</Text>
                </Card>
              </Pressable>

              {isExpanded && (
                <Card style={styles.previewCard}>
                  <View style={styles.previewInner}>
                    <Award size={36} color={accent} />
                    <Text style={styles.previewKicker}>CERTIFICATE OF ACHIEVEMENT</Text>
                    <Text style={styles.previewType}>{type === 'WINNER' ? 'Winner' : 'Participation'}</Text>
                    <Text style={styles.previewLine}>This certifies that</Text>
                    <Text style={styles.previewName}>{user?.name}</Text>
                    <Text style={styles.previewLine}>
                      {type === 'WINNER' ? 'won at' : 'participated in'}
                    </Text>
                    <Text style={styles.previewHackathon}>{cert.hackathonName}</Text>
                    <Text style={styles.previewDate}>Issued {cert.issuedDate}</Text>
                  </View>

                  <View style={styles.previewActions}>
                    <Button
                      title="Share"
                      variant="secondary"
                      icon={<Share2 size={16} color={colors.primary} style={{ marginRight: spacing.xs }} />}
                      loading={isDownloading}
                      onPress={() => handleDownload(cert)}
                      style={{ flex: 1 }}
                    />
                    <Button
                      title="Download"
                      icon={<Download size={16} color="#fff" style={{ marginRight: spacing.xs }} />}
                      loading={isDownloading}
                      onPress={() => handleDownload(cert)}
                      style={{ flex: 1 }}
                    />
                  </View>
                </Card>
              )}
            </View>
          );
        })
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.h1, marginBottom: spacing.lg },
  card: {},
  rowHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  hackathon: { ...typography.h3 },
  date: { ...typography.caption, marginTop: 2 },

  previewCard: { marginTop: spacing.sm, backgroundColor: colors.bg },
  previewInner: { alignItems: 'center', paddingVertical: spacing.md },
  previewKicker: { ...typography.caption, letterSpacing: 1, marginTop: spacing.md },
  previewType: { ...typography.h2, marginTop: 4, marginBottom: spacing.sm },
  previewLine: { ...typography.bodySecondary, fontSize: 13 },
  previewName: { ...typography.h3, marginTop: 2, marginBottom: 2 },
  previewHackathon: { ...typography.h3, fontSize: 15, marginTop: 2 },
  previewDate: { ...typography.caption, marginTop: spacing.md },
  previewActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
});