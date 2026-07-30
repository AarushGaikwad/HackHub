import React, { useCallback, useEffect, useState } from 'react';
import { Text, View, StyleSheet, Alert, Pressable, ActivityIndicator } from 'react-native';
import { Award, Download } from 'lucide-react-native';
import ScreenContainer from '../../components/ScreenContainer';
import Card from '../../components/Card';
import LoadingState from '../../components/LoadingState';
import ErrorState from '../../components/ErrorState';
import EmptyState from '../../components/EmptyState';
import * as participantApi from '../../api/participantApi';
import { savePdfAndShare } from '../../utils/downloadFile';
import { colors, spacing, typography } from '../../constants/theme';

export default function CertificatesScreen() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

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

  if (loading) return <ScreenContainer scroll={false}><LoadingState /></ScreenContainer>;
  if (error) return <ScreenContainer scroll={false}><ErrorState message={error} onRetry={load} /></ScreenContainer>;

  return (
    <ScreenContainer>
      <Text style={styles.title}>My Certificates</Text>

      {certificates.length === 0 ? (
        <EmptyState title="Participate to earn more!" subtitle="Certificates appear here after a hackathon ends." />
      ) : (
        certificates.map((cert) => (
          <Card key={cert.id} style={styles.card}>
            <View style={styles.row}>
              <Award size={20} color={colors.primary} />
              <View style={{ flex: 1, marginLeft: spacing.sm }}>
                <Text style={styles.type}>{cert.type || 'PARTICIPATION'}</Text>
                <Text style={styles.hackathon}>{cert.hackathonName}</Text>
                <Text style={styles.date}>Issued: {cert.issuedDate}</Text>
              </View>
              <Pressable onPress={() => handleDownload(cert)} hitSlop={10} disabled={downloadingId === cert.id}>
                {downloadingId === cert.id ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <Download size={18} color={colors.textMuted} />
                )}
              </Pressable>
            </View>
          </Card>
        ))
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.h1, marginBottom: spacing.lg },
  card: { marginBottom: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center' },
  type: { ...typography.caption, color: colors.primary, fontWeight: '700' },
  hackathon: { ...typography.h3, marginTop: 2 },
  date: { ...typography.bodySecondary, marginTop: 2 },
});