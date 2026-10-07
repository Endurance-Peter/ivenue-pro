import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../../theme/colors';

const venueTypes = [
  { icon: '🏢', name: 'Rooftops', count: '48 spaces' },
  { icon: '✨', name: 'Ballrooms', count: '32 spaces' },
  { icon: '🌿', name: 'Garden', count: '27 spaces' },
  { icon: '🏭', name: 'Industrial', count: '41 spaces' },
  { icon: '⚓', name: 'Waterfront', count: '19 spaces' },
  { icon: '🎨', name: 'Studio', count: '55 spaces' },
];

export function BrowseScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <View style={styles.logoMark}><Text style={styles.logoText}>iV</Text></View>
          <Text style={styles.brandName}>iVenue</Text>
        </View>
        <Text style={styles.headerTitle}>Browse Venues</Text>
        <Pressable style={styles.profileButton}><Text style={styles.profileText}>Guest  v</Text></Pressable>
      </View>

      <View style={styles.hero}>
        <View style={styles.availabilityPill}><Text style={styles.pillIcon}>ϟ</Text><Text style={styles.pillText}>Real-time availability · Instant confirmation</Text></View>
        <Text style={styles.heroTitle}>Find your perfect</Text>
        <Text style={[styles.heroTitle, styles.accentText]}>event space.</Text>
        <Text style={styles.heroSubtitle}>Discover and book extraordinary venues - rooftops, ballrooms, lofts, and gardens. Seamless booking, secure payments, and QR check-in included.</Text>
        <View style={styles.searchBar}>
          <SearchField label="Location" value="Lagos" />
          <SearchField label="Date" value="mm/dd/yyyy" />
          <SearchField label="Guests" value="How many?" />
          <Pressable style={styles.searchButton}><Text style={styles.searchIcon}>⌕</Text></Pressable>
        </View>
      </View>

      <View style={styles.statsRow}>
        <Stat value="2,400+" label="Unique Venues" />
        <Stat value="48K+" label="Events Hosted" />
        <Stat value="186" label="Cities Covered" />
        <Stat value="4.9★" label="Average Rating" />
      </View>

      <View style={styles.typesSection}>
        <Text style={styles.sectionTitle}>Browse by type</Text>
        <Text style={styles.sectionSubtitle}>Every occasion has its perfect space.</Text>
        <View style={styles.typeGrid}>
          {venueTypes.map((type) => (
            <Pressable key={type.name} style={styles.typeCard}>
              <Text style={styles.typeIcon}>{type.icon}</Text>
              <Text style={styles.typeName}>{type.name}</Text>
              <Text style={styles.typeCount}>{type.count}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}

function SearchField({ label, value }: { label: string; value: string }) {
  return <View style={styles.searchField}><Text style={styles.searchLabel}>{label}</Text><Text style={styles.searchValue}>{value}</Text></View>;
}

function Stat({ value, label }: { value: string; label: string }) {
  return <View style={styles.stat}><Text style={styles.statValue}>{value}</Text><Text style={styles.statLabel}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.paper },
  header: { minHeight: 74, borderBottomWidth: 1, borderBottomColor: '#ded9d2', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 22 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoMark: { width: 38, height: 38, borderRadius: 10, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center' },
  logoText: { color: colors.paper, fontFamily: 'serif', fontSize: 16, fontWeight: '700' },
  brandName: { color: colors.ink, fontFamily: 'serif', fontSize: 23, fontWeight: '700' },
  headerTitle: { color: '#786f66', fontSize: 17 },
  profileButton: { borderWidth: 1, borderColor: '#d1cbc2', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10 },
  profileText: { color: '#786f66', fontSize: 14 },
  hero: { paddingHorizontal: 22, paddingTop: 34, paddingBottom: 38 },
  availabilityPill: { alignSelf: 'flex-start', borderWidth: 1, borderColor: '#ded9d2', borderRadius: 22, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 9, marginBottom: 50 },
  pillIcon: { color: colors.accent, fontSize: 20, marginRight: 8 },
  pillText: { color: '#786f66', fontSize: 12 },
  heroTitle: { color: colors.ink, fontFamily: 'serif', fontSize: 44, lineHeight: 46 },
  accentText: { color: colors.accent },
  heroSubtitle: { color: '#786f66', fontSize: 15, lineHeight: 23, maxWidth: 390, marginTop: 22 },
  searchBar: { flexDirection: 'row', borderWidth: 1, borderColor: '#ded9d2', borderRadius: 14, backgroundColor: colors.surface, marginTop: 30, overflow: 'hidden' },
  searchField: { flex: 1, minWidth: 0, paddingHorizontal: 12, paddingVertical: 12, borderRightWidth: 1, borderRightColor: '#ded9d2' },
  searchLabel: { color: '#786f66', fontSize: 11, marginBottom: 6 },
  searchValue: { color: '#a8a198', fontSize: 13 },
  searchButton: { width: 52, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center' },
  searchIcon: { color: colors.paper, fontSize: 25 },
  statsRow: { backgroundColor: colors.surface, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#e5e0d9', flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 26 },
  stat: { alignItems: 'center' },
  statValue: { color: colors.ink, fontFamily: 'serif', fontSize: 24 },
  statLabel: { color: '#786f66', fontSize: 11, marginTop: 5 },
  typesSection: { paddingHorizontal: 22, paddingTop: 34, paddingBottom: 40 },
  sectionTitle: { color: colors.ink, fontFamily: 'serif', fontSize: 30 },
  sectionSubtitle: { color: '#786f66', fontSize: 15, marginTop: 6, marginBottom: 22 },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  typeCard: { width: '31.8%', minHeight: 118, borderWidth: 1, borderColor: '#ded9d2', borderRadius: 12, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', padding: 10 },
  typeIcon: { fontSize: 24, marginBottom: 8 },
  typeName: { color: colors.ink, fontSize: 13, fontWeight: '600' },
  typeCount: { color: '#786f66', fontSize: 11, marginTop: 7 },
});
