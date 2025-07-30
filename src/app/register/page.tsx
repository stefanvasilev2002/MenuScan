'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
    Store, 
    QrCode, 
    Coffee, 
    BarChart, 
    Eye, 
    EyeOff, 
    ArrowLeft,
    CheckCircle,
    AlertCircle,
    Star,
    Users,
    Zap
} from 'lucide-react';

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
        createButton: "Create your account",
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
        hidePassword: "Hide password",
        trustedBy: "Trusted by 500+ restaurants",
        freeTrial: "14-day free trial",
        noCreditCard: "No credit card required"
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
        hidePassword: "Сокриј лозинка",
        trustedBy: "Доверено од 500+ ресторани",
        freeTrial: "14-дневен бесплатен пробен период",
        noCreditCard: "Не се потребни кредитни картички"
    }
};

const RegisterPage = () => {
    const router = useRouter();
    const [lang, setLang] = useState<'en' | 'mk'>('en');
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

    const validatePassword = (password: string) => {
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
            {/* Language Switcher */}
            <div className="absolute top-4 right-4 z-50">
                <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-lg p-1 shadow-lg">
                    <button
                        onClick={() => setLang('en')}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                            lang === 'en' 
                                ? 'bg-blue-600 text-white shadow-md' 
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                    >
                        EN
                    </button>
                    <button
                        onClick={() => setLang('mk')}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                            lang === 'mk' 
                                ? 'bg-blue-600 text-white shadow-md' 
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                    >
                        MK
                    </button>
                </div>
            </div>

            <div className="flex min-h-screen">
                {/* Left side - Form */}
                <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
                    <div className="w-full max-w-md">
                        {/* Back to Home */}
                        <Link 
                            href="/" 
                            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200 mb-8"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            {t.backToHome}
                        </Link>
                        
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="flex items-center justify-center space-x-3 mb-6">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                                    <Store className="w-7 h-7 text-white" />
                                </div>
                                <span className="text-2xl font-bold text-gray-900">MenuScan</span>
                            </div>
                            
                            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
                                {t.createAccount}
                            </h2>
                            <p className="text-lg text-gray-600 mb-6">{t.subtitle}</p>
                            
                            {/* Trust Badges */}
                            <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
                                <div className="flex items-center">
                                    <Star className="w-4 h-4 text-yellow-500 mr-1" />
                                    {t.trustedBy}
                                </div>
                                <div className="flex items-center">
                                    <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                                    {t.freeTrial}
                                </div>
                                <div className="flex items-center">
                                    <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                                    {t.noCreditCard}
                                </div>
                            </div>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {generalError && (
                                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3">
                                    <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                                    <div className="text-red-700 text-sm">{generalError}</div>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    {t.businessName}
                                </label>
                                <input
                                    type="text"
                                    value={formData.businessName}
                                    onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                                    placeholder={t.businessNamePlaceholder}
                                    className={`w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                                        errors.businessName ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                                    }`}
                                />
                                {errors.businessName && (
                                    <p className="mt-2 text-sm text-red-600 flex items-center">
                                        <AlertCircle className="w-4 h-4 mr-1" />
                                        {errors.businessName}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    {t.email}
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    placeholder={t.emailPlaceholder}
                                    className={`w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                                        errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                                    }`}
                                />
                                {errors.email && (
                                    <p className="mt-2 text-sm text-red-600 flex items-center">
                                        <AlertCircle className="w-4 h-4 mr-1" />
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    {t.password}
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={formData.password}
                                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                                        className={`w-full px-4 py-3 pr-12 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                                            errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                                        }`}
                                        placeholder="Create a strong password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                
                                {/* Password Requirements */}
                                <div className="mt-3 p-4 bg-gray-50 rounded-xl">
                                    <p className="text-sm font-medium text-gray-700 mb-3">{t.passwordRequirements}</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        <div className={`flex items-center text-sm ${passwordConditions.length ? 'text-green-600' : 'text-gray-500'}`}>
                                            <CheckCircle className={`w-4 h-4 mr-2 ${passwordConditions.length ? 'text-green-500' : 'text-gray-400'}`} />
                                            {t.lengthReq}
                                        </div>
                                        <div className={`flex items-center text-sm ${passwordConditions.upper ? 'text-green-600' : 'text-gray-500'}`}>
                                            <CheckCircle className={`w-4 h-4 mr-2 ${passwordConditions.upper ? 'text-green-500' : 'text-gray-400'}`} />
                                            {t.upperReq}
                                        </div>
                                        <div className={`flex items-center text-sm ${passwordConditions.lower ? 'text-green-600' : 'text-gray-500'}`}>
                                            <CheckCircle className={`w-4 h-4 mr-2 ${passwordConditions.lower ? 'text-green-500' : 'text-gray-400'}`} />
                                            {t.lowerReq}
                                        </div>
                                        <div className={`flex items-center text-sm ${passwordConditions.number ? 'text-green-600' : 'text-gray-500'}`}>
                                            <CheckCircle className={`w-4 h-4 mr-2 ${passwordConditions.number ? 'text-green-500' : 'text-gray-400'}`} />
                                            {t.numberReq}
                                        </div>
                                        <div className={`flex items-center text-sm ${passwordConditions.special ? 'text-green-600' : 'text-gray-500'}`}>
                                            <CheckCircle className={`w-4 h-4 mr-2 ${passwordConditions.special ? 'text-green-500' : 'text-gray-400'}`} />
                                            {t.specialReq}
                                        </div>
                                    </div>
                                </div>
                                
                                {errors.password && (
                                    <p className="mt-2 text-sm text-red-600 flex items-center">
                                        <AlertCircle className="w-4 h-4 mr-1" />
                                        {errors.password}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    {t.confirmPassword}
                                </label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                                        placeholder={t.confirmPasswordPlaceholder}
                                        className={`w-full px-4 py-3 pr-12 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                                            errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                                        }`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                {errors.confirmPassword && (
                                    <p className="mt-2 text-sm text-red-600 flex items-center">
                                        <AlertCircle className="w-4 h-4 mr-1" />
                                        {errors.confirmPassword}
                                    </p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:-translate-y-0.5"
                            >
                                {isLoading ? (
                                    <span className="flex items-center gap-2">
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        {t.creating}
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <CheckCircle className="w-5 h-5" />
                                        {t.createButton}
                                    </span>
                                )}
                            </button>

                            {/* Sign In Link */}
                            <div className="text-center">
                                <p className="text-gray-600">
                                    {t.haveAccount}{' '}
                                    <Link 
                                        href="/login" 
                                        className="font-semibold text-blue-600 hover:text-blue-700 transition-colors duration-200"
                                    >
                                        {t.signIn}
                                    </Link>
                                </p>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Right side - Features */}
                <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 p-12 flex-col justify-between relative overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 right-0 w-72 h-72 bg-white rounded-full translate-x-1/2 -translate-y-1/2"></div>
                        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 translate-y-1/2"></div>
                    </div>
                    
                    <div className="relative z-10 text-white">
                        <div className="flex items-center space-x-3 mb-12">
                            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                                <Store className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-2xl font-bold">MenuScan</span>
                        </div>
                        
                        <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                            {t.features.title}
                        </h1>
                    </div>

                    <div className="relative z-10 grid grid-cols-1 gap-6">
                        <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20">
                            <div className="flex items-start space-x-4">
                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <QrCode className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <div className="text-white text-lg font-semibold mb-2">{t.features.qr}</div>
                                    <p className="text-blue-100 leading-relaxed">{t.features.qrDesc}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20">
                            <div className="flex items-start space-x-4">
                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <Coffee className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <div className="text-white text-lg font-semibold mb-2">{t.features.menu}</div>
                                    <p className="text-blue-100 leading-relaxed">{t.features.menuDesc}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20">
                            <div className="flex items-start space-x-4">
                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <BarChart className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <div className="text-white text-lg font-semibold mb-2">{t.features.analytics}</div>
                                    <p className="text-blue-100 leading-relaxed">{t.features.analyticsDesc}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;