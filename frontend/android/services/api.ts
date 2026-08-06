import * as SecureStore from 'expo-secure-store';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://172.16.0.173:8000';

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
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = "Bearer ${token}";
    }

    const response = await fetch("${API_URL}", {
        ...options,
        headers,
    });

    if (!response.ok) {
        let errorMessage = "HTTP error! status: ${response.status}";
        try {
            const errorData = await response.json();
            errorMessage = errorData.detail || errorMessage;
        } catch (e) {}
        throw new Error(errorMessage);
    }

    if (response.status === 204) {
        return null;
    }

    return response.json();
};
