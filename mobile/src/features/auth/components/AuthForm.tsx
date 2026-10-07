import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { colors } from '../../../theme/colors';
import { AuthStep } from '../auth.types';

interface AuthFormProps {
  step: AuthStep;
  phone: string;
  code: string;
  error: string;
  canContinue: boolean;
  canVerify: boolean;
  onPhoneChange: (phone: string) => void;
  onCodeChange: (code: string) => void;
  onContinue: () => void;
  onVerify: () => void;
  onUseDifferentNumber: () => void;
}

const countries = [
  { name: 'Nigeria', flag: 'NG', code: '+234' },
  { name: 'Ghana', flag: 'GH', code: '+233' },
  { name: 'Kenya', flag: 'KE', code: '+254' },
  { name: 'United Kingdom', flag: 'GB', code: '+44' },
  { name: 'United States', flag: 'US', code: '+1' },
];

export function AuthForm({
  step,
  phone,
  code,
  error,
  canContinue,
  canVerify,
  onPhoneChange,
  onCodeChange,
  onContinue,
  onVerify,
  onUseDifferentNumber,
}: AuthFormProps) {
  const isPhoneStep = step === 'phone';

  return (
    <View style={styles.panel}>
      <View style={styles.progressRow}>
        {[0, 1, 2].map((index) => (
          <View key={index} style={[styles.progressBar, index === (isPhoneStep ? 0 : 1) && styles.progressActive]} />
        ))}
      </View>
      <View style={styles.iconTile}><Text style={styles.phoneIcon}>⌕</Text></View>
      <Text style={styles.title}>{isPhoneStep ? 'Welcome to iVenue' : 'Check your messages'}</Text>
      <Text style={styles.subtitle}>
        {isPhoneStep
          ? 'Sign in or create an account with your mobile number.\nWe will send you a one-time verification code.'
          : `Enter the six-digit code sent to ${phone || 'your mobile number'}.`}
      </Text>

      {isPhoneStep ? (
        <PhoneStep
          phone={phone}
          canContinue={canContinue}
          hasError={Boolean(error)}
          onPhoneChange={onPhoneChange}
          onContinue={onContinue}
        />
      ) : (
        <CodeStep
          code={code}
          canVerify={canVerify}
          hasError={Boolean(error)}
          onCodeChange={onCodeChange}
          onVerify={onVerify}
          onUseDifferentNumber={onUseDifferentNumber}
        />
      )}

      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Text style={styles.legal}>By continuing, you agree to iVenue's Terms of Service and Privacy Policy.</Text>
    </View>
  );
}

function PhoneStep({ phone, canContinue, hasError, onPhoneChange, onContinue }: Pick<AuthFormProps, 'phone' | 'canContinue' | 'onPhoneChange' | 'onContinue'> & { hasError: boolean }) {
  const [country, setCountry] = useState(countries[0]);
  const [countryMenuOpen, setCountryMenuOpen] = useState(false);

  return (
    <>
      <Text style={styles.label}>Mobile number</Text>
      <View style={[styles.phoneInput, hasError && styles.inputError]}>
        <Pressable accessibilityRole="button" onPress={() => setCountryMenuOpen((open) => !open)} style={styles.countrySelector}>
          <Text style={styles.country}>{country.flag}  {country.code}</Text>
          <Text style={styles.countryChevron}>{countryMenuOpen ? '^' : 'v'}</Text>
        </Pressable>
        <TextInput autoFocus keyboardType="phone-pad" onChangeText={onPhoneChange} placeholder="(555) 000-0000" placeholderTextColor={colors.muted} style={styles.input} value={phone} />
      </View>
      {countryMenuOpen ? (
        <View style={styles.countryMenu}>
          {countries.map((option) => (
            <Pressable key={option.code} onPress={() => { setCountry(option); setCountryMenuOpen(false); }} style={styles.countryOption}>
              <Text style={styles.countryOptionName}>{option.flag}  {option.name}</Text>
              <Text style={styles.countryOptionCode}>{option.code}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
      <ActionButton disabled={!canContinue} label="Continue" onPress={onContinue} />
    </>
  );
}

function CodeStep({ code, canVerify, hasError, onCodeChange, onVerify, onUseDifferentNumber }: Pick<AuthFormProps, 'code' | 'canVerify' | 'onCodeChange' | 'onVerify' | 'onUseDifferentNumber'> & { hasError: boolean }) {
  return (
    <>
      <Text style={styles.label}>Verification code</Text>
      <TextInput autoFocus keyboardType="number-pad" maxLength={6} onChangeText={onCodeChange} placeholder="000000" placeholderTextColor={colors.muted} style={[styles.codeInput, hasError && styles.inputError]} value={code} />
      <ActionButton disabled={!canVerify} label="Verify number" onPress={onVerify} />
      <Pressable onPress={onUseDifferentNumber} style={styles.backButton}>
        <Text style={styles.backText}>Use a different number</Text>
      </Pressable>
    </>
  );
}

function ActionButton({ disabled, label, onPress }: { disabled: boolean; label: string; onPress: () => void }) {
  return (
    <Pressable disabled={disabled} onPress={onPress} style={[styles.actionButton, disabled && styles.actionDisabled]}>
      <Text style={styles.actionText}>{label}</Text><Text style={styles.actionArrow}>-&gt;</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  panel: { paddingHorizontal: 28, paddingTop: 36, paddingBottom: 40 },
  progressRow: { flexDirection: 'row', gap: 8, marginBottom: 42 },
  progressBar: { height: 4, flex: 1, borderRadius: 4, backgroundColor: '#e9e4dd' },
  progressActive: { backgroundColor: colors.accent },
  iconTile: { width: 56, height: 56, borderRadius: 16, backgroundColor: colors.softSurface, alignItems: 'center', justifyContent: 'center', marginBottom: 28 },
  phoneIcon: { color: colors.accent, fontSize: 30, transform: [{ rotate: '-35deg' }] },
  title: { color: colors.ink, fontFamily: 'serif', fontSize: 35, lineHeight: 40 },
  subtitle: { color: '#786f66', fontSize: 16, lineHeight: 25, marginTop: 14, marginBottom: 35 },
  label: { color: colors.ink, fontSize: 14, fontWeight: '600', marginBottom: 10 },
  phoneInput: { minHeight: 64, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.line, borderRadius: 16, backgroundColor: colors.surface },
  countrySelector: { minHeight: 44, flexDirection: 'row', alignItems: 'center', borderRightWidth: 1, borderRightColor: colors.line, paddingHorizontal: 12 },
  country: { color: colors.ink, fontSize: 14 },
  countryChevron: { color: colors.muted, fontSize: 12, marginLeft: 8 },
  input: { flex: 1, color: colors.ink, fontSize: 17, paddingHorizontal: 16 },
  countryMenu: { backgroundColor: colors.surface, borderColor: colors.line, borderRadius: 14, borderWidth: 1, marginTop: 8, overflow: 'hidden' },
  countryOption: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14 },
  countryOptionName: { color: colors.ink, fontSize: 14 },
  countryOptionCode: { color: colors.muted, fontSize: 14 },
  codeInput: { height: 64, borderWidth: 1, borderColor: colors.line, borderRadius: 16, backgroundColor: colors.surface, color: colors.ink, fontSize: 25, letterSpacing: 7, paddingHorizontal: 18 },
  inputError: { borderColor: colors.error },
  actionButton: { height: 62, borderRadius: 16, marginTop: 18, backgroundColor: colors.ink, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
  actionDisabled: { backgroundColor: '#a5a19b' },
  actionText: { color: colors.surface, fontSize: 17, fontWeight: '700' },
  actionArrow: { color: colors.surface, fontSize: 18 },
  backButton: { alignItems: 'center', paddingVertical: 20 },
  backText: { color: colors.accent, fontSize: 14, fontWeight: '600' },
  error: { color: colors.error, fontSize: 13, marginTop: 12 },
  legal: { color: '#827970', fontSize: 12, lineHeight: 18, marginTop: 26 },
});
