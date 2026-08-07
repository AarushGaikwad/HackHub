import React, { useCallback, useEffect, useState } from "react";
import { Text, View, StyleSheet } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import ScreenContainer from "../../components/ScreenContainer";
import Card from "../../components/Card";
import Badge from "../../components/Badge";
import Input from "../../components/Input";
import Button from "../../components/Button";
import DateField from "../../components/DateField";
import SelectField from "../../components/SelectField";
import * as organizerApi from "../../api/organizerApi";
import { getStatusLabel } from "../../constants/statusLabels";
import { useAuth } from "../../context/AuthContext";
import { colors, spacing, typography } from "../../constants/theme";

export default function CreateHackathonScreen({ navigation }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    title: "",
    description: "",
    rules: "",
    maxTeamSize: "",
    organizationId: null,
    startDate: new Date(),
    endDate: new Date(),
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const [organizations, setOrganizations] = useState([]);
  const [orgsLoading, setOrgsLoading] = useState(true);
  const [orgsError, setOrgsError] = useState(null);

  const loadOrganizations = useCallback(async () => {
    setOrgsError(null);
    try {
      const data = await organizerApi.getOrganizations();
      setOrganizations(data || []);
    } catch (err) {
      setOrgsError(err.message || 'Failed to load organizations');
    }
  }, []);

  useEffect(() => {
    setOrgsLoading(true);
    loadOrganizations().finally(() => setOrgsLoading(false));
  }, [loadOrganizations]);

  const update = (key) => (value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const validate = () => {
    const next = {};
    if (!form.title.trim()) next.title = "Required";
    // description is @NotBlank on HackathonRequestDto — was optional here
    // before, which would have failed backend validation on submit.
    if (!form.description.trim()) next.description = "Required";
    if (!form.startDate) next.startDate = "Required";
    if (!form.endDate) next.endDate = "Required";
    if (form.startDate && form.endDate && form.endDate <= form.startDate) {
      next.endDate = "End date must be after the start date";
    }

    const teamSizeNum = Number(form.maxTeamSize);
    if (!form.maxTeamSize || Number.isNaN(teamSizeNum) || teamSizeNum < 1) {
      next.maxTeamSize = "Enter a valid team size";
    }

    if (!form.organizationId) {
      next.organizationId = "Select an organization";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    setApiError(null);
    if (!validate()) return;
    setLoading(true);
    try {
      // Matches HackathonRequestDto exactly (confirmed against the backend
      // class). createdBy is the organizer's own userId — sourced from
      // AuthContext, never a field the organizer fills in themselves.
      const payload = {
        ...form,
        maxTeamSize: Number(form.maxTeamSize),
        organizationId: form.organizationId,
        createdBy: user.userId,
        startDate: form.startDate.toISOString(),
        endDate: form.endDate.toISOString(),
      };

      await organizerApi.createHackathon(payload);
      navigation.goBack();
    } catch (err) {
      setApiError(err.message || "Failed to create hackathon");
    } finally {
      setLoading(false);
    }
  };

  const formatRange = (start, end) =>
    `${start.toLocaleDateString(undefined, { month: "short", day: "numeric" })} → ${end.toLocaleDateString(
      undefined,
      { month: "short", day: "numeric", year: "numeric" }
    )}`;

  const selectedOrgName = organizations.find((o) => o.id === form.organizationId)?.name;

  return (
    <ScreenContainer>
      <Text style={styles.title}>Create Hackathon</Text>

      <Text style={styles.sectionLabel}>BASIC INFO</Text>
      <Card style={{ marginBottom: spacing.lg }}>
        <Input
          label="Title"
          placeholder="AI for good hackathon"
          value={form.title}
          onChangeText={update("title")}
          error={errors.title}
        />
        <Input
          label="Description"
          multiline
          numberOfLines={4}
          placeholder="What are participants building?"
          style={{ height: 100, textAlignVertical: "top", paddingTop: spacing.sm }}
          value={form.description}
          onChangeText={update("description")}
        />
        <Input
          label="Rules"
          multiline
          numberOfLines={4}
          placeholder="Team size, judging criteria, eligibility..."
          style={{ height: 100, textAlignVertical: "top", paddingTop: spacing.sm }}
          value={form.rules}
          onChangeText={update("rules")}
        />
        <Input
          label="Max Team Size"
          keyboardType="number-pad"
          placeholder="4"
          value={form.maxTeamSize}
          onChangeText={update("maxTeamSize")}
          error={errors.maxTeamSize}
        />
        <SelectField
          label="Organization"
          value={form.organizationId}
          options={organizations.map((org) => ({ value: org.id, label: org.name }))}
          onSelect={update("organizationId")}
          placeholder={orgsLoading ? "Loading organizations..." : "Select organization"}
          error={errors.organizationId || orgsError}
        />
      </Card>

      <Text style={styles.sectionLabel}>SCHEDULE</Text>
      <View style={styles.dateRow}>
        <DateField
          label="Starts"
          value={form.startDate}
          onPress={() => setShowStartPicker(true)}
          error={errors.startDate}
        />
        <DateField
          label="Ends"
          value={form.endDate}
          onPress={() => setShowEndPicker(true)}
          error={errors.endDate}
        />
      </View>

      {showStartPicker && (
        <DateTimePicker
          value={form.startDate}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowStartPicker(false);
            if (selectedDate) update("startDate")(selectedDate);
          }}
        />
      )}
      {showEndPicker && (
        <DateTimePicker
          value={form.endDate}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowEndPicker(false);
            if (selectedDate) update("endDate")(selectedDate);
          }}
        />
      )}

      <Text style={[styles.sectionLabel, { marginTop: spacing.lg }]}>PREVIEW</Text>
      <Card style={styles.previewCard}>
        <View style={styles.previewHeader}>
          <Text style={styles.previewTitle} numberOfLines={1}>
            {form.title.trim() || "Your hackathon title"}
          </Text>
          <Badge label="DRAFT" displayLabel={getStatusLabel("DRAFT")} />
        </View>
        <Text style={styles.previewDates}>{formatRange(form.startDate, form.endDate)}</Text>
        {selectedOrgName ? <Text style={styles.previewHint}>Hosted by {selectedOrgName}</Text> : null}
        {form.maxTeamSize ? (
          <Text style={styles.previewHint}>Teams of up to {form.maxTeamSize} members</Text>
        ) : null}
        <Text style={styles.previewHint}>This is how it will appear to participants.</Text>
      </Card>

      {apiError ? <Text style={styles.apiError}>{apiError}</Text> : null}

      <Button
        title="Publish Hackathon"
        onPress={handleSubmit}
        loading={loading}
        style={{ marginTop: spacing.lg }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.h1, marginBottom: spacing.lg },
  sectionLabel: { ...typography.caption, marginBottom: spacing.sm },
  dateRow: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.lg },
  previewCard: { borderStyle: "dashed", borderColor: colors.border },
  previewHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  previewTitle: { ...typography.h3, flex: 1, marginRight: spacing.sm },
  previewDates: { ...typography.caption, marginTop: spacing.xs },
  previewHint: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.sm },
  apiError: { color: colors.danger, fontSize: 13, marginTop: spacing.md },
});