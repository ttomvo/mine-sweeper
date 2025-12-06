import React, { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Bomb, Clock, Settings, Trophy, Heart, Star } from 'lucide-react';
import Board from './components/Board';
import { createBoard, revealCell, checkWin, revealAllMines, toggleFlag, chordReveal, revealRandomSafeCell } from './utils/gameLogic';
import { playClick, playFlag, playExplosion, playWin } from './utils/sound';
import SettingsMenu from './components/SettingsMenu';
import DebugMenu from './components/DebugMenu';
import { LEVELS, STORAGE_KEYS, THEMES, DEFAULTS, WIN_MESSAGES } from './utils/config';
import pkg from '../package.json';

const WIN_ANIMATIONS = [
  'animate-happy',
  'animate-wiggle',
  'animate-pop',
  'animate-tada',
  'animate-float'
];

const AnimatedStat = ({ icon: Icon, value, colorClass, bgClass, iconColorClass }) => {
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    setAnimating(true);
    const timeout = setTimeout(() => setAnimating(false), 300);
    return () => clearTimeout(timeout);
  }, [value]);

  return (
    <div className={`flex items-center gap-2 px-3 py-1 rounded-md border transition-colors ${bgClass} ${animating ? 'animate-pop' : ''}`}>
      <Icon size={16} className={iconColorClass} />
      <span className={`font-mono text-xl font-bold ${colorClass}`}>{value}</span>
    </div>
  );
};

function App() {
  // Initialize state from localStorage or defaults
  const [config, setConfig] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CONFIG);
    if (saved) {
      // Check if saved value is a direct key in LEVELS (New Format)
      if (LEVELS[saved]) {
        return LEVELS[saved];
      }

      // Fallback for legacy JSON format
      try {
        const parsed = JSON.parse(saved);
        // Find matching level constant to preserve reference equality
        const matchedLevel = Object.values(LEVELS).find(
          level => level.rows === parsed.rows &&
            level.cols === parsed.cols &&
            level.mines === parsed.mines
        );
        return matchedLevel || parsed;
      } catch (e) {
        console.error("Failed to parse saved config", e);
      }
    }
    return DEFAULTS.LEVEL;
  });

  const [themePreference, setThemePreference] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.THEME) || DEFAULTS.THEME;
  });

  const [autoRevealCount, setAutoRevealCount] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AUTO_REVEAL);
    return saved ? parseInt(saved, 10) : DEFAULTS.AUTO_REVEAL_COUNT;
  });

  const [effectiveTheme, setEffectiveTheme] = useState(THEMES.DARK);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const updateTheme = () => {
      if (themePreference === THEMES.AUTO) {
        setEffectiveTheme(mediaQuery.matches ? THEMES.DARK : THEMES.LIGHT);
      } else {
        setEffectiveTheme(themePreference);
      }
    };

    updateTheme();
    mediaQuery.addEventListener('change', updateTheme);
    return () => mediaQuery.removeEventListener('change', updateTheme);
  }, [themePreference]);

  const [board, setBoard] = useState(() => {
    const newBoard = createBoard(config.rows, config.cols, config.mines);
    return revealRandomSafeCell(newBoard, autoRevealCount);
  });
  const [gameState, setGameState] = useState('idle'); // idle, playing, won, lost
  const [mineCount, setMineCount] = useState(config.mines);
  const [lives, setLives] = useState(config.lives || 1);
  const livesRef = useRef(config.lives || 1);
  const [timer, setTimer] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const debugClickCountRef = useRef(0);
  const [winMessage, setWinMessage] = useState('VICTORY!');
  const [winAnimation, setWinAnimation] = useState('animate-happy');
  const [stars, setStars] = useState(0);
  const [showGameOverModal, setShowGameOverModal] = useState(false);
  const [floatingHearts, setFloatingHearts] = useState([]);

  const timerRef = useRef(null);
  const boardRef = useRef(board);
  // Optimize timer access in callbacks without re-renders
  const timeElapsedRef = useRef(0);
  const isFirstRender = useRef(true);

  useEffect(() => {
    timeElapsedRef.current = timer;
  }, [timer]);

  // Persist settings
  useEffect(() => {
    // Find the key for the current config to save as string
    const levelKey = Object.keys(LEVELS).find(key => LEVELS[key] === config);

    if (levelKey) {
      localStorage.setItem(STORAGE_KEYS.CONFIG, levelKey);
    } else {
      // Fallback for custom configs (if any in future)
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
    }

    localStorage.setItem(STORAGE_KEYS.THEME, themePreference);
    localStorage.setItem(STORAGE_KEYS.AUTO_REVEAL, autoRevealCount);
  }, [config, themePreference, autoRevealCount]);

  // Update board ref whenever board changes
  useEffect(() => {
    boardRef.current = board;
  }, [board]);

  const addFloatingHeart = useCallback((x, y) => {
    const id = Date.now() + Math.random();
    setFloatingHearts(prev => [...prev, { id, x, y }]);
    setTimeout(() => {
      setFloatingHearts(prev => prev.filter(h => h.id !== id));
    }, 1000);
  }, []);

  // Initialize game
  const initGame = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    let newBoard = createBoard(config.rows, config.cols, config.mines);
    newBoard = revealRandomSafeCell(newBoard, autoRevealCount);
    setBoard(newBoard);
    boardRef.current = newBoard;
    setGameState('idle');
    setMineCount(config.mines);
    setLives(config.lives || 1);
    livesRef.current = config.lives || 1;
    setTimer(0);
    setShowGameOverModal(false);
    setFloatingHearts([]);
  }, [config, autoRevealCount]);

  // Reset game when config changes
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    initGame();
  }, [config, initGame]);

  // Timer logic
  useEffect(() => {
    if (gameState === 'playing') {
      timerRef.current = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [gameState]);

  // Keyboard support for restarting
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((gameState === 'won' || gameState === 'lost') && e.key === 'Enter') {
        initGame();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, initGame]);

  const handleCellClick = useCallback((x, y) => {
    if (gameState === 'won' || gameState === 'lost') return;

    if (gameState === 'idle') {
      setGameState('playing');
    }

    const currentBoard = boardRef.current;
    const cell = currentBoard[x][y];

    if (cell.isRevealed) {
      const { board: newBoard, hitMine, minesHitCount } = chordReveal(currentBoard, x, y);
      if (newBoard !== currentBoard) {
        setBoard([...newBoard]);
        if (hitMine) {
          playExplosion();
          // Decrease mine count by the number of mines hit
          setMineCount(prev => prev - (minesHitCount || 1));

          if (livesRef.current > 1) {
            livesRef.current -= (minesHitCount || 1);
            // Ensure lives don't go below 0 if multiple mines hit
            if (livesRef.current < 0) livesRef.current = 0;
            setLives(livesRef.current);
            addFloatingHeart(x, y);

            if (livesRef.current === 0) {
              setGameState('lost');
              setShowGameOverModal(true);
              setBoard(revealAllMines(newBoard));
            }
            // Otherwise continue
          } else {
            livesRef.current = 0;
            setLives(0);
            setGameState('lost');
            setShowGameOverModal(true);
            setBoard(revealAllMines(newBoard));
          }
        } else {
          playClick();
          if (checkWin(newBoard)) {
            playWin();
            setGameState('won');
            setShowGameOverModal(true);
            setWinMessage(WIN_MESSAGES[Math.floor(Math.random() * WIN_MESSAGES.length)]);
            setWinAnimation(WIN_ANIMATIONS[Math.floor(Math.random() * WIN_ANIMATIONS.length)]);

            // Calculate Stars
            let earnedStars = 1;
            const currentTime = timeElapsedRef.current;

            // Use config-specific thresholds or defaults if custom
            const threeStarTime = config.threeStarTime || 9999;
            const twoStarTime = config.twoStarTime || 9999;

            if (currentTime <= threeStarTime && livesRef.current === (config.lives || 1)) {
              earnedStars = 3;
            } else if (currentTime <= twoStarTime) {
              earnedStars = 2;
            }
            setStars(earnedStars);

            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 }
            });
          }
        }
      }
      return;
    }

    playFlag();
    const newBoard = toggleFlag(currentBoard, x, y);
    setBoard([...newBoard]);
    setMineCount(prev => cell.isFlagged ? prev + 1 : prev - 1);
  }, [gameState, addFloatingHeart, config]);

  const handleCellContextMenu = useCallback((e, x, y) => {
    e.preventDefault();
    if (gameState === 'won' || gameState === 'lost') return;

    if (gameState === 'idle') {
      setGameState('playing');
    }

    const currentBoard = boardRef.current;
    const cell = currentBoard[x][y];

    if (cell.isFlagged || cell.isRevealed) return;

    // Normal reveal
    const { board: newBoard, hitMine } = revealCell(currentBoard, x, y);
    setBoard([...newBoard]);

    if (hitMine) {
      playExplosion();
      // Decrease mine count for single reveal
      setMineCount(prev => prev - 1);

      if (livesRef.current > 1) {
        livesRef.current -= 1;
        setLives(livesRef.current);
        addFloatingHeart(x, y);
        // Game continues
      } else {
        livesRef.current = 0;
        setLives(0);
        setGameState('lost');
        setShowGameOverModal(true);
        setBoard(revealAllMines(newBoard));
      }
    } else {
      playClick();
      if (checkWin(newBoard)) {
        playWin();
        setGameState('won');
        setShowGameOverModal(true);
        setWinMessage(WIN_MESSAGES[Math.floor(Math.random() * WIN_MESSAGES.length)]);
        setWinAnimation(WIN_ANIMATIONS[Math.floor(Math.random() * WIN_ANIMATIONS.length)]);

        // Calculate Stars
        let earnedStars = 1;
        const currentTime = timeElapsedRef.current;

        const threeStarTime = config.threeStarTime || 9999;
        const twoStarTime = config.twoStarTime || 9999;

        if (currentTime <= threeStarTime && livesRef.current === (config.lives || 1)) {
          earnedStars = 3;
        } else if (currentTime <= twoStarTime) {
          earnedStars = 2;
        }
        setStars(earnedStars);

        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    }
  }, [gameState, addFloatingHeart, config]);

  const handleTitleClick = () => {
    debugClickCountRef.current += 1;
    if (debugClickCountRef.current >= 5) {
      setShowDebug(true);
      debugClickCountRef.current = 0;
    }
  };

  const handleForceWin = () => {
    if (gameState === 'won' || gameState === 'lost') return;

    playWin();
    setGameState('won');
    setShowGameOverModal(true);
    setWinMessage(WIN_MESSAGES[Math.floor(Math.random() * WIN_MESSAGES.length)]);
    setWinAnimation(WIN_ANIMATIONS[Math.floor(Math.random() * WIN_ANIMATIONS.length)]);
    setStars(3); // Force win gets 3 stars
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  // Idle detection
  const [isIdle, setIsIdle] = useState(false);

  useEffect(() => {
    let timeoutId;
    const resetTimer = () => {
      setIsIdle(false);
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => setIsIdle(true), 60000); // 1 minute
    };

    const events = ['mousemove', 'mousedown', 'keypress', 'touchmove', 'scroll'];
    events.forEach(event => window.addEventListener(event, resetTimer));

    resetTimer(); // Start timer

    return () => {
      clearTimeout(timeoutId);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, []);

  return (
    <div
      className={`h-screen w-full flex flex-col overflow-hidden font-sans transition-colors duration-300 ${effectiveTheme === THEMES.DARK
        ? 'bg-gradient-to-br from-gray-900 to-gray-800 text-white'
        : 'bg-gradient-to-br from-blue-50 to-white text-gray-900'
        }`}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Settings Menu */}
      <SettingsMenu
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        currentLevel={config}
        levels={LEVELS}
        onLevelSelect={(newConfig) => {
          setConfig(newConfig);
          // Game will auto-reset via useEffect when config changes
        }}
        theme={effectiveTheme}
        selectedTheme={themePreference}
        onThemeChange={setThemePreference}
        autoRevealCount={autoRevealCount}
        onAutoRevealChange={setAutoRevealCount}
      />

      {/* Debug Menu */}
      <DebugMenu
        isOpen={showDebug}
        onClose={() => setShowDebug(false)}
        theme={effectiveTheme}
        onForceWin={handleForceWin}
        version={pkg.version}
        config={config}
        gameState={gameState}
        mineCount={mineCount}
        timer={timer}
      />

      {/* Header */}
      <div className={`w-full flex items-center justify-between p-4 shrink-0 z-10 backdrop-blur-sm border-b relative transition-colors ${effectiveTheme === THEMES.DARK
        ? 'bg-gray-900/95 border-gray-800'
        : 'bg-white/80 border-gray-200'
        }`}>

        {/* Left: Stats (Mines, Lives, Timer) */}
        <div className="flex items-center gap-4 z-20">
          <AnimatedStat
            icon={Bomb}
            value={mineCount}
            colorClass={effectiveTheme === THEMES.DARK ? 'text-red-100' : 'text-red-600'}
            bgClass={effectiveTheme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'}
            iconColorClass="text-red-500"
          />

          <AnimatedStat
            icon={Heart}
            value={lives}
            colorClass={effectiveTheme === THEMES.DARK ? 'text-pink-100' : 'text-pink-600'}
            bgClass={effectiveTheme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'}
            iconColorClass="text-pink-500"
          />

          <div className={`flex items-center gap-2 px-3 py-1 rounded-md border transition-colors ${effectiveTheme === THEMES.DARK
            ? 'bg-gray-900 border-gray-700'
            : 'bg-gray-50 border-gray-200'
            }`}>
            <Clock size={16} className="text-cyan-500" />
            <span className={`font-mono text-xl font-bold ${effectiveTheme === THEMES.DARK ? 'text-cyan-100' : 'text-cyan-700'
              }`}>{String(timer).padStart(3, '0')}</span>
          </div>
        </div>

        {/* Center: Title */}
        <h1
          onClick={handleTitleClick}
          className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl font-extrabold tracking-tight select-none cursor-pointer ${effectiveTheme === THEMES.DARK ? 'text-white' : 'text-gray-900'
            }`}>
          Mine Sweeper
        </h1>

        {/* Right: Controls (Reset, Settings) */}
        <div className="flex gap-2 z-20">
          <button
            onClick={initGame}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${(gameState === 'won' || gameState === 'lost') && !showGameOverModal
              ? 'bg-blue-600 hover:bg-blue-500 text-white animate-pulse ring-2 ring-offset-2 ring-blue-500 shadow-lg scale-105'
              : effectiveTheme === THEMES.DARK
                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
              }`}
            title="Start New Game"
          >
            New Game
          </button>

          <button
            onClick={() => setShowSettings(true)}
            className={`p-2 rounded-full transition-colors ${effectiveTheme === THEMES.DARK
              ? 'bg-gray-800 hover:bg-gray-700 text-gray-200'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            title="Settings"
          >
            <Settings size={20} />
          </button>
        </div>
      </div>

      {/* Game Board Container */}
      <div className="flex-1 relative overflow-hidden">
        <div className="w-full h-full overflow-auto flex items-start justify-center p-4 pt-12">
          <div className={`relative group ${isIdle ? 'idle-mode' : ''} ${(gameState === 'won' || gameState === 'lost') ? 'pointer-events-none' : ''}`}>
            <Board
              board={board}
              onCellClick={handleCellClick}
              onCellContextMenu={handleCellContextMenu}
              theme={effectiveTheme}
              floatingHearts={floatingHearts}
            />
          </div>
        </div>

        {/* Game Over / Win Overlay */}
        {(gameState === 'won' || gameState === 'lost') && showGameOverModal && (
          <div className="absolute inset-0 flex items-start justify-center z-50 bg-black/50 animate-in fade-in duration-200 backdrop-blur-sm pt-24">
            <div className={`p-10 rounded-3xl shadow-2xl text-center border-4 min-w-[320px] transition-colors ${effectiveTheme === THEMES.DARK
              ? 'bg-gray-800 text-white border-gray-700'
              : 'bg-white text-black border-gray-200'
              }`}>
              <div className="flex items-center justify-center gap-4 mb-4">
                <h2 className={`text-4xl font-black ${gameState === 'won'
                  ? `text-yellow-500 ${winAnimation}`
                  : effectiveTheme === THEMES.DARK ? 'text-white' : 'text-gray-800'
                  }`}>
                  {gameState === 'won' ? winMessage : 'GAME OVER'}
                </h2>
                {gameState === 'won' && (
                  <Trophy size={48} className={`text-yellow-500 ${winAnimation}`} />
                )}
              </div>
              <p className={`font-medium mb-4 ${effectiveTheme === THEMES.DARK ? 'text-gray-300' : 'text-gray-600'
                }`}>
                {gameState === 'won' ? `Time: ${timer}s` : 'Better luck next time!'}
              </p>

              {gameState === 'won' && (
                <div className="flex justify-center gap-2 mb-6">
                  {[1, 2, 3].map((star) => (
                    <Star
                      key={star}
                      size={40}
                      className={`transition-all duration-500 transform ${star <= stars
                        ? 'text-yellow-400 fill-yellow-400 scale-110 drop-shadow-lg animate-pop'
                        : effectiveTheme === THEMES.DARK ? 'text-gray-600' : 'text-gray-300'
                        }`}
                      style={{ animationDelay: `${star * 200}ms` }}
                    />
                  ))}
                </div>
              )}

              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => setShowGameOverModal(false)}
                  className={`px-6 py-2 rounded-full font-bold transition-all hover:scale-105 active:scale-95 shadow-lg ${effectiveTheme === THEMES.DARK
                    ? 'bg-gray-700 text-white hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    }`}
                >
                  View Board
                </button>
                <button
                  onClick={initGame}
                  className={`px-6 py-2 rounded-full font-bold transition-all hover:scale-105 active:scale-95 shadow-lg ${effectiveTheme === THEMES.DARK
                    ? 'bg-white text-gray-900 hover:bg-gray-100'
                    : 'bg-black text-white hover:bg-gray-800'
                    }`}
                >
                  Play Again
                </button>
              </div>
            </div>
          </div>
        )}
      </div>


    </div>
  );
}

export default App;
