"use client";

import { useState } from 'react';
import axios from 'axios';
import { API_URL } from '@/config';
import Link from 'next/link';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        setMessage(''); // Clear previous messages
        try {
            const response = await axios.post(`${API_URL}/auth/forgot-password`, { email });
            setStatus('success');
            setMessage(response.data.message);
        } catch (err: unknown) {
            setStatus('error');
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setMessage((err as any).response?.data?.message || 'Failed to send reset link');
        }
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-6 py-12 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
                    Forgot Password
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Enter your email to receive a reset link.
                </p>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                {status === 'success' ? (
                    <div className="rounded-md bg-green-50 p-4">
                        <div className="flex">
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-green-800">Success</h3>
                                <div className="mt-2 text-sm text-green-700">
                                    <p>{message}</p>
                                </div>
                                <div className="mt-4">
                                    <Link href="/login" className="text-sm font-medium text-green-800 hover:text-green-700">
                                        Back to Login
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                                Email address
                            </label>
                            <div className="mt-2">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                />
                            </div>
                        </div>

                        {status === 'error' && (
                            <div className="text-sm text-red-600">
                                {message}
                            </div>
                        )}

                        <div>
                            <button
                                type="submit"
                                disabled={status === 'loading'}
                                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
                            >
                                {status === 'loading' ? 'Sending...' : 'Send Reset Link'}
                            </button>
                        </div>
                    </form>
                )}
                <p className="mt-10 text-center text-sm text-gray-500">
                    Remembered?{' '}
                    <Link href="/login" className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500">
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
}
