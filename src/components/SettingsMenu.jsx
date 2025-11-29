import React from 'react';
import { X, Moon, Sun, Check, Monitor } from 'lucide-react';
import { THEMES } from '../utils/config';

const SettingsMenu = ({
    isOpen,
    onClose,
    currentLevel,
    levels,
    onLevelSelect,
    theme,
    selectedTheme,
    onThemeChange,
    autoRevealCount,
    onAutoRevealChange
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
                    <div className="flex flex-col gap-3">
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

                {/* Auto Reveal Section */}
                <div className="mb-8">
                    <h3 className={`text-sm font-semibold uppercase tracking-wider mb-3 ${theme === THEMES.DARK ? 'text-gray-400' : 'text-gray-500'}`}>
                        Auto Reveal Safe Cells
                    </h3>
                    <div className="grid grid-cols-4 gap-3">
                        {[0, 1, 2, 3].map((count) => (
                            <button
                                key={count}
                                onClick={() => onAutoRevealChange(count)}
                                className={`p-4 rounded-xl transition-all font-bold ${autoRevealCount === count
                                    ? 'bg-blue-600 text-white shadow-lg scale-[1.05]'
                                    : theme === THEMES.DARK
                                        ? 'bg-gray-800 hover:bg-gray-700 text-gray-200'
                                        : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                                    }`}
                            >
                                {count}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Theme Section */}
                <div>
                    <h3 className={`text-sm font-semibold uppercase tracking-wider mb-3 ${theme === THEMES.DARK ? 'text-gray-400' : 'text-gray-500'}`}>
                        Appearance
                    </h3>
                    <div className="flex flex-col gap-3">
                        {[
                            { value: THEMES.LIGHT, label: 'Light', icon: Sun },
                            { value: THEMES.DARK, label: 'Dark', icon: Moon },
                            { value: THEMES.AUTO, label: 'Auto', icon: Monitor },
                        ].map((option) => (
                            <button
                                key={option.value}
                                onClick={() => onThemeChange(option.value)}
                                className={`flex items-center justify-between p-4 rounded-xl transition-all ${selectedTheme === option.value
                                    ? 'bg-blue-600 text-white shadow-lg scale-[1.02]'
                                    : theme === THEMES.DARK
                                        ? 'bg-gray-800 hover:bg-gray-700 text-gray-200'
                                        : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <option.icon size={20} />
                                    <span className="font-medium">{option.label}</span>
                                </div>
                                {selectedTheme === option.value && <Check size={20} />}
                            </button>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default SettingsMenu;
