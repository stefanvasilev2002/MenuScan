'use client';

import { ChevronDown, ChevronUp } from 'lucide-react';
import type { MoveDirection } from '@/lib/reorder';

interface Props {
    name: string;
    canMoveUp: boolean;
    canMoveDown: boolean;
    onMove: (direction: MoveDirection) => void;
}

export default function MoveButtons({ name, canMoveUp, canMoveDown, onMove }: Props) {
    const base = 'p-1 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400';
    return (
        <div className="flex flex-col">
            <button
                type="button"
                className={base}
                disabled={!canMoveUp}
                aria-label={`Move ${name} up`}
                onClick={(e) => {
                    e.stopPropagation();
                    onMove('up');
                }}
            >
                <ChevronUp className="w-4 h-4" />
            </button>
            <button
                type="button"
                className={base}
                disabled={!canMoveDown}
                aria-label={`Move ${name} down`}
                onClick={(e) => {
                    e.stopPropagation();
                    onMove('down');
                }}
            >
                <ChevronDown className="w-4 h-4" />
            </button>
        </div>
    );
}
