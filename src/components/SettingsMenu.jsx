import React from 'react';
import { X, Moon, Sun, Check } from 'lucide-react';
import { THEMES } from '../utils/constants';

const SettingsMenu = ({
    isOpen,
    onClose,
    currentLevel,
    levels,
    onLevelSelect,
    theme,
    onThemeToggle
}) => {
    if (!isOpen) return null;

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className={`w-full max-w-md p-6 rounded-2xl shadow-2xl border ${theme === THEMES.DARK ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">Settings</h2>
                    <button
                        onClick={onClose}
                        className={`p-2 rounded-full transition-colors ${theme === THEMES.DARK ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Difficulty Section */}
                <div className="mb-8">
                    <h3 className={`text-sm font-semibold uppercase tracking-wider mb-3 ${theme === THEMES.DARK ? 'text-gray-400' : 'text-gray-500'}`}>
                        Difficulty
                    </h3>
                    <div className="flex flex-col gap-2">
                        {Object.keys(levels).map((level) => (
                            <button
                                key={level}
                                onClick={() => {
                                    onLevelSelect(levels[level]);
                                    onClose();
                                }}
                                className={`flex items-center justify-between p-4 rounded-xl transition-all ${currentLevel === levels[level]
                                    ? 'bg-blue-600 text-white shadow-lg scale-[1.02]'
                                    : theme === THEMES.DARK
                                        ? 'bg-gray-800 hover:bg-gray-700 text-gray-200'
                                        : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                                    }`}
                            >
                                <span className="font-bold">{level}</span>
                                {currentLevel === levels[level] && <Check size={20} />}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Theme Section */}
                <div>
                    <h3 className={`text-sm font-semibold uppercase tracking-wider mb-3 ${theme === THEMES.DARK ? 'text-gray-400' : 'text-gray-500'}`}>
                        Appearance
                    </h3>
                    <button
                        onClick={onThemeToggle}
                        className={`w-full flex items-center justify-between p-4 rounded-xl transition-colors ${theme === THEMES.DARK
                            ? 'bg-gray-800 hover:bg-gray-700 text-gray-200'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            {theme === THEMES.DARK ? <Moon size={20} /> : <Sun size={20} />}
                            <span className="font-medium">
                                {theme === THEMES.DARK ? 'Dark Mode' : 'Light Mode'}
                            </span>
                        </div>
                        <div className={`w-12 h-6 rounded-full p-1 transition-colors ${theme === THEMES.DARK ? 'bg-blue-600' : 'bg-gray-300'}`}>
                            <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${theme === THEMES.DARK ? 'translate-x-6' : 'translate-x-0'}`} />
                        </div>
                    </button>
                </div>

            </div>
        </div>
    );
};

export default SettingsMenu;
