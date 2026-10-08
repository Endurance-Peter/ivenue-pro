import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { colors } from '../../../theme/colors';
import { PasswordAuthForm } from '../components/PasswordAuthForm';
import { BrandPanel } from '../components/BrandPanel';
import { usePasswordAuthFlow } from '../hooks/usePasswordAuthFlow';
import { SessionResponse } from '../../../lib/api';

export function AuthScreen({ onAuthenticated }: { onAuthenticated: (session: SessionResponse) => void }) {
  const { width } = useWindowDimensions();
  const isPhoneLayout = width < 768;

  const auth = usePasswordAuthFlow(onAuthenticated);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.phoneShell}>
          {isPhoneLayout ? (
            <View style={styles.mobileHeader}>
              <View style={styles.mobileLogo}><Text style={styles.mobileLogoText}>iV</Text></View>
              <Text style={styles.mobileBrandName}>iVenue</Text>
            </View>
          ) : <BrandPanel />}
          <PasswordAuthForm {...auth.state} onModeChange={auth.setMode} onChange={auth.update} onSubmit={auth.submit} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.paper },
  scrollContent: { flexGrow: 1, alignItems: 'center' },
  phoneShell: { width: '100%', maxWidth: 480, flexGrow: 1 },
  mobileHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 20, paddingTop: 24 },
  mobileLogo: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center' },
  mobileLogoText: { color: colors.paper, fontFamily: 'serif', fontSize: 14, fontWeight: '700' },
  mobileBrandName: { color: colors.ink, fontFamily: 'serif', fontSize: 20 },
});
