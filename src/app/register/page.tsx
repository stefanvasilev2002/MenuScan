'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Store, QrCode, Coffee, BarChart, Eye, EyeOff } from 'lucide-react';

const translations = {
    en: {
        backToHome: "Back to home",
        createAccount: "Create your MenuScan account",
        subtitle: "Start creating digital menus for your restaurant",
        businessName: "Restaurant Name",
        businessNamePlaceholder: "Enter your restaurant name",
        email: "Email address",
        emailPlaceholder: "you@restaurant.com",
        password: "Password",
        passwordRequirements: "Password must include:",
        lengthReq: "At least 8 characters",
        upperReq: "One uppercase letter",
        lowerReq: "One lowercase letter",
        numberReq: "One number",
        specialReq: "One special character",
        createButton: "Create account",
        creating: "Creating account...",
        haveAccount: "Already have an account?",
        signIn: "Sign in instead",
        features: {
            title: "Everything you need to digitize your menu",
            qr: "QR Code Generation",
            qrDesc: "Generate unique QR codes for each menu",
            menu: "Menu Management",
            menuDesc: "Easy-to-update digital menus",
            analytics: "Customer Analytics",
            analyticsDesc: "Track menu views and popular items"
        },
        confirmPassword: "Confirm Password",
        confirmPasswordPlaceholder: "Re-enter your password",
        passwordMismatch: "Passwords do not match",
        showPassword: "Show password",
        hidePassword: "Hide password"
    },
    mk: {
        backToHome: "Назад кон почетна",
        createAccount: "Креирајте MenuScan профил",
        subtitle: "Започнете со креирање дигитални менија за вашиот ресторан",
        businessName: "Име на ресторан",
        businessNamePlaceholder: "Внесете го името на вашиот ресторан",
        email: "Емаил адреса",
        emailPlaceholder: "vie@restoran.com",
        password: "Лозинка",
        passwordRequirements: "Лозинката мора да содржи:",
        lengthReq: "Најмалку 8 карактери",
        upperReq: "Една голема буква",
        lowerReq: "Една мала буква",
        numberReq: "Еден број",
        specialReq: "Еден специјален карактер",
        createButton: "Креирај профил",
        creating: "Креирање профил...",
        haveAccount: "Веќе имате профил?",
        signIn: "Најавете се",
        features: {
            title: "Сè што ви треба за дигитализација на вашето мени",
            qr: "Генерирање QR код",
            qrDesc: "Генерирајте уникатни QR кодови за секое мени",
            menu: "Управување со мени",
            menuDesc: "Лесно ажурирање на дигитални менија",
            analytics: "Аналитика на клиенти",
            analyticsDesc: "Следете прегледи на мени и популарни ставки"
        },
        confirmPassword: "Потврди лозинка",
        confirmPasswordPlaceholder: "Повторно внесете ја лозинката",
        passwordMismatch: "Лозинките не се совпаѓаат",
        showPassword: "Прикажи лозинка",
        hidePassword: "Сокриј лозинка"
    }
};

const RegisterPage = () => {
    const router = useRouter();
    const [lang, setLang] = useState('en');
    const t = translations[lang];

    const [formData, setFormData] = useState({
        businessName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [errors, setErrors] = useState({
        businessName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [isLoading, setIsLoading] = useState(false);
    const [generalError, setGeneralError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const validatePassword = (password) => {
        const conditions = {
            length: password.length >= 8,
            upper: /[A-Z]/.test(password),
            lower: /[a-z]/.test(password),
            number: /[0-9]/.test(password),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        };
        return conditions;
    };

    const validateForm = () => {
        const newErrors = {
            businessName: '',
            email: '',
            password: '',
            confirmPassword: ''
        };

        if (!formData.businessName.trim()) {
            newErrors.businessName = 'Business name is required';
        }

        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }

        const passwordConditions = validatePassword(formData.password);
        if (!Object.values(passwordConditions).every(Boolean)) {
            newErrors.password = 'Password does not meet all requirements';
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = t.passwordMismatch;
        }

        setErrors(newErrors);
        return Object.values(newErrors).every(error => !error);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsLoading(true);
        setGeneralError('');

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to create account');
            }

            router.push('/dashboard');
        } catch (error) {
            setGeneralError(error instanceof Error ? error.message : 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const passwordConditions = validatePassword(formData.password);

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
                {/* Left side - Form */}
                <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                    <div className="w-full max-w-md">
                        <div className="mt-4 text-center text-sm">
                            <Link href="/" className="text-blue-600 hover:text-blue-800">
                                {t.backToHome}
                            </Link>
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">
                            {t.createAccount}
                        </h2>
                        <p className="text-center text-gray-600 mb-8">{t.subtitle}</p>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {generalError && (
                                <div
                                    className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                                    {generalError}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    {t.businessName}
                                </label>
                                <input
                                    type="text"
                                    value={formData.businessName}
                                    onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                                    placeholder={t.businessNamePlaceholder}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                                {errors.businessName && (
                                    <p className="mt-1 text-sm text-red-600">{errors.businessName}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    {t.email}
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    placeholder={t.emailPlaceholder}
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
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={formData.password}
                                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                                        aria-label={showPassword ? t.hidePassword : t.showPassword}
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                                    </button>
                                </div>

                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    {t.confirmPassword}
                                </label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                                        placeholder={t.confirmPasswordPlaceholder}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                                        aria-label={showConfirmPassword ? t.hidePassword : t.showPassword}
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-4 h-4"/> :
                                            <Eye className="w-4 h-4"/>}
                                    </button>
                                </div>
                                {errors.confirmPassword && (
                                    <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                                )}
                            </div>
                            <div className="mt-2">
                                <p className="text-sm text-gray-600 mb-1">{t.passwordRequirements}</p>
                                <ul className="space-y-1">
                                    <li className={`text-sm ${passwordConditions.length ? 'text-green-600' : 'text-gray-500'}`}>
                                        {t.lengthReq}
                                    </li>
                                    <li className={`text-sm ${passwordConditions.upper ? 'text-green-600' : 'text-gray-500'}`}>
                                        {t.upperReq}
                                    </li>
                                    <li className={`text-sm ${passwordConditions.lower ? 'text-green-600' : 'text-gray-500'}`}>
                                        {t.lowerReq}
                                    </li>
                                    <li className={`text-sm ${passwordConditions.number ? 'text-green-600' : 'text-gray-500'}`}>
                                        {t.numberReq}
                                    </li>
                                    <li className={`text-sm ${passwordConditions.special ? 'text-green-600' : 'text-gray-500'}`}>
                                        {t.specialReq}
                                    </li>
                                </ul>
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                            >
                                {isLoading ? (
                                    <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none"
                         viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                                        {t.creating}
                  </span>
                                ) : t.createButton}
                            </button>

                            <div className="mt-6 text-center">
                                <p className="text-sm text-gray-600">
                                    {t.haveAccount}{' '}
                                    <Link href="/login" className="text-blue-600 hover:text-blue-500">
                                        {t.signIn}
                                    </Link>
                                </p>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Right side - Features */}
                <div className="hidden lg:flex lg:w-1/2 bg-blue-600 p-12 flex-col justify-between">
                    <div className="text-white">
                        <Store className="w-10 h-10"/>
                        <h1 className="mt-12 text-4xl font-bold">{t.features.title}</h1>
                    </div>

                    <div className="grid grid-cols-1 gap-8">
                        <div className="bg-white/10 p-6 rounded-lg flex items-start space-x-4">
                            <QrCode className="w-6 h-6 text-white"/>
                            <div>
                                <div className="text-white text-lg font-semibold">{t.features.qr}</div>
                                <p className="text-blue-100 mt-2">{t.features.qrDesc}</p>
                            </div>
                        </div>

                        <div className="bg-white/10 p-6 rounded-lg flex items-start space-x-4">
                            <Coffee className="w-6 h-6 text-white"/>
                            <div>
                                <div className="text-white text-lg font-semibold">{t.features.menu}</div>
                                <p className="text-blue-100 mt-2">{t.features.menuDesc}</p>
                            </div>
                        </div>

                        <div className="bg-white/10 p-6 rounded-lg flex items-start space-x-4">
                            <BarChart className="w-6 h-6 text-white"/>
                            <div>
                                <div className="text-white text-lg font-semibold">{t.features.analytics}</div>
                                <p className="text-blue-100 mt-2">{t.features.analyticsDesc}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;