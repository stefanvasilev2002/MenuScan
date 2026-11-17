'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';

interface EmojiSelection {
    native: string;
}

const EmojiMartPicker = dynamic(
    async () => {
        const [{ default: Picker }, { default: data }] = await Promise.all([
            import('@emoji-mart/react'),
            import('@emoji-mart/data'),
        ]);
        function LoadedPicker({ onEmojiSelect }: { onEmojiSelect: (emoji: EmojiSelection) => void }) {
            return <Picker data={data} onEmojiSelect={onEmojiSelect} previewPosition="none" skinTonePosition="none" />;
        }
        return LoadedPicker;
    },
    {
        ssr: false,
        loading: () => <div className="p-4 text-sm text-gray-500 bg-white border rounded-lg shadow">Loading emojis…</div>,
    },
);

interface EmojiPickerProps {
    onEmojiSelect: (emoji: string) => void;
    currentEmoji: string;
}

export function EmojiPicker({ onEmojiSelect, currentEmoji }: EmojiPickerProps) {
    const [showPicker, setShowPicker] = useState(false);

    return (
        <div className="relative inline-block">
            <button
                type="button"
                onClick={() => setShowPicker((open) => !open)}
                aria-haspopup="dialog"
                aria-expanded={showPicker}
                aria-label="Choose an emoji icon"
                className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 text-sm text-gray-700"
            >
                <span className="text-2xl leading-none">{currentEmoji || '🍽️'}</span>
                More emojis
            </button>

            {showPicker && (
                <>
                    <div className="fixed inset-0 z-40" aria-hidden="true" onClick={() => setShowPicker(false)} />
                    <div role="dialog" aria-label="Emoji picker" className="absolute z-50 mt-2">
                        <EmojiMartPicker
                            onEmojiSelect={(emoji) => {
                                onEmojiSelect(emoji.native);
                                setShowPicker(false);
                            }}
                        />
                    </div>
                </>
            )}
        </div>
    );
}
