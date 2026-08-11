import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { ChevronDown, Check } from 'lucide-react-native';
import { colors, radius, spacing, typography } from '../constants/theme';

// Styled to match Input/DateField. Tapping expands an inline list of
// options instead of opening a native picker or modal — consistent with
// the successor-picker pattern already used in MyTeamScreen.
export default function SelectField({ label, value, options, onSelect, placeholder = 'Select', error, style }) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <View style={[styles.wrapper, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <Pressable
        onPress={() => setOpen((v) => !v)}
        style={[styles.field, !!error && styles.fieldError]}
      >
        <Text style={selected ? styles.value : styles.placeholder} numberOfLines={1}>
          {selected ? selected.label : placeholder}
        </Text>
        <ChevronDown size={16} color={colors.textSecondary} style={{ transform: [{ rotate: open ? '180deg' : '0deg' }] }} />
      </Pressable>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {open && (
        <View style={styles.optionsBox}>
          {options.length === 0 ? (
            <Text style={styles.emptyText}>No options available</Text>
          ) : (
            options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <Pressable
                  key={opt.value}
                  style={[styles.optionRow, isSelected && styles.optionRowSelected]}
                  onPress={() => {
                    onSelect(opt.value);
                    setOpen(false);
                  }}
                >
                  <Text style={styles.optionText}>{opt.label}</Text>
                  {isSelected ? <Check size={16} color={colors.primary} /> : null}
                </Pressable>
              );
            })
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: spacing.md },
  label: { ...typography.bodySecondary, marginBottom: spacing.xs, fontWeight: '500' },
  field: {
    height: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fieldError: { borderColor: colors.danger },
  value: { ...typography.body, fontSize: 14, flex: 1 },
  placeholder: { ...typography.body, fontSize: 14, color: colors.textMuted, flex: 1 },
  errorText: { color: colors.danger, fontSize: 12, marginTop: spacing.xs },
  optionsBox: {
    marginTop: spacing.xs,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  optionRowSelected: { backgroundColor: colors.primaryMuted },
  optionText: { ...typography.body, fontSize: 14 },
  emptyText: { ...typography.caption, padding: spacing.md },
});