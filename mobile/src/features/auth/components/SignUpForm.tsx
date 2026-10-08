import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { colors } from '../../../theme/colors';

interface SignUpFormProps {
  onBack: () => void;
  onSubmit: (fullName: string, email: string, role: AccountType) => Promise<void>;
}

type AccountType = 'customer' | 'host';

export function SignUpForm({ onBack, onSubmit }: SignUpFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [accountType, setAccountType] = useState<AccountType>('customer');
  const [submitted, setSubmitted] = useState(false);
  const canSubmit = name.trim().length > 0 && email.includes('@');

  return (
    <View style={styles.panel}>
      <Pressable onPress={onBack} style={styles.backButton}>
        <View style={styles.backIcon}><View style={styles.backStem} /><View style={styles.backHead} /></View><Text style={styles.backText}>Back</Text>
      </Pressable>
      <View style={styles.progressRow}>{[0, 1, 2].map((index) => <View key={index} style={styles.progressBar} />)}</View>
      <View style={styles.iconTile}><Text style={styles.profileIcon}>iV</Text></View>
      <Text style={styles.title}>Make it yours</Text>
      <Text style={styles.subtitle}>Tell us a little about yourself. You can switch between booking and hosting anytime.</Text>

      <Text style={styles.label}>Full name</Text>
      <TextInput autoCapitalize="words" autoFocus onChangeText={setName} placeholder="Your full name" placeholderTextColor={colors.muted} style={styles.input} value={name} />
      <Text style={[styles.label, styles.emailLabel]}>Email address</Text>
      <TextInput autoCapitalize="none" keyboardType="email-address" onChangeText={setEmail} placeholder="you@example.com" placeholderTextColor={colors.muted} style={styles.input} value={email} />
      <Text style={styles.helper}>We&apos;ll send booking receipts and important account updates here.</Text>

      <Text style={styles.choiceLabel}>I&apos;m here to</Text>
      <View style={styles.choiceRow}>
        <ChoiceCard active={accountType === 'customer'} detail="Plan an event" label="Book a venue" onPress={() => setAccountType('customer')} />
        <ChoiceCard active={accountType === 'host'} detail="Grow my business" label="List my space" onPress={() => setAccountType('host')} />
      </View>

      <Pressable disabled={!canSubmit} onPress={async () => { await onSubmit(name.trim(), email.trim(), accountType); setSubmitted(true); }} style={[styles.actionButton, !canSubmit && styles.actionDisabled]}>
        <Text style={styles.actionText}>{submitted ? 'Account ready' : 'Enter iVenue'}</Text><Text style={styles.actionArrow}>›</Text>
      </Pressable>
      {submitted ? <Text style={styles.success}>Your iVenue profile is ready.</Text> : null}
    </View>
  );
}

function ChoiceCard({ active, detail, label, onPress }: { active: boolean; detail: string; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.choiceCard, active && styles.choiceCardActive]}>
      <View style={styles.choiceHeader}><Text style={styles.choiceText}>{label}</Text><View style={[styles.radio, active && styles.radioActive]}>{active ? <View style={styles.radioDot} /> : null}</View></View>
      <Text style={styles.choiceDetail}>{detail}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  panel: { paddingHorizontal: 28, paddingTop: 24, paddingBottom: 40 },
  backButton: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 28 },
  backIcon: { width: 18, height: 14, justifyContent: 'center' }, backStem: { width: 14, height: 1.5, backgroundColor: '#786f66', marginLeft: 3 }, backHead: { position: 'absolute', width: 8, height: 8, borderLeftWidth: 1.5, borderBottomWidth: 1.5, borderColor: '#786f66', transform: [{ rotate: '45deg' }], left: 1 }, backText: { color: '#786f66', fontSize: 14 },
  progressRow: { flexDirection: 'row', gap: 8, marginBottom: 36 }, progressBar: { height: 4, flex: 1, borderRadius: 4, backgroundColor: colors.accent },
  iconTile: { width: 56, height: 56, borderRadius: 16, backgroundColor: colors.softSurface, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  profileIcon: { color: colors.accent, fontFamily: 'serif', fontSize: 20, fontWeight: '700' },
  title: { color: colors.ink, fontFamily: 'serif', fontSize: 35, lineHeight: 40 }, subtitle: { color: '#786f66', fontSize: 16, lineHeight: 25, marginTop: 14, marginBottom: 28 },
  label: { color: colors.ink, fontSize: 14, fontWeight: '600', marginBottom: 10 }, emailLabel: { marginTop: 18 },
  input: { height: 56, borderWidth: 1, borderColor: colors.line, borderRadius: 14, backgroundColor: colors.surface, color: colors.ink, fontSize: 16, paddingHorizontal: 16 },
  helper: { color: '#827970', fontSize: 12, lineHeight: 18, marginTop: 8 }, choiceLabel: { color: colors.ink, fontSize: 14, fontWeight: '600', marginTop: 22, marginBottom: 10 }, choiceRow: { flexDirection: 'row', gap: 10 },
  choiceCard: { flex: 1, borderWidth: 1, borderColor: colors.line, borderRadius: 14, padding: 14 }, choiceCardActive: { borderColor: colors.accent, backgroundColor: '#fffaf5' }, choiceHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6 }, choiceText: { color: colors.ink, flex: 1, fontSize: 13, fontWeight: '600' }, choiceDetail: { color: '#827970', fontSize: 12, marginTop: 7 },
  radio: { width: 17, height: 17, borderRadius: 9, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' }, radioActive: { borderColor: colors.accent, backgroundColor: colors.accent }, radioDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.surface },
  actionButton: { height: 62, borderRadius: 16, marginTop: 24, backgroundColor: colors.ink, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 }, actionDisabled: { backgroundColor: '#a5a19b' }, actionText: { color: colors.surface, fontSize: 17, fontWeight: '700' }, actionArrow: { color: colors.surface, fontSize: 18 }, success: { color: '#3d7c52', fontSize: 13, marginTop: 12 },
});
