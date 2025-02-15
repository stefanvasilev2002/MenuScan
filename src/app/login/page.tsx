'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Menu } from 'lucide-react';

// Language translations
const translations = {
    en: {
        signIn: "Sign in to your Menu Creator",
        email: "Email address",
        password: "Password",
        signInButton: "Sign in",
        signingIn: "Signing in...",
        noAccount: "Don't have an account?",
        registerNow: "Register now",
        emailRequired: "Email is required",
        emailInvalid: "Please enter a valid email",
        passwordRequired: "Password is required",
        passwordMin: "Password must be at least 8 characters",
        welcomeBack: "Welcome back to MenuQR",
        manageMenus: "Manage your digital menus and QR codes"
    },
    mk: {
        signIn: "Најавете се во Menu Creator",
        email: "Емаил адреса",
        password: "Лозинка",
        signInButton: "Најава",
        signingIn: "Се најавувате...",
        noAccount: "Немате профил?",
        registerNow: "Регистрирајте се",
        emailRequired: "Потребна е емаил адреса",
        emailInvalid: "Внесете валидна емаил адреса",
        passwordRequired: "Потребна е лозинка",
        passwordMin: "Лозинката мора да има најмалку 8 карактери",
        welcomeBack: "Добредојдовте во MenuQR",
        manageMenus: "Управувајте со вашите дигитални менија и QR кодови"
    }
};

const LoginPage = () => {
    const router = useRouter();
    const [lang, setLang] = useState('en');
    const t = translations[lang];

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const [errors, setErrors] = useState({
        email: '',
        password: ''
    });

    const [isLoading, setIsLoading] = useState(false);
    const [generalError, setGeneralError] = useState('');

    const validateForm = () => {
        const newErrors = {
            email: '',
            password: ''
        };

        // Email validation
        if (!formData.email) {
            newErrors.email = t.emailRequired;
        } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
            newErrors.email = t.emailInvalid;
        }

        // Password validation
        if (!formData.password) {
            newErrors.password = t.passwordRequired;
        } else if (formData.password.length < 8) {
            newErrors.password = t.passwordMin;
        }

        setErrors(newErrors);
        return !newErrors.email && !newErrors.password;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsLoading(true);
        setGeneralError('');

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Failed to login');
            window.location.href = '/dashboard';
        } catch (error) {
            setGeneralError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
            <div className="absolute top-4 right-4 space-x-2">
                <button
                    onClick={() => setLang('en')}
                    className={`px-3 py-1 rounded ${lang === 'en' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                >
                    EN
                </button>
                <button
                    onClick={() => setLang('mk')}
                    className={`px-3 py-1 rounded ${lang === 'mk' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                >
                    MK
                </button>
            </div>

            <div className="flex min-h-screen">
                {/* Left side - Decorative */}
                <div className="hidden lg:flex lg:w-1/2 bg-blue-600 p-12 flex-col justify-between">
                    <div className="text-white">
                        <Menu className="w-10 h-10" />
                        <h1 className="mt-12 text-4xl font-bold">{t.welcomeBack}</h1>
                        <p className="mt-4 text-blue-100">{t.manageMenus}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/10 p-4 rounded-lg">
                            <div className="text-white text-lg font-semibold">QR Code Generation</div>
                            <p className="text-blue-100 mt-2">Create unique QR codes for each menu</p>
                        </div>
                        <div className="bg-white/10 p-4 rounded-lg">
                            <div className="text-white text-lg font-semibold">Menu Management</div>
                            <p className="text-blue-100 mt-2">Easy to update digital menus</p>
                        </div>
                    </div>
                </div>

                {/* Right side - Form */}
                <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                    <div className="w-full max-w-md">
                        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                            {t.signIn}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {generalError && (
                                <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                                    {generalError}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    {t.email}
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                                {errors.email && (
                                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    {t.password}
                                </label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                                {errors.password && (
                                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                            >
                                {isLoading ? (
                                    <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                                        {t.signingIn}
                  </span>
                                ) : t.signInButton}
                            </button>

                            <div className="mt-6 text-center">
                                <p className="text-sm text-gray-600">
                                    {t.noAccount}{' '}
                                    <Link href="/register" className="text-blue-600 hover:text-blue-500">
                                        {t.registerNow}
                                    </Link>
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;