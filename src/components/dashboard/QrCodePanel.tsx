'use client';

import { useRef, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Check, Copy, Download, ExternalLink } from 'lucide-react';

interface Props {
    restaurantName: string;
    menuUrl: string;
    slug: string;
}

export default function QrCodePanel({ restaurantName, menuUrl, slug }: Props) {
    const canvasWrapper = useRef<HTMLDivElement>(null);
    const [copied, setCopied] = useState(false);

    const handleDownload = () => {
        const canvas = canvasWrapper.current?.querySelector('canvas');
        if (!canvas) {
            return;
        }
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = `${slug}-menu-qr.png`;
        link.click();
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(menuUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            setCopied(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <h1 className="text-2xl font-bold text-gray-900">QR Code</h1>
                <p className="mt-1 text-sm text-gray-500">
                    Print this code on tables, flyers or the window. Guests scan it to open the menu of {restaurantName}.
                </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6 flex flex-col md:flex-row gap-8 items-center">
                <div ref={canvasWrapper} className="p-4 bg-white border rounded-xl">
                    <QRCodeCanvas
                        value={menuUrl}
                        size={256}
                        marginSize={2}
                        level="M"
                        title={`QR code for ${restaurantName} menu`}
                    />
                </div>

                <div className="flex-1 w-full space-y-4">
                    <div>
                        <label htmlFor="menu-url" className="block text-sm font-medium text-gray-700 mb-1">
                            Public menu link
                        </label>
                        <div className="flex gap-2">
                            <input
                                id="menu-url"
                                readOnly
                                value={menuUrl}
                                className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
                            />
                            <button
                                type="button"
                                onClick={handleCopy}
                                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                                {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                                {copied ? 'Copied' : 'Copy'}
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <button
                            type="button"
                            onClick={handleDownload}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                        >
                            <Download className="w-4 h-4" />
                            Download PNG
                        </button>
                        <a
                            href={menuUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                            <ExternalLink className="w-4 h-4" />
                            Open menu
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
