import React, { useState } from 'react';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

interface EmojiPickerProps {
    onEmojiSelect: (emoji: string) => void;
    currentEmoji: string;
}

export const EmojiPicker = ({ onEmojiSelect, currentEmoji }: EmojiPickerProps) => {
    const [showPicker, setShowPicker] = useState(false);

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setShowPicker(!showPicker)}
                className="w-full p-2 border rounded-lg text-2xl min-h-[42px] text-left"
            >
                {currentEmoji || '📋'}
            </button>

            {showPicker && (
                <div className="absolute z-50 mt-1">
                    <div
                        className="fixed inset-0"
                        onClick={() => setShowPicker(false)}
                    />
                    <Picker
                        data={data}
                        onEmojiSelect={(emoji: any) => {
                            onEmojiSelect(emoji.native);
                            setShowPicker(false);
                        }}
                    />
                </div>
            )}
        </div>
    );
};