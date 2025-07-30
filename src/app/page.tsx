import Link from 'next/link';
import Image from 'next/image';
import { 
    QrCode, 
    Smartphone, 
    BarChart3, 
    Zap, 
    CheckCircle, 
    Star,
    ArrowRight,
    Menu as MenuIcon,
    Users,
    Clock,
    Globe
} from 'lucide-react';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
            {/* Header/Navigation */}
            <header className="relative bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16 lg:h-20">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                                <QrCode className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                            </div>
                            <span className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                                MenuScan
                            </span>
                        </div>
                        
                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center space-x-8">
                            <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">
                                Features
                            </a>
                            <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">
                                Pricing
                            </a>
                            <a href="#contact" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">
                                Contact
                            </a>
                        </nav>

                        <div className="flex items-center space-x-3 lg:space-x-4">
                            <Link 
                                href="/login" 
                                className="hidden sm:inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                            >
                                Sign In
                            </Link>
                            <Link 
                                href="/register" 
                                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                            >
                                Get Started
                                <ArrowRight className="ml-2 w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <main className="relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 lg:pt-20 pb-16 lg:pb-24">
                    <div className="lg:grid lg:grid-cols-12 lg:gap-12 items-center">
                        <div className="lg:col-span-6 text-center lg:text-left">
                            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-6">
                                <Star className="w-4 h-4 mr-2" />
                                Trusted by 500+ restaurants
                            </div>
                            
                            <h1 className="text-4xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-gray-900 mb-6">
                                <span className="block">Transform Your</span>
                                <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                    Menu Experience
                                </span>
                            </h1>
                            
                            <p className="text-lg lg:text-xl text-gray-600 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                                Create stunning digital menus with QR codes. Update prices instantly, track customer engagement, and grow your restaurant business with our comprehensive menu management platform.
                            </p>
                            
                            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                <Link 
                                    href="/register" 
                                    className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                                >
                                    Start Free Trial
                                    <ArrowRight className="ml-2 w-5 h-5" />
                                </Link>
                                <Link 
                                    href="#demo" 
                                    className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-gray-700 bg-white border-2 border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
                                >
                                    Watch Demo
                                </Link>
                            </div>
                            
                            <div className="mt-8 flex items-center justify-center lg:justify-start space-x-6 text-sm text-gray-500">
                                <div className="flex items-center">
                                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                                    No credit card required
                                </div>
                                <div className="flex items-center">
                                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                                    Free 14-day trial
                                </div>
                                <div className="flex items-center">
                                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                                    Cancel anytime
                                </div>
                            </div>
                        </div>
                        
                        <div className="lg:col-span-6 mt-12 lg:mt-0">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-3xl blur-3xl opacity-20"></div>
                                <div className="relative bg-white rounded-3xl shadow-2xl p-8 lg:p-12">
                                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 lg:p-8">
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                            </div>
                                            <div className="text-sm text-gray-500">MenuScan</div>
                                        </div>
                                        
                                        <div className="space-y-4">
                                            <div className="bg-white rounded-lg p-4 shadow-sm">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h3 className="font-semibold text-gray-900">Margherita Pizza</h3>
                                                        <p className="text-sm text-gray-600">Fresh mozzarella, basil, tomato sauce</p>
                                                    </div>
                                                    <div className="text-lg font-bold text-gray-900">$14.99</div>
                                                </div>
                                            </div>
                                            
                                            <div className="bg-white rounded-lg p-4 shadow-sm">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h3 className="font-semibold text-gray-900">Caesar Salad</h3>
                                                        <p className="text-sm text-gray-600">Romaine lettuce, parmesan, croutons</p>
                                                    </div>
                                                    <div className="text-lg font-bold text-gray-900">$9.99</div>
                                                </div>
                                            </div>
                                            
                                            <div className="bg-white rounded-lg p-4 shadow-sm">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h3 className="font-semibold text-gray-900">Tiramisu</h3>
                                                        <p className="text-sm text-gray-600">Classic Italian dessert</p>
                                                    </div>
                                                    <div className="text-lg font-bold text-gray-900">$7.99</div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="mt-6 flex items-center justify-center">
                                            <div className="bg-gray-900 rounded-lg p-3">
                                                <QrCode className="w-8 h-8 text-white" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Features Section */}
                <div id="features" className="py-20 lg:py-32 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16 lg:mb-20">
                            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-6">
                                Everything you need to
                                <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                    digitize your menu
                                </span>
                            </h2>
                            <p className="text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto">
                                Powerful features designed specifically for restaurants to create, manage, and optimize their digital menus.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
                            <div className="group bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 lg:p-10 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                                <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <QrCode className="w-7 h-7 text-white" />
                                </div>
                                <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4">QR Code Generation</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Generate unique QR codes for each menu section. Customers can scan and instantly access your digital menu on their phones.
                                </p>
                            </div>

                            <div className="group bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 lg:p-10 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                                <div className="w-14 h-14 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <Smartphone className="w-7 h-7 text-white" />
                                </div>
                                <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4">Mobile-First Design</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Beautiful, responsive menus that look perfect on any device. Optimized for mobile viewing with touch-friendly navigation.
                                </p>
                            </div>

                            <div className="group bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-8 lg:p-10 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                                <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-violet-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <Zap className="w-7 h-7 text-white" />
                                </div>
                                <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4">Real-time Updates</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Update prices, add new items, or mark items as unavailable instantly. Changes appear immediately for your customers.
                                </p>
                            </div>

                            <div className="group bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-8 lg:p-10 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                                <div className="w-14 h-14 bg-gradient-to-br from-orange-600 to-red-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <BarChart3 className="w-7 h-7 text-white" />
                                </div>
                                <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4">Analytics & Insights</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Track menu views, popular items, and customer engagement. Make data-driven decisions to optimize your menu and increase sales.
                                </p>
                            </div>

                            <div className="group bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-8 lg:p-10 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                                <div className="w-14 h-14 bg-gradient-to-br from-teal-600 to-cyan-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <Users className="w-7 h-7 text-white" />
                                </div>
                                <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4">Team Management</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Invite staff members, assign roles, and collaborate on menu updates. Perfect for restaurants with multiple locations.
                                </p>
                            </div>

                            <div className="group bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-8 lg:p-10 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                                <div className="w-14 h-14 bg-gradient-to-br from-pink-600 to-rose-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <Globe className="w-7 h-7 text-white" />
                                </div>
                                <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4">Multi-language Support</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Create menus in multiple languages to serve diverse customer bases. Perfect for international restaurants and tourist areas.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CTA Section */}
                <div className="py-20 lg:py-32 bg-gradient-to-br from-blue-600 to-indigo-700">
                    <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
                        <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">
                            Ready to transform your menu?
                        </h2>
                        <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
                            Join thousands of restaurants already using MenuScan to create beautiful digital menus and grow their business.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link 
                                href="/register" 
                                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-blue-600 bg-white rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                            >
                                Start Free Trial
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </Link>
                            <Link 
                                href="/login" 
                                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white border-2 border-white rounded-xl hover:bg-white hover:text-blue-600 transition-all duration-200"
                            >
                                Sign In
                            </Link>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-gray-900 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
                        <div className="col-span-1 md:col-span-2">
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                                    <QrCode className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-xl font-bold">MenuScan</span>
                            </div>
                            <p className="text-gray-400 mb-6 max-w-md">
                                Transform your restaurant menu with our digital menu management platform. Create beautiful menus, generate QR codes, and track customer engagement.
                            </p>
                            <div className="flex space-x-4">
                                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                    <span className="sr-only">Twitter</span>
                                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                                    </svg>
                                </a>
                                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                    <span className="sr-only">Instagram</span>
                                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                                        <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                                    </svg>
                                </a>
                                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                    <span className="sr-only">Facebook</span>
                                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                                        <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                                    </svg>
                                </a>
                            </div>
                        </div>
                        
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Product</h3>
                            <ul className="space-y-3">
                                <li><a href="#features" className="text-gray-400 hover:text-white transition-colors">Features</a></li>
                                <li><a href="#pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">API</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Integrations</a></li>
                            </ul>
                        </div>
                        
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Company</h3>
                            <ul className="space-y-3">
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">About</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Careers</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
                            </ul>
                        </div>
                    </div>
                    
                    <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
                        <p className="text-gray-400 text-sm">
                            &copy; 2025 MenuScan. All rights reserved.
                        </p>
                        <div className="flex space-x-6 mt-4 md:mt-0">
                            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Privacy Policy</a>
                            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Terms of Service</a>
                            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Cookie Policy</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}