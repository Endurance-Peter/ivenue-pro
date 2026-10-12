import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';

const apiBaseUrl = process.env.EXPO_PUBLIC_API_URL ?? Platform.select({
  android: 'http://10.0.2.2:8000',
  default: 'http://127.0.0.1:8000',
})!;

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  try {
    const isMultipart = typeof FormData !== 'undefined' && options.body instanceof FormData;
    const response = await fetch(`${apiBaseUrl}/api/v1${path}`, {
      ...options,
      headers: {
        ...(isMultipart ? {} : { 'Content-Type': 'application/json' }),
        ...(options.headers ?? {}),
      },
    });
    const body = await response.json();
    if (!response.ok) {
      throw new Error(body?.error?.message ?? body?.detail?.[0]?.msg ?? 'We could not complete that request.');
    }
    return body as T;
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error('iVenue is temporarily unavailable. Please check your connection and try again.');
    }
    throw error;
  }
}

async function authenticatedRequest<T>(path: string, token: string, options: RequestInit = {}): Promise<T> {
  return request<T>(path, { ...options, headers: { ...(options.headers ?? {}), Authorization: `Bearer ${token}` } });
}

export type SessionResponse = {
  access_token: string;
  token_type: string;
  user: { id: string; phone: string; full_name: string; email: string; role: string; is_verified: boolean };
};

export const authApi = {
  signupWithPassword: (fullName: string, email: string, password: string, role: 'customer' | 'host') => request<SessionResponse>('/auth/signup', { method: 'POST', body: JSON.stringify({ full_name: fullName, email, password, role }) }),
  signinWithPassword: (email: string, password: string) => request<SessionResponse>('/auth/signin/request', { method: 'POST', body: JSON.stringify({ email, password }) }),
  requestSignupCode: (phone: string) => request<{ message: string; phone: string }>('/auth/signup', { method: 'POST', body: JSON.stringify({ phone }) }),
  requestSigninCode: (phone: string) => request<{ message: string; phone: string }>('/auth/signin/request', { method: 'POST', body: JSON.stringify({ phone }) }),
  verifySignin: (phone: string, code: string) => request<SessionResponse>('/auth/signin/verify', { method: 'POST', body: JSON.stringify({ phone, code }) }),
  verifySignup: (payload: { phone: string; code: string; full_name: string; email: string; role: 'customer' | 'host' }) => request<SessionResponse>('/auth/verify', { method: 'POST', body: JSON.stringify(payload) }),
};

export type Venue = {
  id: string;
  name: string;
  description: string | null;
  capacity_min: number;
  capacity_max: number;
  base_price_per_day: string;
  address: string;
  city: string;
  state: string;
  status: string;
  images: { id: string; url: string; is_cover: boolean; sort_order: number }[];
};

export const venueApi = {
  list: () => request<Venue[]>('/venues'),
  listMine: (token: string) => authenticatedRequest<Venue[]>('/venues/mine', token),
  create: (token: string, payload: Omit<Venue, 'id' | 'host_id' | 'status' | 'images'>) => authenticatedRequest<Venue>('/venues', token, { method: 'POST', body: JSON.stringify(payload) }),
  uploadImage: async (token: string, venueId: string, image: { uri: string; name: string; type: string }) => {
    if (Platform.OS !== 'web') {
      const response = await FileSystem.uploadAsync(`${apiBaseUrl}/api/v1/venues/${venueId}/images`, image.uri, {
        httpMethod: 'POST',
        uploadType: FileSystem.FileSystemUploadType.MULTIPART,
        fieldName: 'image',
        mimeType: image.type,
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = JSON.parse(response.body);
      if (response.status < 200 || response.status >= 300) throw new Error(body?.error?.message ?? 'Unable to upload the selected image.');
      return body as { id: string; url: string };
    }

    const imageResponse = await fetch(image.uri);
    if (!imageResponse.ok) throw new Error('Unable to read the selected image.');
    const imageBlob = await imageResponse.blob();
    const form = new FormData();
    form.append('image', imageBlob, image.name);
    return authenticatedRequest<{ id: string; url: string }>(`/venues/${venueId}/images`, token, { method: 'POST', body: form });
  },
  publish: (token: string, venueId: string) => authenticatedRequest<Venue>(`/venues/${venueId}/publish`, token, { method: 'POST' }),
};

export { apiBaseUrl };