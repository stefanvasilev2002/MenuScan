'use client';

import { QRCodeSVG } from 'qrcode.react';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

interface Menu {
    _id: string;
    name: string;
}

export default function QRCodePage() {
    const params = useParams();
    const menuId = params.id;

    const [menuUrl, setMenuUrl] = useState('');
    const [downloaded, setDownloaded] = useState(false);
    const [menu, setMenu] = useState<Menu | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchMenu = async () => {
            try {
                const response = await fetch(`/api/menus/${menuId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch menu');
                }
                const data = await response.json();
                setMenu(data);
            } catch (err) {
                setError('Failed to load menu details');
            } finally {
                setLoading(false);
            }
        };

        if (menuId) {
            fetchMenu();
            // Get the current hostname and set the menu URL
            const hostname = window.location.origin;
            setMenuUrl(`${hostname}/menu/${menuId}`);
        }
    }, [menuId]);

    const downloadQRCode = () => {
        const svg = document.getElementById("QRCode");
        if (svg) {
            const svgData = new XMLSerializer().serializeToString(svg);
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            const img = new Image();
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx?.drawImage(img, 0, 0);
                const pngFile = canvas.toDataURL("image/png");
                const downloadLink = document.createElement("a");
                downloadLink.download = `menu-qr-${menu?.name || 'menu'}.png`;
                downloadLink.href = pngFile;
                downloadLink.click();
                setDownloaded(true);
                setTimeout(() => setDownloaded(false), 2000);
            };
            img.src = "data:image/svg+xml;base64," + btoa(svgData);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[200px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg">
                {error}
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-8">QR Код за {menu?.name}</h1>

            <div className="grid gap-8 md:grid-cols-2">
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex justify-center mb-6">
                        <QRCodeSVG
                            id="QRCode"
                            value={menuUrl}
                            size={200}
                            level="H"
                            includeMargin={true}
                            className="border p-2 rounded-lg"
                        />
                    </div>

                    <div className="text-center space-y-4">
                        <div className="text-gray-600 mb-4">
                            Скенирајте го QR кодот за да го видите менито
                        </div>

                        <button
                            onClick={downloadQRCode}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg w-full transition-colors"
                        >
                            {downloaded ? '✓ Преземено' : 'Преземи QR Код'}
                        </button>

                        <div className="mt-4 text-sm text-gray-500 break-all">
                            URL: <a href={menuUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{menuUrl}</a>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-xl font-semibold mb-6">Како да го користите QR кодот:</h2>
                    <ul className="space-y-4 text-gray-600">
                        <li className="flex items-start">
                            <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full mr-3 mt-0.5">1</span>
                            <div>
                                <p className="font-medium">Преземете го QR кодот</p>
                                <p className="text-sm text-gray-500 mt-1">Кликнете на копчето "Преземи QR Код" за да го зачувате на вашиот уред</p>
                            </div>
                        </li>
                        <li className="flex items-start">
                            <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full mr-3 mt-0.5">2</span>
                            <div>
                                <p className="font-medium">Испечатете го и поставете го</p>
                                <p className="text-sm text-gray-500 mt-1">Поставете го на видливо место во вашиот ресторан или кафе</p>
                            </div>
                        </li>
                        <li className="flex items-start">
                            <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full mr-3 mt-0.5">3</span>
                            <div>
                                <p className="font-medium">Лесен пристап за гостите</p>
                                <p className="text-sm text-gray-500 mt-1">Гостите можат едноставно да го скенираат со камерата на нивниот телефон</p>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}