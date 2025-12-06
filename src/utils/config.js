export const LEVELS = {
    BEGINNER: {
        rows: 9,
        cols: 9,
        mines: 10,
        lives: 1,
        threeStarTime: 60,
        twoStarTime: 180
    },
    INTERMEDIATE: {
        rows: 15,
        cols: 20,
        mines: 40,
        lives: 2,
        threeStarTime: 300,
        twoStarTime: 600
    },
    EXPERT: {
        rows: 16,
        cols: 30, mines: 99,
        lives: 3,
        threeStarTime: 600,
        twoStarTime: 1000
    },
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
    AUTO_REVEAL_COUNT: 2,
};

export const WIN_MESSAGES = [
    "VICTORY!",
    "YOU'RE A LEGEND!",
    "MINES SWEPT!",
    "PURE GENIUS!",
    "UNSTOPPABLE!",
    "MASTERPIECE!",
    "CLEAN SWEEP!",
    "LIKE A BOSS!",
    "SPECTACULAR!",
    "MINDBLOWING!"
];
