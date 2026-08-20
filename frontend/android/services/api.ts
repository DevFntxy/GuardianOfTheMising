import * as SecureStore from 'expo-secure-store';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://guardian-backend-1234.loca.lt';

export const setAuthToken = async (token: string) => {
    await SecureStore.setItemAsync('access_token', token);
};

export const getAuthToken = async () => {
    return await SecureStore.getItemAsync('access_token');
};

export const removeAuthToken = async () => {
    await SecureStore.deleteItemAsync('access_token');
};

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
    const token = await getAuthToken();
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Bypass-Tunnel-Reminder': 'true',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    let response;
    try {
        response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers,
        });
    } catch (e: any) {
        throw new Error(`Error de conexión: ${e.message}. Revisa si tienes internet o si el túnel está activo.`);
    }

    if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
            const errorData = await response.json();
            if (errorData.detail) {
                if (typeof errorData.detail === 'string') {
                    errorMessage = errorData.detail;
                } else if (Array.isArray(errorData.detail)) {
                    errorMessage = errorData.detail.map((e: any) => e.msg).join(', ');
                } else {
                    errorMessage = JSON.stringify(errorData.detail);
                }
            }
        } catch (e) {}
        throw new Error(errorMessage);
    }

    if (response.status === 204) {
        return null;
    }

    return response.json();
};
