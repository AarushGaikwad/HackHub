import React, { useCallback, useEffect, useState } from 'react';
import { Text, View, StyleSheet, Alert, Pressable, Platform, UIManager, LayoutAnimation } from 'react-native';
import { Award, Download, Share2, ChevronDown, Trophy, Medal } from 'lucide-react-native';
import ScreenContainer from '../../components/ScreenContainer';
import Card from '../../components/Card';
import Button from '../../components/Button';
import LoadingState from '../../components/LoadingState';
import ErrorState from '../../components/ErrorState';
import EmptyState from '../../components/EmptyState';
import * as participantApi from '../../api/participantApi';
import { downloadPdf, sharePdf } from '../../utils/downloadFile';
import { useTheme } from '../../context/ThemeContext';
import { radius, spacing } from '../../constants/theme';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function CertificatesScreen() {
  const { colors, typography } = useTheme();
  const styles = getStyles(colors, typography);
  const TYPE_ACCENT = { WINNER: colors.success };

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

  const formatIssuedDate = (issuedAt) => {
    if (!issuedAt) return '';
    try {
      return new Date(issuedAt).toLocaleDateString();
    } catch {
      return issuedAt;
    }
  };

  const handleDownload = async (cert) => {
  setDownloadingId(cert.id);

    try {
      const response =
        await participantApi.downloadCertificate(cert.id);

      const filename = `HackHub_Certificate_${
        cert.hackathonTitle || cert.id
      }.pdf`.replace(/\s+/g, '_');

      await downloadPdf(response.data, filename);

      Alert.alert(
        'Download successful',
        'Your certificate has been saved successfully.'
      );

    } catch (err) {
      Alert.alert(
        'Download failed',
        err.message || 'Please try again.'
      );
    } finally {
      setDownloadingId(null);
    }
  };

  const handleShare = async (cert) => {
    setDownloadingId(cert.id);

    try {
      const response =
        await participantApi.downloadCertificate(cert.id);

      const filename = `HackHub_Certificate_${
        cert.hackathonTitle || cert.id
      }.pdf`.replace(/\s+/g, '_');

      await sharePdf(
        response.data,
        filename
      );

    } catch (err) {
      Alert.alert(
        'Share failed',
        err.message || 'Please try again.'
      );
    } finally {
      setDownloadingId(null);
    }
  };

  const toggleExpand = (certId) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId((current) => (current === certId ? null : certId));
  };

  if (loading) {
    return (
      <ScreenContainer scroll={false}>
        <LoadingState />
      </ScreenContainer>
    );
  }

  if (error) {
    return (
      <ScreenContainer scroll={false}>
        <ErrorState message={error} onRetry={load} />
      </ScreenContainer>
    );
  }

  const winCount = certificates.filter(
    (certificate) => (certificate.type || '').toUpperCase() === 'WINNER'
  ).length;

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.title}>My Certificates</Text>
        {certificates.length > 0 && (
          <Text style={styles.subtitle}>
            {certificates.length} earned
            {winCount > 0 ? ` · ${winCount} win${winCount > 1 ? 's' : ''}` : ''}
          </Text>
        )}
      </View>

      {certificates.length === 0 ? (
        <View style={styles.emptyWrap}>
          <View style={styles.emptyMedallion}>
            <Award size={30} color={colors.textMuted} />
          </View>
          <EmptyState
            title="Participate to earn more!"
            subtitle="Certificates appear here after a hackathon ends."
          />
        </View>
      ) : (
        certificates.map((cert) => {
          const type = (cert.type || 'PARTICIPATION').toUpperCase();
          const isWinner = type === 'WINNER';
          const accent = TYPE_ACCENT[type] || colors.primary;
          const isExpanded = expandedId === cert.id;
          const isDownloading = downloadingId === cert.id;

          return (
            <View key={cert.id} style={styles.item}>
              <Pressable onPress={() => toggleExpand(cert.id)}>
                <Card style={[styles.tile, isExpanded && { borderColor: accent }]}>
                  <View
                    style={[
                      styles.medallion,
                      {
                        backgroundColor: `${accent}20`,
                        borderColor: accent,
                      },
                    ]}
                  >
                    {isWinner ? (
                      <Trophy size={20} color={accent} />
                    ) : (
                      <Medal size={20} color={accent} />
                    )}
                  </View>

                  <View style={styles.tileBody}>
                    <Text style={styles.hackathon} numberOfLines={1}>
                      {cert.hackathonTitle}
                    </Text>
                    <View style={styles.tileMetaRow}>
                      <View
                        style={[
                          styles.typePill,
                          { backgroundColor: `${accent}20` },
                        ]}
                      >
                        <Text style={[styles.typePillText, { color: accent }]}>
                          {isWinner ? 'Winner' : 'Participation'}
                        </Text>
                      </View>
                      <Text style={styles.tileDate}>
                        Issued {formatIssuedDate(cert.issuedAt)}
                      </Text>
                    </View>
                  </View>

                  <ChevronDown
                    size={18}
                    color={colors.textMuted}
                    style={{
                      transform: [{ rotate: isExpanded ? '180deg' : '0deg' }],
                    }}
                  />
                </Card>
              </Pressable>

              {isExpanded && (
                <Card style={styles.detailCard}>
                  <Text style={styles.expandedHackathon} numberOfLines={2}>
                    {cert.hackathonTitle}
                  </Text>
                  <View style={styles.detailActions}>

                    <Button
                      title="Share"
                      variant="secondary"
                      icon={
                        <Share2
                          size={16}
                          color={colors.primary}
                          style={{
                            marginRight: spacing.xs,
                          }}
                        />
                      }
                      loading={isDownloading}
                      onPress={() => handleShare(cert)}
                      style={styles.actionButton}
                    />

                    <Button
                      title="Download"
                      icon={
                        <Download
                          size={16}
                          color="#fff"
                          style={{
                            marginRight: spacing.xs,
                          }}
                        />
                      }
                      loading={isDownloading}
                      onPress={() => handleDownload(cert)}
                      style={styles.actionButton}
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

const getStyles = (colors, typography) =>
  StyleSheet.create({
    header: {
      marginBottom: spacing.lg,
    },
    title: {
      ...typography.h1,
    },
    subtitle: {
      ...typography.bodySecondary,
      marginTop: 2,
    },
    emptyWrap: {
      alignItems: 'center',
    },
    emptyMedallion: {
      width: 64,
      height: 64,
      borderRadius: 32,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      marginTop: spacing.md,
    },
    item: {
      marginBottom: spacing.md,
    },
    tile: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      padding: spacing.md,
    },
    medallion: {
      width: 44,
      height: 44,
      borderRadius: 22,
      borderWidth: 1.5,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.md,
    },
    tileBody: {
      flex: 1,
      marginRight: spacing.sm,
    },
    hackathon: {
      ...typography.h3,
      fontSize: 15,
    },
    tileMetaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 6,
      gap: spacing.sm,
    },
    typePill: {
      paddingHorizontal: spacing.sm,
      paddingVertical: 3,
      borderRadius: radius.full,
    },
    typePillText: {
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 0.3,
    },
    tileDate: {
      ...typography.caption,
    },
    detailCard: {
      marginTop: spacing.sm,
      padding: spacing.md,
      backgroundColor: colors.bg,
    },
    expandedHackathon: {
      ...typography.h3,
      fontSize: 16,
      textAlign: 'center',
      marginBottom: spacing.md,
    },
    detailActions: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    actionButton: {
      flex: 1,
    },
  });