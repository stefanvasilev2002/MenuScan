import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import React from "react";

const inter = Inter({ 
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-inter'
})

export const metadata: Metadata = {
    title: {
        default: 'MenuScan - Digital Menu Management System',
        template: '%s | MenuScan'
    },
    description: 'Create beautiful digital menus with QR codes. Perfect for restaurants, cafes, and food businesses. Manage your menu, track orders, and grow your business.',
    keywords: ['digital menu', 'QR code menu', 'restaurant menu', 'menu management', 'food business'],
    authors: [{ name: 'MenuScan Team' }],
    creator: 'MenuScan',
    publisher: 'MenuScan',
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    metadataBase: new URL('https://menuscan.com'),
    openGraph: {
        type: 'website',
        locale: 'en_US',
        url: 'https://menuscan.com',
        title: 'MenuScan - Digital Menu Management System',
        description: 'Create beautiful digital menus with QR codes. Perfect for restaurants, cafes, and food businesses.',
        siteName: 'MenuScan',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'MenuScan - Digital Menu Management System',
        description: 'Create beautiful digital menus with QR codes. Perfect for restaurants, cafes, and food businesses.',
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    verification: {
        google: 'your-google-verification-code',
    },
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" className={inter.variable}>
            <head>
                <link rel="icon" href="/favicon.ico" />
                <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
                <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
                <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
                <link rel="manifest" href="/site.webmanifest" />
                <meta name="theme-color" content="#3B82F6" />
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
            </head>
            <body className={`${inter.className} antialiased bg-gray-50 text-gray-900`}>
                <div id="root">
                    {children}
                </div>
            </body>
        </html>
    )
}