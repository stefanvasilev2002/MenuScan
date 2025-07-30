'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
    Plus, 
    Building2, 
    Calendar, 
    ArrowRight,
    Utensils,
    QrCode,
    MapPin,
    Phone,
    Mail,
    CheckCircle,
    AlertCircle,
    Sparkles
} from 'lucide-react';
import { Restaurant } from '@/models/Restaurant';
import { User } from '@/models/User';

interface RestaurantsListProps {
    restaurants: Restaurant[];
    user: User;
}

export default function RestaurantsList({ restaurants, user }: RestaurantsListProps) {
    const [isCreating, setIsCreating] = useState(false);
    const [newRestaurant, setNewRestaurant] = useState({
        name: '',
        description: ''
    });

    const handleCreateRestaurant = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreating(true);

        try {
            const response = await fetch('/api/restaurant', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newRestaurant),
            });

            if (response.ok) {
                const data = await response.json();
                window.location.href = `/dashboard/${data.restaurant.slug}`;
            } else {
                const error = await response.json();
                alert(error.error || 'Failed to create restaurant');
            }
        } catch (error) {
            console.error('Error creating restaurant:', error);
            alert('Failed to create restaurant');
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="flex items-center justify-center space-x-3 mb-6">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                            <Building2 className="w-7 h-7 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-gray-900">MenuScan</span>
                    </div>
                    
                    <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                        Welcome back, {user.businessName}!
                    </h1>
                    <p className="text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto">
                        Manage your restaurants and create beautiful digital menus with QR codes.
                    </p>
                </div>

                {/* Create New Restaurant */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 mb-12">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                            <Plus className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Create New Restaurant</h2>
                            <p className="text-gray-600">Add a new restaurant to your portfolio</p>
                        </div>
                    </div>
                    
                    <form onSubmit={handleCreateRestaurant} className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Restaurant Name *
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    required
                                    value={newRestaurant.name}
                                    onChange={(e) => setNewRestaurant({ ...newRestaurant, name: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400"
                                    placeholder="Enter restaurant name"
                                />
                            </div>
                            <div>
                                <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Description
                                </label>
                                <input
                                    type="text"
                                    id="description"
                                    value={newRestaurant.description}
                                    onChange={(e) => setNewRestaurant({ ...newRestaurant, description: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400"
                                    placeholder="Brief description of your restaurant"
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={isCreating || !newRestaurant.name.trim()}
                            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-base font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
                        >
                            {isCreating ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                                    Creating Restaurant...
                                </>
                            ) : (
                                <>
                                    <Plus className="h-5 w-5 mr-2" />
                                    Create Restaurant
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Existing Restaurants */}
                {restaurants.length > 0 ? (
                    <div className="space-y-8">
                        <div className="text-center">
                            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                                Your Restaurants
                            </h2>
                            <p className="text-gray-600">
                                Manage {restaurants.length} restaurant{restaurants.length !== 1 ? 's' : ''}
                            </p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                            {restaurants.map((restaurant) => (
                                <div key={restaurant._id} className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                                    <div className="p-6">
                                        {/* Header */}
                                        <div className="flex items-start justify-between mb-6">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                                                    <Building2 className="h-6 w-6 text-white" />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                                        {restaurant.name}
                                                    </h3>
                                                    <p className="text-sm text-gray-500 font-mono">
                                                        {restaurant.slug}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                                restaurant.isActive 
                                                    ? 'text-green-700 bg-green-100 border border-green-200' 
                                                    : 'text-gray-600 bg-gray-100 border border-gray-200'
                                            }`}>
                                                {restaurant.isActive ? (
                                                    <>
                                                        <CheckCircle className="w-3 h-3 mr-1" />
                                                        Active
                                                    </>
                                                ) : (
                                                    <>
                                                        <AlertCircle className="w-3 h-3 mr-1" />
                                                        Inactive
                                                    </>
                                                )}
                                            </span>
                                        </div>

                                        {/* Description */}
                                        {restaurant.description && (
                                            <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                                                {restaurant.description}
                                            </p>
                                        )}

                                        {/* Restaurant Info */}
                                        <div className="space-y-2 mb-6">
                                            <div className="flex items-center text-sm text-gray-500">
                                                <Calendar className="h-4 w-4 mr-2" />
                                                Created {new Date(restaurant.createdAt).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </div>
                                            {restaurant.address && (
                                                <div className="flex items-center text-sm text-gray-500">
                                                    <MapPin className="h-4 w-4 mr-2" />
                                                    {restaurant.address}
                                                </div>
                                            )}
                                            {restaurant.phone && (
                                                <div className="flex items-center text-sm text-gray-500">
                                                    <Phone className="h-4 w-4 mr-2" />
                                                    {restaurant.phone}
                                                </div>
                                            )}
                                            {restaurant.email && (
                                                <div className="flex items-center text-sm text-gray-500">
                                                    <Mail className="h-4 w-4 mr-2" />
                                                    {restaurant.email}
                                                </div>
                                            )}
                                        </div>

                                        {/* Quick Actions */}
                                        <div className="grid grid-cols-2 gap-3 mb-6">
                                            <Link
                                                href={`/dashboard/${restaurant.slug}/menu`}
                                                className="flex items-center justify-center px-4 py-2 text-sm font-semibold text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-all duration-200 border border-blue-200 hover:border-blue-300"
                                            >
                                                <Utensils className="h-4 w-4 mr-2" />
                                                Menu Builder
                                            </Link>
                                            <Link
                                                href={`/dashboard/${restaurant.slug}/qr`}
                                                className="flex items-center justify-center px-4 py-2 text-sm font-semibold text-purple-600 bg-purple-50 rounded-xl hover:bg-purple-100 transition-all duration-200 border border-purple-200 hover:border-purple-300"
                                            >
                                                <QrCode className="h-4 w-4 mr-2" />
                                                QR Codes
                                            </Link>
                                        </div>

                                        {/* Stats Preview */}
                                        <div className="grid grid-cols-3 gap-3 mb-6">
                                            <div className="text-center p-3 bg-gray-50 rounded-xl">
                                                <div className="text-lg font-bold text-gray-900">0</div>
                                                <div className="text-xs text-gray-500">Categories</div>
                                            </div>
                                            <div className="text-center p-3 bg-gray-50 rounded-xl">
                                                <div className="text-lg font-bold text-gray-900">0</div>
                                                <div className="text-xs text-gray-500">Menu Items</div>
                                            </div>
                                            <div className="text-center p-3 bg-gray-50 rounded-xl">
                                                <div className="text-lg font-bold text-gray-900">0</div>
                                                <div className="text-xs text-gray-500">Orders</div>
                                            </div>
                                        </div>

                                        {/* Main Action */}
                                        <Link
                                            href={`/dashboard/${restaurant.slug}`}
                                            className="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-gray-900 to-gray-800 text-white text-sm font-semibold rounded-xl hover:from-gray-800 hover:to-gray-700 transition-all duration-200 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
                                        >
                                            <Sparkles className="h-4 w-4 mr-2" />
                                            Open Dashboard
                                            <ArrowRight className="h-4 w-4 ml-2" />
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-6">
                            <Building2 className="h-12 w-12 text-blue-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">No restaurants yet</h3>
                        <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
                            Get started by creating your first restaurant above. You'll be able to build menus, generate QR codes, and manage orders.
                        </p>
                        <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center">
                                <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                                Free setup
                            </div>
                            <div className="flex items-center">
                                <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                                No credit card required
                            </div>
                            <div className="flex items-center">
                                <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                                Instant access
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
} 