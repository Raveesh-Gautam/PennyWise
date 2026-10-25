import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';

export const BASE_URL = 'http://10.149.204.247:8082';

export async function api(path, options = {}) {
    const token = await SecureStore.getItemAsync('jwt_token');

    const response = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            ...options.headers,
        },
    });

    if (response.status === 401 || response.status === 403) {
        await SecureStore.deleteItemAsync('jwt_token');
        router.replace('/login');
        throw new Error('Session expired. Please login again');
    }

    if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
    }

    if (response.status === 204) return null;

    return response.json();
}