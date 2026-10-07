import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../../theme/colors';

interface AuthSuccessProps {
  onContinue: () => void;
}

export function AuthSuccess({ onContinue }: AuthSuccessProps) {
  return (
    <View style={styles.panel}>
      <View style={styles.successIcon}>
        <Text style={styles.checkmark}>✓</Text>
      </View>
      <Text style={styles.title}>You are all set</Text>
      <Text style={styles.subtitle}>
        Your number has been verified. Let&apos;s find the right space for your next event.
      </Text>
      <Pressable onPress={onContinue} style={styles.actionButton}>
        <Text style={styles.actionText}>Explore venues</Text>
        <Text style={styles.actionArrow}>-&gt;</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { paddingHorizontal: 28, paddingTop: 72, paddingBottom: 40 },
  successIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', marginBottom: 28 },
  checkmark: { color: colors.surface, fontSize: 34, fontWeight: '700' },
  title: { color: colors.ink, fontFamily: 'serif', fontSize: 35, lineHeight: 40 },
  subtitle: { color: '#786f66', fontSize: 16, lineHeight: 25, marginTop: 14, marginBottom: 35 },
  actionButton: { height: 62, borderRadius: 16, marginTop: 18, backgroundColor: colors.ink, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
  actionText: { color: colors.surface, fontSize: 17, fontWeight: '700' },
  actionArrow: { color: colors.surface, fontSize: 18 },
});