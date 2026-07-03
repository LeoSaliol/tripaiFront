/* eslint-disable @typescript-eslint/no-explicit-any */
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

async function request<T>(
    endpoint: string,
    options: RequestInit = {},
): Promise<T> {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
    };

    const res = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
        credentials: 'include',
    });

    if (!res.ok) {
        let message = res.statusText;
        try {
            const text = await res.text();
            const parsed = JSON.parse(text);
            const err = parsed.error;
            if (err && typeof err === 'object' && err.message) {
                message = err.message;
            } else if (err && typeof err === 'string') {
                message = err;
            } else {
                message = parsed.message || parsed.errorMessage || text;
            }
        } catch {
            message = res.statusText;
        }
        const error = new Error(message);
        (error as any).status = res.status;
        throw error;
    }

    return res.json();
}

export const auth = {
    register: (body: { email: string; password: string; name: string }) =>
        request<{ user: { _id: string; email: string; name: string } }>(
            '/auth/register',
            {
                method: 'POST',
                body: JSON.stringify(body),
            },
        ),
    login: (body: { email: string; password: string }) =>
        request<{ user: { _id: string; email: string; name: string } }>(
            '/auth/login',
            {
                method: 'POST',
                body: JSON.stringify(body),
            },
        ),
    me: () =>
        request<{ user: { _id: string; email: string; name: string } }>(
            '/auth/me',
        ),
    logout: () =>
        request<{ message: string }>('/auth/logout', { method: 'POST' }),
    updateProfile: (body: {
        name?: string;
        email?: string;
        currentPassword?: string;
        newPassword?: string;
    }) =>
        request<{ user: { _id: string; email: string; name: string } }>(
            '/users',
            {
                method: 'PATCH',
                body: JSON.stringify(body),
            },
        ),
    deleteAccount: (body: { password: string }) =>
        request<void>('/users', {
            method: 'DELETE',
            body: JSON.stringify(body),
        }),
};

export const trips = {
    generate: (body: {
        destination: string;
        durationDays: number;
        interests: string[];
        budget: string;
    }) =>
        request<{
            _id: string;
            destination: string;
            durationDays: number;
            preferences: { interests: string[]; budget: string };
            days: import('@/types').Day[];
            isPublic: boolean;
            createdAt: string;
        }>('/trips/generate', {
            method: 'POST',
            body: JSON.stringify(body),
        }),
    save: (body: import('@/types').Trip) =>
        request<import('@/types').Trip>('/trips', {
            method: 'POST',
            body: JSON.stringify(body),
        }),
    list: () => request<import('@/types').Trip[]>('/trips'),
    get: (id: string) => request<import('@/types').Trip>(`/trips/${id}`),
    update: (id: string, body: Partial<import('@/types').Trip>) =>
        request<import('@/types').Trip>(`/trips/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(body),
        }),
    remove: (id: string) =>
        request<void>(`/trips/${id}`, {
            method: 'DELETE',
        }),
};
