import React, { useState } from "react";
import { Text, StyleSheet } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

import ScreenContainer from "../../components/ScreenContainer";
import Card from "../../components/Card";
import Input from "../../components/Input";
import Button from "../../components/Button";

import * as organizerApi from "../../api/organizerApi";
import { useAuth } from "../../context/AuthContext";
import { colors, spacing, typography } from "../../constants/theme";

export default function CreateHackathonScreen({ navigation }) {
  const { user } = useAuth();

  const [form, setForm] = useState({
    title: "",
    description: "",
    rules: "",
    maxTeamSize: "",
    organizationId: "",
    startDate: new Date(),
    endDate: new Date(),
  });

  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const update = (key) => (value) =>
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setApiError(null);

      const payload = {
        title: form.title,
        description: form.description,
        rules: form.rules,
        maxTeamSize: Number(form.maxTeamSize),

        // Logged in organizer
        createdBy: user.userId,

        // Enter organization id or fetch it from backend
        organizationId: Number(form.organizationId),

        startDate: form.startDate.toISOString(),
        endDate: form.endDate.toISOString(),
      };

      console.log("Payload:", payload);

      await organizerApi.createHackathon(payload);

      alert("Hackathon Created Successfully");

      navigation.goBack();
    } catch (err) {
      console.log(err);

      setApiError(
        err.response?.data?.message ||
          err.message ||
          "Failed to create hackathon"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>Create Hackathon</Text>

      <Card>

        <Input
          label="Title"
          value={form.title}
          onChangeText={update("title")}
        />

        <Input
          label="Description"
          value={form.description}
          onChangeText={update("description")}
          multiline
        />

        <Input
          label="Rules"
          value={form.rules}
          onChangeText={update("rules")}
          multiline
        />

        <Input
          label="Max Team Size"
          keyboardType="numeric"
          value={form.maxTeamSize}
          onChangeText={update("maxTeamSize")}
        />

        <Input
          label="Organization Id"
          keyboardType="numeric"
          value={form.organizationId}
          onChangeText={update("organizationId")}
        />

        <Button
          title={`Start Date : ${form.startDate.toLocaleString()}`}
          onPress={() => setShowStartPicker(true)}
        />

        {showStartPicker && (
          <DateTimePicker
            value={form.startDate}
            mode="date"
            onChange={(e, date) => {
              setShowStartPicker(false);

              if (date) {
                update("startDate")(date);
              }
            }}
          />
        )}

        <Button
          title={`End Date : ${form.endDate.toLocaleString()}`}
          onPress={() => setShowEndPicker(true)}
        />

        {showEndPicker && (
          <DateTimePicker
            value={form.endDate}
            mode="date"
            onChange={(e, date) => {
              setShowEndPicker(false);

              if (date) {
                update("endDate")(date);
              }
            }}
          />
        )}

        {apiError && (
          <Text style={styles.error}>
            {apiError}
          </Text>
        )}

        <Button
          title="Publish Hackathon"
          onPress={handleSubmit}
          loading={loading}
        />

      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    ...typography.h1,
    marginBottom: spacing.lg,
  },

  error: {
    color: colors.danger,
    marginVertical: spacing.md,
  },
});