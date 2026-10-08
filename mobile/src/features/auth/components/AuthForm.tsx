import { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { colors } from '../../../theme/colors';
import { AuthMode, AuthStep } from '../auth.types';

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
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
}

const countries = [
  { name: 'Nigeria', flag: 'NG', code: '+234', placeholder: '801 234 5678' },
  { name: 'Ghana', flag: 'GH', code: '+233', placeholder: '24 123 4567' },
  { name: 'Kenya', flag: 'KE', code: '+254', placeholder: '712 345 678' },
  { name: 'United Kingdom', flag: 'GB', code: '+44', placeholder: '7400 123456' },
  { name: 'United States', flag: 'US', code: '+1', placeholder: '(555) 000-0000' },
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
  mode,
  onModeChange,
}: AuthFormProps) {
  const isPhoneStep = step === 'phone';

  return (
    <View style={styles.panel}>
      {error ? (
        <View accessibilityRole="alert" style={styles.notification}>
          <View style={styles.notificationMark}><Text style={styles.notificationMarkText}>!</Text></View>
          <Text style={styles.notificationText}>{error}</Text>
        </View>
      ) : null}
      <View style={styles.progressRow}>
        {[0, 1, 2].map((index) => (
          <View key={index} style={[styles.progressBar, index === (isPhoneStep ? 0 : 1) && styles.progressActive]} />
        ))}
      </View>
      <View style={styles.iconTile}><Text style={styles.phoneIcon}>⌕</Text></View>
      <Text style={styles.title}>{isPhoneStep ? 'Welcome to iVenue' : 'Check your messages'}</Text>
      {isPhoneStep ? (
        <View style={styles.modeToggle}>
          <Pressable onPress={() => onModeChange('signup')} style={[styles.modeOption, mode === 'signup' && styles.modeOptionActive]}>
            <Text style={[styles.modeText, mode === 'signup' && styles.modeTextActive]}>Create account</Text>
          </Pressable>
          <Pressable onPress={() => onModeChange('signin')} style={[styles.modeOption, mode === 'signin' && styles.modeOptionActive]}>
            <Text style={[styles.modeText, mode === 'signin' && styles.modeTextActive]}>Sign in</Text>
          </Pressable>
        </View>
      ) : null}
      <Text style={styles.subtitle}>
        {isPhoneStep
          ? mode === 'signup'
            ? 'Create your iVenue account with your mobile number. We will send you a one-time verification code.'
            : 'Welcome back. Enter your mobile number and we will send you a one-time verification code.'
          : `Enter the six-digit code sent to ${phone || 'your mobile number'}.`}
      </Text>

      {isPhoneStep ? (
        <PhoneStep
          phone={phone}
          mode={mode}
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

      <Text style={styles.legal}>By continuing, you agree to iVenue's Terms of Service and Privacy Policy.</Text>
    </View>
  );
}

function PhoneStep({ phone, mode, canContinue, hasError, onPhoneChange, onContinue }: Pick<AuthFormProps, 'phone' | 'mode' | 'canContinue' | 'onPhoneChange' | 'onContinue'> & { hasError: boolean }) {
  const [country, setCountry] = useState(countries[0]);
  const [countryMenuOpen, setCountryMenuOpen] = useState(false);

  return (
    <>
      <Text style={styles.label}>Mobile number</Text>
      <View style={[styles.phoneInput, hasError && styles.inputError]}>
        <Pressable accessibilityRole="button" onPress={() => setCountryMenuOpen((open) => !open)} style={styles.countrySelector}>
          <Text style={styles.country}>{country.flag}  {country.code}</Text>
          <View style={[styles.chevron, countryMenuOpen && styles.chevronOpen]} />
        </Pressable>
        <TextInput autoFocus keyboardType="phone-pad" onChangeText={onPhoneChange} placeholder={country.placeholder} placeholderTextColor={colors.muted} style={styles.input} value={phone} />
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
          <ActionButton disabled={!canContinue} label={mode === 'signin' ? 'Send sign-in code' : 'Continue'} onPress={onContinue} />
    </>
  );
}

function CodeStep({ code, canVerify, hasError, onCodeChange, onVerify, onUseDifferentNumber }: Pick<AuthFormProps, 'code' | 'canVerify' | 'onCodeChange' | 'onVerify' | 'onUseDifferentNumber'> & { hasError: boolean }) {
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const digits = code.padEnd(6, ' ').slice(0, 6).split('');

  return (
    <>
      <Text style={styles.label}>Verification code</Text>
      <View style={styles.codeBoxes}>
        {digits.map((digit, index) => (
          <TextInput
            key={index}
            autoFocus={index === 0}
            caretHidden
            keyboardType="number-pad"
            maxLength={1}
            onChangeText={(value) => {
              const next = value.replace(/\D/g, '').slice(-1);
              const nextCode = code.slice(0, index) + next + code.slice(index + 1);
              onCodeChange(nextCode);
              if (next && index < 5) inputRefs.current[index + 1]?.focus();
            }}
            onKeyPress={({ nativeEvent }) => {
              if (nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
                onCodeChange(code.slice(0, index - 1) + code.slice(index));
                inputRefs.current[index - 1]?.focus();
              }
            }}
            placeholder="•"
            placeholderTextColor={colors.muted}
            selectTextOnFocus
            style={[styles.codeBox, hasError && styles.inputError]}
            value={digit.trim()}
            ref={(input) => { inputRefs.current[index] = input; }}
          />
        ))}
      </View>
      <Text style={styles.codeHint}>Enter the six-digit code sent to your phone.</Text>
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
      <Text style={styles.actionText}>{label}</Text><Text style={styles.actionArrow}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  panel: { paddingHorizontal: 28, paddingTop: 36, paddingBottom: 40 },
  progressRow: { flexDirection: 'row', gap: 8, marginBottom: 42 },
  progressBar: { height: 4, flex: 1, borderRadius: 4, backgroundColor: '#e9e4dd' },
  progressActive: { backgroundColor: colors.accent },
  modeToggle: { flexDirection: 'row', backgroundColor: colors.softSurface, borderRadius: 12, padding: 4, marginTop: 22, marginBottom: 18 },
  modeOption: { flex: 1, alignItems: 'center', borderRadius: 9, paddingVertical: 10 },
  modeOptionActive: { backgroundColor: colors.surface },
  modeText: { color: '#786f66', fontSize: 13, fontWeight: '600' },
  modeTextActive: { color: colors.ink },
  iconTile: { width: 56, height: 56, borderRadius: 16, backgroundColor: colors.softSurface, alignItems: 'center', justifyContent: 'center', marginBottom: 28 },
  phoneIcon: { color: colors.accent, fontSize: 30, transform: [{ rotate: '-35deg' }] },
  title: { color: colors.ink, fontFamily: 'serif', fontSize: 35, lineHeight: 40 },
  subtitle: { color: '#786f66', fontSize: 16, lineHeight: 25, marginTop: 14, marginBottom: 35 },
  label: { color: colors.ink, fontSize: 14, fontWeight: '600', marginBottom: 10 },
  phoneInput: { minHeight: 64, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.line, borderRadius: 16, backgroundColor: colors.surface },
  countrySelector: { minHeight: 44, flexDirection: 'row', alignItems: 'center', borderRightWidth: 1, borderRightColor: colors.line, paddingHorizontal: 12 },
  country: { color: colors.ink, fontSize: 14 },
  chevron: { width: 8, height: 8, borderRightWidth: 1.5, borderBottomWidth: 1.5, borderColor: colors.muted, marginLeft: 10, transform: [{ rotate: '45deg' }, { translateY: -2 }] },
  chevronOpen: { transform: [{ rotate: '225deg' }, { translateY: 2 }] },
  input: { flex: 1, color: colors.ink, fontSize: 17, paddingHorizontal: 16 },
  countryMenu: { backgroundColor: colors.surface, borderColor: colors.line, borderRadius: 14, borderWidth: 1, marginTop: 8, overflow: 'hidden' },
  countryOption: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14 },
  countryOptionName: { color: colors.ink, fontSize: 14 },
  countryOptionCode: { color: colors.muted, fontSize: 14 },
  codeInput: { height: 64, borderWidth: 1, borderColor: colors.line, borderRadius: 16, backgroundColor: colors.surface, color: colors.ink, fontSize: 25, letterSpacing: 7, paddingHorizontal: 18 },
  codeBoxes: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  codeBox: { width: 44, height: 56, borderWidth: 1, borderColor: colors.line, borderRadius: 12, backgroundColor: colors.surface, color: colors.ink, fontSize: 23, textAlign: 'center' },
  codeHint: { color: '#827970', fontSize: 12, marginTop: 10 },
  inputError: { borderColor: colors.error },
  actionButton: { height: 62, borderRadius: 16, marginTop: 18, backgroundColor: colors.ink, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
  actionDisabled: { backgroundColor: '#a5a19b' },
  actionText: { color: colors.surface, fontSize: 17, fontWeight: '700' },
  actionArrow: { color: colors.surface, fontSize: 18 },
  backButton: { alignItems: 'center', paddingVertical: 20 },
  backText: { color: colors.accent, fontSize: 14, fontWeight: '600' },
  notification: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#e8b8ae', borderRadius: 14, backgroundColor: '#fff5f2', padding: 12, marginBottom: 22 },
  notificationMark: { width: 22, height: 22, borderRadius: 11, backgroundColor: colors.error, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  notificationMarkText: { color: colors.surface, fontSize: 14, fontWeight: '800' },
  notificationText: { flex: 1, color: '#8e3f35', fontSize: 13, lineHeight: 19 },
  legal: { color: '#827970', fontSize: 12, lineHeight: 18, marginTop: 26 },
});
