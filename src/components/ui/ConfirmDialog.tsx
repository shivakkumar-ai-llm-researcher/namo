import React from 'react';
import { Modal, View, Text } from 'react-native';
import { useTheme } from '../../theme';
import { Button } from './Button';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'primary';
  loading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'danger',
  loading = false,
}) => {
  const { colors, spacing, borderRadius, fontSize, fontWeight } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: spacing.xl }}>
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: borderRadius.lg,
            padding: spacing.xl,
            width: '100%',
            maxWidth: 360,
            gap: spacing.md,
          }}
        >
          <Text style={{ color: colors.textPrimary, fontSize: fontSize.xl, fontWeight: fontWeight.bold }}>
            {title}
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: fontSize.md, lineHeight: 22 }}>
            {message}
          </Text>
          <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm }}>
            <Button
              title={cancelLabel}
              onPress={onCancel}
              variant="secondary"
              style={{ flex: 1 }}
              disabled={loading}
            />
            <Button
              title={confirmLabel}
              onPress={onConfirm}
              variant={variant}
              style={{ flex: 1 }}
              loading={loading}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};
