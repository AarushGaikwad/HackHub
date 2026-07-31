import React, { useState } from "react";
import { Text, StyleSheet } from "react-native";
import ScreenContainer from "../../components/ScreenContainer";
import Card from "../../components/Card";
import Input from "../../components/Input";
import Button from "../../components/Button";
import * as organizerApi from "../../api/organizerApi";
import { colors, spacing, typography } from "../../constants/theme";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function CreateHackathonScreen({ navigation }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    rules: "",
    startDate: new Date(),
    endDate: new Date(),
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const update = (key) => (value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const validate = () => {
    const next = {};
    if (!form.title.trim()) next.title = "Required";
    if (!form.startDate) next.startDate = "Required";
    if (!form.endDate) next.endDate = "Required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    setApiError(null);
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = {
        ...form,
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

  return (
    <ScreenContainer>
      <Text style={styles.title}>Create Hackathon</Text>

      <Card style={{ marginTop: spacing.lg }}>
        <Input
          label="Title"
          value={form.title}
          onChangeText={update("title")}
          error={errors.title}
        />
        <Input
          label="Description"
          multiline
          numberOfLines={4}
          style={{
            height: 100,
            textAlignVertical: "top",
            paddingTop: spacing.sm,
          }}
          value={form.description}
          onChangeText={update("description")}
        />
        <Input
          label="Rules"
          multiline
          numberOfLines={4}
          style={{
            height: 100,
            textAlignVertical: "top",
            paddingTop: spacing.sm,
          }}
          value={form.rules}
          onChangeText={update("rules")}
        />
        <Button
          title={`Start: ${form.startDate.toLocaleString()}`}
          onPress={() => setShowStartPicker(true)}
        />

        {showStartPicker && (
          <DateTimePicker
            value={form.startDate}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowStartPicker(false);

              if (selectedDate) {
                setForm((prev) => ({
                  ...prev,
                  startDate: selectedDate,
                }));
              }
            }}
          />
        )}

        <Button
          title={`End: ${form.endDate.toLocaleString()}`}
          onPress={() => setShowEndPicker(true)}
        />

        {showEndPicker && (
          <DateTimePicker
            value={form.endDate}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowEndPicker(false);

              if (selectedDate) {
                setForm((prev) => ({
                  ...prev,
                  endDate: selectedDate,
                }));
              }
            }}
          />
        )}
        {apiError ? <Text style={styles.apiError}>{apiError}</Text> : null}

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
  title: { ...typography.h1 },
  apiError: { color: colors.danger, fontSize: 13, marginBottom: spacing.sm },
});
