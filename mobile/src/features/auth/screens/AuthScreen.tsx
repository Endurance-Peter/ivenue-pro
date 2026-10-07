import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { colors } from '../../../theme/colors';
import { AuthForm } from '../components/AuthForm';
import { AuthSuccess } from '../components/AuthSuccess';
import { BrandPanel } from '../components/BrandPanel';
import { SignUpForm } from '../components/SignUpForm';
import { useAuthFlow } from '../hooks/useAuthFlow';

export function AuthScreen() {
  const auth = useAuthFlow();
  const { width } = useWindowDimensions();
  const isPhoneLayout = width < 768;

  if (auth.state.step === 'success') {
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
            {auth.state.mode === 'signin' ? <AuthSuccess onContinue={() => undefined} /> : <SignUpForm onBack={auth.backToVerification} />}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

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
          <AuthForm
            step={auth.state.step}
            phone={auth.state.phone}
            code={auth.state.code}
            error={auth.state.error}
            canContinue={auth.canContinue}
            canVerify={auth.canVerify}
            onPhoneChange={auth.updatePhone}
            onCodeChange={auth.updateCode}
            onContinue={auth.continueToCode}
            onVerify={auth.verifyCode}
            onUseDifferentNumber={auth.useDifferentNumber}
            mode={auth.state.mode}
            onModeChange={auth.setMode}
          />
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
