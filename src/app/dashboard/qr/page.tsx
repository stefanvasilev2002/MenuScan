'use client';

import { QRCodeSVG } from 'qrcode.react';
import { useState, useEffect } from 'react';

export default function QRCodePage() {
    const [menuUrl, setMenuUrl] = useState('');
    const [downloaded, setDownloaded] = useState(false);

    useEffect(() => {
        // Get the current hostname
        const hostname = window.location.origin;
        setMenuUrl(`${hostname}/menu`);
    }, []);

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
                downloadLink.download = "menu-qr.png";
                downloadLink.href = pngFile;
                downloadLink.click();
                setDownloaded(true);
                setTimeout(() => setDownloaded(false), 2000);
            };
            img.src = "data:image/svg+xml;base64," + btoa(svgData);
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-8">QR Код</h1>

            <div className="bg-white rounded-lg shadow-sm max-w-md p-6">
                <div className="flex justify-center mb-6">
                    <QRCodeSVG
                        id="QRCode"
                        value={menuUrl}
                        size={200}
                        level="H"
                        includeMargin={true}
                    />
                </div>

                <div className="text-center space-y-4">
                    <div className="text-gray-600 mb-4">
                        Скенирајте го QR кодот за да го видите менито
                    </div>

                    <button
                        onClick={downloadQRCode}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg w-full"
                    >
                        {downloaded ? '✓ Преземено' : 'Преземи QR Код'}
                    </button>

                    <div className="mt-4 text-sm text-gray-500">
                        URL: <a href={menuUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{menuUrl}</a>
                    </div>
                </div>
            </div>

            <div className="mt-8 bg-white rounded-lg shadow-sm max-w-md p-6">
                <h2 className="font-semibold mb-4">Како да го користите QR кодот:</h2>
                <ul className="space-y-2 text-gray-600">
                    <li className="flex items-center">
                        <span className="mr-2">1.</span>
                        Преземете го QR кодот
                    </li>
                    <li className="flex items-center">
                        <span className="mr-2">2.</span>
                        Испечатете го и поставете го на видливо место
                    </li>
                    <li className="flex items-center">
                        <span className="mr-2">3.</span>
                        Гостите можат да го скенираат со камерата на телефонот
                    </li>
                </ul>
            </div>
        </div>
    );
}