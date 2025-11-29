export const LEVELS = {
    BEGINNER: { rows: 9, cols: 9, mines: 10 },
    INTERMEDIATE: { rows: 16, cols: 16, mines: 40 },
    EXPERT: { rows: 16, cols: 30, mines: 99 },
};

export const THEMES = {
    DARK: 'dark',
    LIGHT: 'light',
    AUTO: 'auto',
};

export const STORAGE_KEYS = {
    CONFIG: 'minesweeper_config',
    THEME: 'minesweeper_theme',
    AUTO_REVEAL: 'minesweeper_auto_reveal',
};

export const DEFAULTS = {
    LEVEL: LEVELS.INTERMEDIATE,
    THEME: THEMES.AUTO,
    AUTO_REVEAL_COUNT: 1,
};
