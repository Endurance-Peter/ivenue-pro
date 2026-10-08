import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { apiBaseUrl, venueApi, Venue } from '../../../lib/api';
import { colors } from '../../../theme/colors';

const venueTypes = ['All', 'Rooftops', 'Ballrooms', 'Gardens', 'Studios', 'Waterfront'];

export function BrowseScreen() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [selectedType, setSelectedType] = useState('All');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState<Date | null>(null);
  const [dateInput, setDateInput] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [submittedSearch, setSubmittedSearch] = useState({ location: '', date: '' });
  const [guests, setGuests] = useState(2);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    venueApi.list()
      .then((result) => { if (mounted) setVenues(result); })
      .catch((requestError) => { if (mounted) setError(requestError instanceof Error ? requestError.message : 'Unable to load venues.'); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const visibleVenues = useMemo(() => {
    const typeFiltered = selectedType === 'All' ? venues : venues.filter((venue) => venue.name.toLowerCase().includes(selectedType.slice(0, -1).toLowerCase()));
    if (!submittedSearch.location.trim()) return typeFiltered;
    const query = submittedSearch.location.trim().toLowerCase();
    return typeFiltered.filter((venue) => `${venue.name} ${venue.city} ${venue.state} ${venue.address}`.toLowerCase().includes(query));
  }, [selectedType, submittedSearch, venues]);

  const formattedDate = date ? date.toLocaleDateString() : dateInput;
  const submitSearch = () => setSubmittedSearch({ location, date: formattedDate });
  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (event.type === 'set' && selectedDate) {
      setDate(selectedDate);
      setDateInput(selectedDate.toLocaleDateString());
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <View style={styles.brandRow}>
            <View style={styles.logo}><Text style={styles.logoText}>iV</Text></View>
            <Text style={styles.brandName}>iVenue</Text>
          </View>
          <Pressable accessibilityLabel="Open profile" style={styles.avatar}><Text style={styles.avatarText}>E</Text></Pressable>
        </View>

        <View style={styles.greetingRow}>
          <View><Text style={styles.eyebrow}>GOOD MORNING</Text><Text style={styles.greeting}>Find your next space</Text></View>
          <MaterialCommunityIcons name="map-marker-outline" size={28} color={colors.accent} />
        </View>

        <View style={styles.searchCard}>
          <View style={styles.searchField}>
            <MaterialCommunityIcons name="map-marker-outline" size={22} color={colors.accent} style={styles.fieldIcon} />
            <View style={styles.fieldContent}><Text style={styles.fieldLabel}>Location</Text><TextInput accessibilityLabel="Event location" onChangeText={setLocation} placeholder="Where is your event?" placeholderTextColor={colors.muted} style={styles.fieldInput} value={location} /></View>
          </View>
          <View style={styles.fieldDivider} />
          <View style={styles.searchField}>
            <MaterialCommunityIcons name="calendar-month-outline" size={22} color={colors.accent} style={styles.fieldIcon} />
            <View style={styles.fieldContent}><Text style={styles.fieldLabel}>Date</Text><Pressable accessibilityRole="button" accessibilityLabel="Choose event date" onPress={() => setShowDatePicker(true)}><Text style={[styles.fieldInput, !formattedDate && styles.datePlaceholder]}>{formattedDate || 'Choose a date'}</Text></Pressable></View>
          </View>
          <View style={styles.fieldDivider} />
          <View style={styles.searchField}>
            <MaterialCommunityIcons name="account-group-outline" size={22} color={colors.accent} style={styles.fieldIcon} />
            <View style={styles.fieldContent}><Text style={styles.fieldLabel}>Guests</Text><Text style={styles.guestValue}>{guests} {guests === 1 ? 'guest' : 'guests'}</Text></View>
            <View style={styles.stepper}><Pressable accessibilityLabel="Decrease guests" disabled={guests <= 1} onPress={() => setGuests((value) => Math.max(1, value - 1))} style={styles.stepButton}><Text style={styles.stepText}>−</Text></Pressable><Pressable accessibilityLabel="Increase guests" onPress={() => setGuests((value) => value + 1)} style={styles.stepButton}><Text style={styles.stepText}>+</Text></Pressable></View>
          </View>
          <Pressable accessibilityLabel="Search venues" onPress={submitSearch} style={styles.searchButton}><MaterialCommunityIcons name="magnify" size={24} color={colors.paper} /></Pressable>
        </View>
        {showDatePicker ? <DateTimePicker value={date ?? new Date()} mode="date" display="default" onChange={onDateChange} /> : null}

        <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Explore by type</Text><Text style={styles.seeAll}>See all</Text></View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          {venueTypes.map((type) => <Pressable key={type} onPress={() => setSelectedType(type)} style={[styles.chip, selectedType === type && styles.chipSelected]}><Text style={[styles.chipText, selectedType === type && styles.chipTextSelected]}>{type}</Text></Pressable>)}
        </ScrollView>

        <View style={[styles.sectionHeader, styles.featuredHeader]}><View><Text style={styles.sectionTitle}>Featured spaces</Text><Text style={styles.sectionSubtitle}>Handpicked for your next event</Text></View><Text style={styles.seeAll}>{venues.length} spaces</Text></View>
        {loading ? <ActivityIndicator color={colors.accent} style={styles.loader} /> : error ? <View style={styles.message}><Text style={styles.messageTitle}>We couldn&apos;t load venues</Text><Text style={styles.messageText}>{error}</Text></View> : visibleVenues.length === 0 ? <View style={styles.message}><Text style={styles.messageTitle}>No spaces yet</Text><Text style={styles.messageText}>Published host venues will appear here.</Text></View> : visibleVenues.map((venue) => <VenueCard key={venue.id} venue={venue} />)}
      </ScrollView>
    </SafeAreaView>
  );
}

function VenueCard({ venue }: { venue: Venue }) {
  const coverImage = venue.images.find((image) => image.is_cover) ?? venue.images[0];
  const imageUri = coverImage ? (coverImage.url.startsWith('http') ? coverImage.url : `${apiBaseUrl}${coverImage.url}`) : undefined;

  return (
    <Pressable style={styles.venueCard}>
      {imageUri ? <Image source={{ uri: imageUri }} style={styles.venueImage} /> : <View style={[styles.venueImage, styles.imagePlaceholder]}><Text style={styles.placeholderText}>iV</Text></View>}
      <View style={styles.venueDetails}>
        <View style={styles.venueTitleRow}><Text numberOfLines={1} style={styles.venueName}>{venue.name}</Text><Text style={styles.heart}>♡</Text></View>
        <Text style={styles.venueLocation}>{venue.city}, {venue.state}</Text>
        <Text numberOfLines={2} style={styles.venueDescription}>{venue.description || 'A remarkable space for your next event.'}</Text>
        <View style={styles.venueMeta}><Text style={styles.price}>${venue.base_price_per_day}<Text style={styles.priceSuffix}> / day</Text></Text><Text style={styles.capacity}>{venue.capacity_max} guests</Text></View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.paper },
  content: { paddingHorizontal: 20, paddingBottom: 32 },
  topBar: { height: 58, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  logo: { width: 36, height: 36, borderRadius: 11, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center' },
  logoText: { color: colors.paper, fontFamily: 'serif', fontSize: 14, fontWeight: '700' },
  brandName: { color: colors.ink, fontFamily: 'serif', fontSize: 21, fontWeight: '700' },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#e5d7c9', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.ink, fontSize: 14, fontWeight: '700' },
  greetingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 18, marginBottom: 20 },
  eyebrow: { color: colors.accent, fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginBottom: 7 },
  greeting: { color: colors.ink, fontFamily: 'serif', fontSize: 29 },
  locationIcon: { color: colors.accent, fontSize: 30 },
  searchCard: { backgroundColor: colors.surface, borderColor: colors.line, borderWidth: 1, borderRadius: 16, padding: 14, shadowColor: '#2b2118', shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
  searchField: { flexDirection: 'row', alignItems: 'center', paddingVertical: 7, minHeight: 58 },
  fieldIcon: { width: 32, marginRight: 8 },
  fieldContent: { flex: 1 },
  fieldLabel: { color: '#786f66', fontSize: 11, marginBottom: 2 },
  fieldInput: { color: colors.ink, fontSize: 15, padding: 0, minWidth: 0 },
  datePlaceholder: { color: colors.muted },
  fieldDivider: { height: 1, backgroundColor: '#eee8e0', marginVertical: 9, marginLeft: 40 },
  guestValue: { color: colors.ink, fontSize: 15 },
  stepper: { flexDirection: 'row', gap: 6 },
  stepButton: { width: 30, height: 30, borderRadius: 15, backgroundColor: colors.softSurface, alignItems: 'center', justifyContent: 'center' },
  stepText: { color: colors.ink, fontSize: 18, lineHeight: 20 },
  searchButton: { alignSelf: 'flex-end', width: 46, height: 46, borderRadius: 14, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 30, marginBottom: 13 },
  sectionTitle: { color: colors.ink, fontFamily: 'serif', fontSize: 22 },
  sectionSubtitle: { color: '#786f66', fontSize: 12, marginTop: 4 },
  seeAll: { color: colors.accent, fontSize: 12, fontWeight: '700' },
  chipRow: { gap: 9, paddingRight: 20 },
  chip: { borderColor: colors.line, borderWidth: 1, borderRadius: 22, paddingHorizontal: 17, paddingVertical: 10, backgroundColor: colors.surface },
  chipSelected: { backgroundColor: colors.ink, borderColor: colors.ink },
  chipText: { color: '#786f66', fontSize: 13 },
  chipTextSelected: { color: colors.paper, fontWeight: '700' },
  featuredHeader: { marginTop: 32 },
  loader: { marginTop: 25 },
  message: { backgroundColor: colors.surface, borderRadius: 14, padding: 18, borderWidth: 1, borderColor: colors.line },
  messageTitle: { color: colors.ink, fontSize: 15, fontWeight: '700' },
  messageText: { color: '#786f66', fontSize: 13, lineHeight: 19, marginTop: 6 },
  venueCard: { backgroundColor: colors.surface, borderRadius: 16, overflow: 'hidden', borderColor: colors.line, borderWidth: 1, marginBottom: 16 },
  venueImage: { width: '100%', height: 170, backgroundColor: '#e9e0d5' },
  imagePlaceholder: { alignItems: 'center', justifyContent: 'center' },
  placeholderText: { color: '#b69a7e', fontFamily: 'serif', fontSize: 34, fontWeight: '700' },
  venueDetails: { padding: 15 },
  venueTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  venueName: { color: colors.ink, fontFamily: 'serif', fontSize: 20, flex: 1, marginRight: 12 },
  heart: { color: colors.accent, fontSize: 25 },
  venueLocation: { color: colors.accent, fontSize: 12, marginTop: 4 },
  venueDescription: { color: '#786f66', fontSize: 13, lineHeight: 19, marginTop: 10 },
  venueMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 13 },
  price: { color: colors.ink, fontSize: 15, fontWeight: '800' },
  priceSuffix: { color: '#786f66', fontSize: 12, fontWeight: '400' },
  capacity: { color: '#786f66', fontSize: 12 },
});
