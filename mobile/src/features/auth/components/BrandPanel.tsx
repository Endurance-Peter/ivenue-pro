import { Platform, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../../theme/colors';

const stats = [
  { value: '2,400+', label: 'curated venues' },
  { value: 'Secure', label: 'escrow payments' },
  { value: '24/7', label: 'event support' },
];

export function BrandPanel() {
  return (
    <View style={styles.panel}>
      <View style={styles.logoRow}>
        <View style={styles.logoMark}><Text style={styles.logoText}>iV</Text></View>
        <Text style={styles.brandName}>iVenue</Text>
      </View>
      <View style={styles.copy}>
        <Text style={styles.eyebrow}>YOUR EVENT STARTS HERE</Text>
        <Text style={styles.headline}>Remarkable spaces,</Text>
        <Text style={[styles.headline, styles.accentText]}>made simple.</Text>
        <Text style={styles.description}>
          Discover unique venues, book with confidence, and manage every detail from one place.
        </Text>
      </View>
      <View style={styles.stats}>
        {stats.map((stat) => (
          <View key={stat.label}>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { backgroundColor: colors.ink, minHeight: 390, paddingHorizontal: 28, paddingTop: 54, paddingBottom: 34, justifyContent: 'space-between' },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logoMark: { width: 43, height: 43, borderRadius: 12, backgroundColor: colors.paper, alignItems: 'center', justifyContent: 'center' },
  logoText: { color: colors.ink, fontFamily: Platform.select({ ios: 'Georgia', android: 'serif' }), fontSize: 19, fontWeight: '700' },
  brandName: { color: colors.paper, fontFamily: Platform.select({ ios: 'Georgia', android: 'serif' }), fontSize: 25, fontWeight: '700' },
  copy: { marginTop: 54 },
  eyebrow: { color: '#a39b92', fontSize: 11, letterSpacing: 2.4, marginBottom: 20 },
  headline: { color: colors.paper, fontFamily: Platform.select({ ios: 'Georgia', android: 'serif' }), fontSize: 39, lineHeight: 43 },
  accentText: { color: colors.accent },
  description: { color: '#aaa39b', fontSize: 16, lineHeight: 24, marginTop: 22, maxWidth: 350 },
  stats: { borderTopWidth: 1, borderTopColor: '#3a342e', paddingTop: 21, flexDirection: 'row', justifyContent: 'space-between', marginTop: 38 },
  statValue: { color: colors.paper, fontFamily: Platform.select({ ios: 'Georgia', android: 'serif' }), fontSize: 17 },
  statLabel: { color: '#898078', fontSize: 11, marginTop: 5 },
});
