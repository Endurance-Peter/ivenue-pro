import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { colors } from '../../../theme/colors';
import { AuthMode } from '../auth.types';

type Props = {
  mode: AuthMode;
  fullName: string;
  email: string;
  password: string;
  role: 'customer' | 'host';
  error: string;
  onModeChange: (mode: AuthMode) => void;
  onChange: (field: 'fullName' | 'email' | 'password' | 'role', value: string) => void;
  onSubmit: () => void;
};

export function PasswordAuthForm({ mode, fullName, email, password, role, error, onModeChange, onChange, onSubmit }: Props) {
  const signup = mode === 'signup';
  const valid = email.includes('@') && password.length >= 8 && (!signup || fullName.trim().length >= 2);

  return (
    <View style={styles.panel}>
      {error ? <View accessibilityRole="alert" style={styles.notification}><Text style={styles.mark}>!</Text><Text style={styles.notificationText}>{error}</Text></View> : null}
      <View style={styles.progressRow}><View style={[styles.progress, styles.active]} /><View style={[styles.progress, signup && styles.active]} /><View style={styles.progress} /></View>
      <View style={styles.icon}><Text style={styles.iconText}>iV</Text></View>
      <Text style={styles.title}>{signup ? 'Create your account' : 'Welcome back'}</Text>
      <Text style={styles.subtitle}>{signup ? 'Create your iVenue account with your name, email, and password.' : 'Sign in to continue to iVenue.'}</Text>
      <View style={styles.toggle}><Pressable onPress={() => onModeChange('signup')} style={[styles.toggleItem, signup && styles.selected]}><Text style={styles.toggleText}>Create account</Text></Pressable><Pressable onPress={() => onModeChange('signin')} style={[styles.toggleItem, !signup && styles.selected]}><Text style={styles.toggleText}>Sign in</Text></Pressable></View>
      {signup ? <Field label="Full name" value={fullName} placeholder="Your full name" onChangeText={(value) => onChange('fullName', value)} /> : null}
      <Field label="Email address" value={email} placeholder="you@example.com" keyboardType="email-address" onChangeText={(value) => onChange('email', value)} />
      <Field label="Password" value={password} placeholder="At least 8 characters" secureTextEntry onChangeText={(value) => onChange('password', value)} />
      {signup ? <View style={styles.roleRow}><Pressable onPress={() => onChange('role', 'customer')} style={[styles.role, role === 'customer' && styles.roleSelected]}><Text>Book a venue</Text></Pressable><Pressable onPress={() => onChange('role', 'host')} style={[styles.role, role === 'host' && styles.roleSelected]}><Text>List my space</Text></Pressable></View> : null}
      <Pressable disabled={!valid} onPress={onSubmit} style={[styles.button, !valid && styles.disabled]}><Text style={styles.buttonText}>{signup ? 'Create account' : 'Sign in'}  ›</Text></Pressable>
      <Text style={styles.legal}>By continuing, you agree to iVenue&apos;s Terms of Service and Privacy Policy.</Text>
    </View>
  );
}

function Field({ label, value, placeholder, onChangeText, keyboardType = 'default', secureTextEntry = false }: { label: string; value: string; placeholder: string; onChangeText: (value: string) => void; keyboardType?: 'default' | 'email-address'; secureTextEntry?: boolean }) {
  return <View style={styles.field}><Text style={styles.label}>{label}</Text><TextInput autoCapitalize={keyboardType === 'email-address' ? 'none' : 'words'} keyboardType={keyboardType} placeholder={placeholder} placeholderTextColor={colors.muted} secureTextEntry={secureTextEntry} style={styles.input} value={value} onChangeText={onChangeText} /></View>;
}

const styles = StyleSheet.create({
  panel: { padding: 28, paddingTop: 36 }, notification: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff5f2', borderColor: '#e8b8ae', borderWidth: 1, borderRadius: 14, padding: 12, marginBottom: 22 }, mark: { backgroundColor: colors.error, color: colors.surface, borderRadius: 12, paddingHorizontal: 7, paddingVertical: 2, marginRight: 10 }, notificationText: { flex: 1, color: '#8e3f35', fontSize: 13 }, progressRow: { flexDirection: 'row', gap: 8, marginBottom: 38 }, progress: { height: 4, flex: 1, backgroundColor: '#e9e4dd', borderRadius: 4 }, active: { backgroundColor: colors.accent }, icon: { width: 56, height: 56, borderRadius: 16, backgroundColor: colors.softSurface, alignItems: 'center', justifyContent: 'center', marginBottom: 24 }, iconText: { color: colors.accent, fontFamily: 'serif', fontWeight: '700', fontSize: 20 }, title: { color: colors.ink, fontFamily: 'serif', fontSize: 35 }, subtitle: { color: '#786f66', fontSize: 16, lineHeight: 24, marginTop: 12, marginBottom: 22 }, toggle: { flexDirection: 'row', backgroundColor: colors.softSurface, padding: 4, borderRadius: 12, marginBottom: 22 }, toggleItem: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 9 }, selected: { backgroundColor: colors.surface }, toggleText: { color: colors.ink, fontSize: 13, fontWeight: '600' }, field: { marginBottom: 16 }, label: { color: colors.ink, fontSize: 14, fontWeight: '600', marginBottom: 8 }, input: { height: 56, borderWidth: 1, borderColor: colors.line, borderRadius: 14, backgroundColor: colors.surface, paddingHorizontal: 16, color: colors.ink, fontSize: 16 }, roleRow: { flexDirection: 'row', gap: 10, marginBottom: 4 }, role: { flex: 1, borderWidth: 1, borderColor: colors.line, borderRadius: 12, padding: 14, alignItems: 'center' }, roleSelected: { borderColor: colors.accent, backgroundColor: '#fffaf5' }, button: { height: 60, borderRadius: 15, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center', marginTop: 18 }, disabled: { backgroundColor: '#a5a19b' }, buttonText: { color: colors.surface, fontSize: 17, fontWeight: '700' }, legal: { color: '#827970', fontSize: 12, lineHeight: 18, marginTop: 22 },
});
