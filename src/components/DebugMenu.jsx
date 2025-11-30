import React from 'react';
import { X, Trophy } from 'lucide-react';
import { THEMES } from '../utils/config';

const DebugMenu = ({
    isOpen,
    onClose,
    theme,
    onForceWin
}) => {
    if (!isOpen) return null;

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className={`w-full max-w-sm p-6 rounded-2xl shadow-2xl border ${theme === THEMES.DARK ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-red-500 font-mono">DEBUG MENU</h2>
                    <button
                        onClick={onClose}
                        className={`p-2 rounded-full transition-colors ${theme === THEMES.DARK ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => {
                            onForceWin();
                            onClose();
                        }}
                        className="flex items-center justify-between p-4 rounded-xl bg-yellow-500 hover:bg-yellow-600 text-white transition-all shadow-lg hover:scale-[1.02]"
                    >
                        <div className="flex items-center gap-3">
                            <Trophy size={20} />
                            <span className="font-bold">Force Win</span>
                        </div>
                    </button>
                </div>

            </div>
        </div>
    );
};

export default DebugMenu;
