'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
    Menu, 
    QrCode, 
    Smartphone, 
    BarChart3, 
    ArrowLeft,
    Eye,
    EyeOff,
    CheckCircle,
    AlertCircle
} from 'lucide-react';

// Language translations
const translations = {
    en: {
        backToHome: "Back to Home",
        signIn: "Welcome back to MenuScan",
        subtitle: "Sign in to manage your digital menus and QR codes",
        email: "Email address",
        password: "Password",
        signInButton: "Sign in to your account",
        signingIn: "Signing in...",
        noAccount: "Don't have an account?",
        registerNow: "Create your account",
        emailRequired: "Email is required",
        emailInvalid: "Please enter a valid email",
        passwordRequired: "Password is required",
        passwordMin: "Password must be at least 8 characters",
        welcomeBack: "Welcome back to MenuScan",
        manageMenus: "Manage your digital menus and QR codes",
        forgotPassword: "Forgot your password?",
        rememberMe: "Remember me",
        orContinueWith: "Or continue with",
        googleSignIn: "Sign in with Google",
        features: {
            qr: "QR Code Generation",
            qrDesc: "Create unique QR codes for each menu",
            menu: "Menu Management",
            menuDesc: "Easy to update digital menus",
            analytics: "Customer Analytics",
            analyticsDesc: "Track menu views and popular items"
        }
    },
    mk: {
        backToHome: "Назад кон почетна",
        signIn: "Добредојдовте назад на MenuScan",
        subtitle: "Најавете се за да управувате со вашите дигитални менија и QR кодови",
        email: "Емаил адреса",
        password: "Лозинка",
        signInButton: "Најавете се на вашиот профил",
        signingIn: "Се најавувате...",
        noAccount: "Немате профил?",
        registerNow: "Креирајте профил",
        emailRequired: "Потребна е емаил адреса",
        emailInvalid: "Внесете валидна емаил адреса",
        passwordRequired: "Потребна е лозинка",
        passwordMin: "Лозинката мора да има најмалку 8 карактери",
        welcomeBack: "Добредојдовте назад на MenuScan",
        manageMenus: "Управувајте со вашите дигитални менија и QR кодови",
        forgotPassword: "Заборавивте ја лозинката?",
        rememberMe: "Запомни ме",
        orContinueWith: "Или продолжете со",
        googleSignIn: "Најавете се со Google",
        features: {
            qr: "Генерирање QR код",
            qrDesc: "Креирајте уникатни QR кодови за секое мени",
            menu: "Управување со мени",
            menuDesc: "Лесно ажурирање на дигитални менија",
            analytics: "Аналитика на клиенти",
            analyticsDesc: "Следете прегледи на мени и популарни ставки"
        }
    }
};

const LoginPage = () => {
    const router = useRouter();
    const [lang, setLang] = useState('en');
    const t = translations[lang];

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false
    });

    const [errors, setErrors] = useState({
        email: '',
        password: ''
    });

    const [isLoading, setIsLoading] = useState(false);
    const [generalError, setGeneralError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

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
            router.push('/dashboard');
        } catch (error) {
            setGeneralError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

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
                {/* Left side - Decorative */}
                <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 p-12 flex-col justify-between relative overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2"></div>
                    </div>
                    
                    <div className="relative z-10 text-white">
                        <div className="flex items-center space-x-3 mb-12">
                            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                                <QrCode className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-2xl font-bold">MenuScan</span>
                        </div>
                        
                        <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                            {t.welcomeBack}
                        </h1>
                        <p className="text-xl text-blue-100 leading-relaxed">
                            {t.manageMenus}
                        </p>
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
                                    <Smartphone className="w-6 h-6 text-white" />
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
                                    <BarChart3 className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <div className="text-white text-lg font-semibold mb-2">{t.features.analytics}</div>
                                    <p className="text-blue-100 leading-relaxed">{t.features.analyticsDesc}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right side - Form */}
                <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
                    <div className="w-full max-w-md space-y-8">
                        {/* Back to Home */}
                        <Link 
                            href="/" 
                            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            {t.backToHome}
                        </Link>
                        
                        {/* Header */}
                        <div className="text-center">
                            <div className="flex items-center justify-center space-x-3 mb-6">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                                    <QrCode className="w-7 h-7 text-white" />
                                </div>
                                <span className="text-2xl font-bold text-gray-900">MenuScan</span>
                            </div>
                            
                            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
                                {t.signIn}
                            </h2>
                            <p className="text-lg text-gray-600">
                                {t.subtitle}
                            </p>
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
                                    {t.email}
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    className={`w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                                        errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                                    }`}
                                    placeholder="you@restaurant.com"
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
                                        placeholder="Enter your password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="mt-2 text-sm text-red-600 flex items-center">
                                        <AlertCircle className="w-4 h-4 mr-1" />
                                        {errors.password}
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center justify-between">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={formData.rememberMe}
                                        onChange={(e) => setFormData({...formData, rememberMe: e.target.checked})}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">{t.rememberMe}</span>
                                </label>
                                <Link 
                                    href="/forgot-password" 
                                    className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                                >
                                    {t.forgotPassword}
                                </Link>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:-translate-y-0.5"
                            >
                                {isLoading ? (
                                    <span className="flex items-center gap-2">
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        {t.signingIn}
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <CheckCircle className="w-5 h-5" />
                                        {t.signInButton}
                                    </span>
                                )}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">{t.orContinueWith}</span>
                            </div>
                        </div>

                        {/* Social Login */}
                        <button className="w-full flex justify-center items-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200">
                            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            {t.googleSignIn}
                        </button>

                        {/* Sign Up Link */}
                        <div className="text-center">
                            <p className="text-gray-600">
                                {t.noAccount}{' '}
                                <Link 
                                    href="/register" 
                                    className="font-semibold text-blue-600 hover:text-blue-700 transition-colors duration-200"
                                >
                                    {t.registerNow}
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;