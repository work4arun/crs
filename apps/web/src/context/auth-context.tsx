"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import axios from 'axios';
import { API_URL } from '@/config';
import { useRouter } from 'next/navigation';

interface User {
    id: string;
    email: string;
    roles: string[];
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (token: string, userData: User | Record<string, unknown>) => void;
    logout: () => void;
    isAuthenticated: boolean;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Check for token on mount
        const storedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (storedToken) {
            setToken(storedToken);
            fetchProfile(storedToken);
        } else {
            setIsLoading(false);
        }
    }, []);

    const fetchProfile = async (token: string) => {
        try {
            const response = await axios.get(`${API_URL}/auth/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Map API response to UI User format
            const apiUser = response.data;
            console.log("AuthContext: Raw API Profile:", apiUser);
            const uiUser: User = {
                id: apiUser.userId || apiUser.id,
                email: apiUser.email,
                roles: apiUser.roles || (apiUser.role ? [apiUser.role] : [])
            };
            console.log("AuthContext: Mapped UI User:", uiUser);

            setUser(uiUser);
        } catch (error) {
            console.error("Failed to fetch profile", error);
            localStorage.removeItem('token');
            setToken(null);
        } finally {
            setIsLoading(false);
        }
    };

    // Add interceptor to handle 401s globally
    useEffect(() => {
        const interceptor = axios.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401) {
                    // Token expired or invalid
                    console.warn("AuthContext: 401 Unauthorized detected. Logging out.");
                    localStorage.removeItem('token');
                    setToken(null);
                    setUser(null);
                    // Optional: Redirect to login if not already there
                    if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/auth') && !window.location.pathname.startsWith('/login')) {
                        window.location.href = '/login';
                    }
                }
                return Promise.reject(error);
            }
        );

        return () => {
            axios.interceptors.response.eject(interceptor);
        };
    }, []);

    const login = (newToken: string, userData: User | Record<string, unknown>) => {
        localStorage.setItem('token', newToken);
        setToken(newToken);

        // Handle login response mapping if needed
        const data = userData as Record<string, unknown> & { roles?: string[], role?: string, userId?: string, id?: string, email: string };
        const roles = data.roles || (data.role ? [data.role] : []);
        console.log("AuthContext: Login called with roles:", roles);

        const uiUser: User = {
            id: data.userId || data.id || "",
            email: data.email,
            roles: roles
        };

        setUser(uiUser);
    };

    const logout = async () => {
        try {
            if (token) {
                await axios.post(`${API_URL}/auth/logout`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
        } catch (error) {
            console.error("Logout failed", error);
        } finally {
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
            router.push('/login');
        }
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!user, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
