'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
    Plus, 
    Building2, 
    Calendar, 
    ArrowRight,
    Settings,
    Utensils,
    ShoppingCart,
    BarChart3
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
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">My Restaurants</h1>
                    <p className="mt-2 text-gray-600">
                        Welcome back, {user.businessName}! Manage your restaurants and menus.
                    </p>
                </div>

                {/* Create New Restaurant */}
                <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New Restaurant</h2>
                    <form onSubmit={handleCreateRestaurant} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                    Restaurant Name *
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    required
                                    value={newRestaurant.name}
                                    onChange={(e) => setNewRestaurant({ ...newRestaurant, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter restaurant name"
                                />
                            </div>
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <input
                                    type="text"
                                    id="description"
                                    value={newRestaurant.description}
                                    onChange={(e) => setNewRestaurant({ ...newRestaurant, description: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Brief description of your restaurant"
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={isCreating || !newRestaurant.name.trim()}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isCreating ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create Restaurant
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Existing Restaurants */}
                {restaurants.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {restaurants.map((restaurant) => (
                            <div key={restaurant._id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center">
                                            <div className="p-2 bg-blue-100 rounded-lg">
                                                <Building2 className="h-6 w-6 text-blue-600" />
                                            </div>
                                            <div className="ml-3">
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    {restaurant.name}
                                                </h3>
                                                <p className="text-sm text-gray-500">
                                                    {restaurant.slug}
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                            restaurant.isActive 
                                                ? 'text-green-600 bg-green-100' 
                                                : 'text-gray-600 bg-gray-100'
                                        }`}>
                                            {restaurant.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>

                                    {restaurant.description && (
                                        <p className="text-gray-600 text-sm mb-4">
                                            {restaurant.description}
                                        </p>
                                    )}

                                    <div className="flex items-center text-sm text-gray-500 mb-4">
                                        <Calendar className="h-4 w-4 mr-1" />
                                        Created {new Date(restaurant.createdAt).toLocaleDateString()}
                                    </div>

                                    {/* Quick Actions */}
                                    <div className="grid grid-cols-2 gap-2 mb-4">
                                        <Link
                                            href={`/dashboard/${restaurant.slug}/menu`}
                                            className="flex items-center justify-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                                        >
                                            <Utensils className="h-4 w-4 mr-1" />
                                            Menu
                                        </Link>
                                        <Link
                                            href={`/dashboard/${restaurant.slug}/orders`}
                                            className="flex items-center justify-center px-3 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-md hover:bg-green-100 transition-colors"
                                        >
                                            <ShoppingCart className="h-4 w-4 mr-1" />
                                            Orders
                                        </Link>
                                    </div>

                                    {/* Main Action */}
                                    <Link
                                        href={`/dashboard/${restaurant.slug}`}
                                        className="w-full flex items-center justify-center px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors"
                                    >
                                        Open Dashboard
                                        <ArrowRight className="h-4 w-4 ml-2" />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <Building2 className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No restaurants yet</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Get started by creating your first restaurant above.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
} 