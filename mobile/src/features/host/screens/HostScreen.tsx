import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { venueApi, Venue } from '../../../lib/api';
import { colors } from '../../../theme/colors';
import * as ImagePicker from 'expo-image-picker';

interface HostScreenProps {
  token: string;
}

type FormState = {
  name: string;
  description: string;
  capacity_min: string;
  capacity_max: string;
  base_price_per_day: string;
  address: string;
  city: string;
  state: string;
};

const initialForm: FormState = { name: '', description: '', capacity_min: '1', capacity_max: '50', base_price_per_day: '', address: '', city: '', state: '' };

export function HostScreen({ token }: HostScreenProps) {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [form, setForm] = useState(initialForm);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState<{ uri: string; name: string; type: string } | null>(null);

  const loadVenues = () => {
    setLoading(true);
    venueApi.listMine(token).then(setVenues).catch((error) => setMessage(error instanceof Error ? error.message : 'Unable to load your venues.')).finally(() => setLoading(false));
  };

  useEffect(() => { loadVenues(); }, []);

  const update = (field: keyof FormState, value: string) => setForm((current) => ({ ...current, [field]: value }));
  const createVenue = async () => {
    setSaving(true);
    setMessage('');
    try {
      const venue = await venueApi.create(token, { ...form, capacity_min: Number(form.capacity_min), capacity_max: Number(form.capacity_max), base_price_per_day: form.base_price_per_day } as Omit<Venue, 'id' | 'host_id' | 'status' | 'images'>);
      if (selectedImage) await venueApi.uploadImage(token, venue.id, selectedImage);
      setForm(initialForm);
      setShowForm(false);
      setMessage('Your venue is now live.');
      setSelectedImage(null);
      loadVenues();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to create venue.');
    } finally { setSaving(false); }
  };

  const chooseImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setMessage('Allow photo access to add venue images.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.85 });
    if (!result.canceled) {
      const asset = result.assets[0];
      setSelectedImage({ uri: asset.uri, name: asset.fileName ?? `venue-${Date.now()}.jpg`, type: asset.mimeType ?? 'image/jpeg' });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.topBar}><View><Text style={styles.eyebrow}>HOST WORKSPACE</Text><Text style={styles.title}>Manage your spaces</Text></View><View style={styles.avatar}><Text style={styles.avatarText}>H</Text></View></View>
        <View style={styles.hero}><Text style={styles.heroTitle}>Turn your space into an experience.</Text><Text style={styles.heroText}>List your venue, reach more customers, and manage every booking from one place.</Text><Pressable onPress={() => setShowForm((value) => !value)} style={styles.primaryButton}><Text style={styles.primaryText}>{showForm ? 'Close form' : '+ List a venue'}</Text></Pressable></View>
        {message ? <View style={styles.notice}><Text style={styles.noticeText}>{message}</Text></View> : null}
        {showForm ? <View style={styles.formCard}><Text style={styles.formTitle}>Add a venue</Text><Pressable onPress={chooseImage} style={styles.imagePicker}><Text style={styles.imagePickerIcon}>+</Text><View><Text style={styles.imagePickerTitle}>{selectedImage ? 'Image selected' : 'Add venue photos'}</Text><Text style={styles.imagePickerHint}>{selectedImage?.name ?? 'Choose a cover image from your phone'}</Text></View></Pressable><Field label="Venue name" value={form.name} placeholder="The Grand Terrace" onChangeText={(value) => update('name', value)} /><Field label="Description" value={form.description} placeholder="Tell guests about the space" onChangeText={(value) => update('description', value)} multiline /><View style={styles.row}><Field label="Min guests" value={form.capacity_min} placeholder="1" onChangeText={(value) => update('capacity_min', value)} numeric /><Field label="Max guests" value={form.capacity_max} placeholder="100" onChangeText={(value) => update('capacity_max', value)} numeric /></View><Field label="Price per day" value={form.base_price_per_day} placeholder="850" onChangeText={(value) => update('base_price_per_day', value)} numeric /><Field label="Address" value={form.address} placeholder="12 Marina Road" onChangeText={(value) => update('address', value)} /><View style={styles.row}><Field label="City" value={form.city} placeholder="Lagos" onChangeText={(value) => update('city', value)} /><Field label="State" value={form.state} placeholder="Lagos" onChangeText={(value) => update('state', value)} /></View><Pressable disabled={saving} onPress={createVenue} style={[styles.primaryButton, saving && styles.disabled]}><Text style={styles.primaryText}>{saving ? 'Publishing...' : 'Publish venue'}</Text></Pressable></View> : null}
        <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Your venues</Text><Text style={styles.count}>{venues.length}</Text></View>
        {loading ? <ActivityIndicator color={colors.accent} /> : venues.length === 0 ? <Text style={styles.empty}>You have not listed a venue yet.</Text> : venues.map((venue) => <View key={venue.id} style={styles.venueCard}><View style={styles.venueIcon}><Text style={styles.venueIconText}>V</Text></View><View style={styles.venueCopy}><Text style={styles.venueName}>{venue.name}</Text><Text style={styles.venueMeta}>{venue.city}, {venue.state} · {venue.capacity_max} guests</Text><Text style={styles.live}>{venue.status === 'published' ? 'Live' : venue.status}</Text></View></View>)}
      </ScrollView>
    </SafeAreaView>
  );
}

function Field({ label, value, placeholder, onChangeText, multiline = false, numeric = false }: { label: string; value: string; placeholder: string; onChangeText: (value: string) => void; multiline?: boolean; numeric?: boolean }) { return <View style={styles.field}><Text style={styles.label}>{label}</Text><TextInput keyboardType={numeric ? 'numeric' : 'default'} multiline={multiline} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={colors.muted} style={[styles.input, multiline && styles.multiline]} value={value} /></View>; }

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.paper }, content: { padding: 20, paddingBottom: 40 }, topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, eyebrow: { color: colors.accent, fontSize: 10, fontWeight: '700', letterSpacing: 1.5 }, title: { color: colors.ink, fontFamily: 'serif', fontSize: 28, marginTop: 7 }, avatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#e5d7c9', alignItems: 'center', justifyContent: 'center' }, avatarText: { color: colors.ink, fontWeight: '700' }, hero: { backgroundColor: colors.ink, borderRadius: 18, padding: 20, marginTop: 24 }, heroTitle: { color: colors.paper, fontFamily: 'serif', fontSize: 26, lineHeight: 31 }, heroText: { color: '#c7beb6', fontSize: 14, lineHeight: 21, marginTop: 10 }, primaryButton: { backgroundColor: colors.accent, borderRadius: 12, alignItems: 'center', justifyContent: 'center', minHeight: 50, paddingHorizontal: 18, marginTop: 18 }, primaryText: { color: colors.surface, fontSize: 15, fontWeight: '800' }, notice: { backgroundColor: '#eef8ef', borderRadius: 12, padding: 13, marginTop: 16 }, noticeText: { color: '#3c7046', fontSize: 13 }, formCard: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, borderRadius: 16, padding: 16, marginTop: 18 }, formTitle: { color: colors.ink, fontFamily: 'serif', fontSize: 22, marginBottom: 14 }, imagePicker: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: colors.line, borderStyle: 'dashed', borderRadius: 12, padding: 13, marginBottom: 16 }, imagePickerIcon: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.softSurface, color: colors.accent, textAlign: 'center', lineHeight: 32, fontSize: 22 }, imagePickerTitle: { color: colors.ink, fontWeight: '700', fontSize: 13 }, imagePickerHint: { color: '#786f66', fontSize: 11, marginTop: 3 }, field: { flex: 1, marginBottom: 14 }, row: { flexDirection: 'row', gap: 10 }, label: { color: colors.ink, fontSize: 12, fontWeight: '700', marginBottom: 7 }, input: { backgroundColor: colors.paper, borderColor: colors.line, borderWidth: 1, borderRadius: 11, color: colors.ink, fontSize: 14, minHeight: 48, paddingHorizontal: 13 }, multiline: { minHeight: 82, paddingTop: 13, textAlignVertical: 'top' }, disabled: { opacity: 0.6 }, sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 30, marginBottom: 14 }, sectionTitle: { color: colors.ink, fontFamily: 'serif', fontSize: 23 }, count: { color: colors.accent, fontWeight: '800' }, empty: { color: '#786f66', fontSize: 14 }, venueCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.line, borderWidth: 1, borderRadius: 14, padding: 13, marginBottom: 10 }, venueIcon: { width: 48, height: 48, borderRadius: 13, backgroundColor: colors.softSurface, alignItems: 'center', justifyContent: 'center' }, venueIconText: { color: colors.accent, fontFamily: 'serif', fontSize: 20, fontWeight: '700' }, venueCopy: { marginLeft: 13, flex: 1 }, venueName: { color: colors.ink, fontFamily: 'serif', fontSize: 18 }, venueMeta: { color: '#786f66', fontSize: 12, marginTop: 5 }, live: { color: '#3c7046', fontSize: 12, fontWeight: '700', marginTop: 6 },
});
