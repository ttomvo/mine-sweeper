import React, { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Bomb, Clock, RefreshCw, Settings } from 'lucide-react';
import Board from './components/Board';
import { createBoard, revealCell, checkWin, revealAllMines, toggleFlag, chordReveal } from './utils/gameLogic';
import { playClick, playFlag, playExplosion, playWin } from './utils/sound';
import SettingsMenu from './components/SettingsMenu';
import { LEVELS, STORAGE_KEYS, THEMES, DEFAULTS } from './utils/config';

function App() {
  // Initialize state from localStorage or defaults
  const [config, setConfig] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CONFIG);
    return saved ? JSON.parse(saved) : DEFAULTS.LEVEL;
  });

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.THEME) || DEFAULTS.THEME;
  });

  const [board, setBoard] = useState(() => createBoard(config.rows, config.cols, config.mines));
  const [gameState, setGameState] = useState('idle'); // idle, playing, won, lost
  const [mineCount, setMineCount] = useState(config.mines);
  const [timer, setTimer] = useState(0);
  const [showSettings, setShowSettings] = useState(false);

  const timerRef = useRef(null);
  const boardRef = useRef(board);
  const isFirstRender = useRef(true);

  // Persist settings
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  }, [config, theme]);

  // Update board ref whenever board changes
  useEffect(() => {
    boardRef.current = board;
  }, [board]);

  // Initialize game
  const initGame = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    const newBoard = createBoard(config.rows, config.cols, config.mines);
    setBoard(newBoard);
    boardRef.current = newBoard;
    setGameState('playing');
    setMineCount(config.mines);
    setTimer(0);
  }, [config]);

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

  const handleCellClick = useCallback((x, y) => {
    if (gameState === 'won' || gameState === 'lost') return;

    const currentBoard = boardRef.current;
    const cell = currentBoard[x][y];

    if (cell.isFlagged) return;

    if (cell.isRevealed) {
      const { board: newBoard, hitMine } = chordReveal(currentBoard, x, y);
      if (newBoard !== currentBoard) {
        setBoard([...newBoard]);
        if (hitMine) {
          playExplosion();
          setGameState('lost');
          revealAllMines(newBoard);
        } else {
          playClick();
          if (checkWin(newBoard)) {
            playWin();
            setGameState('won');
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

    // Normal reveal
    const { board: newBoard, hitMine } = revealCell(currentBoard, x, y);
    setBoard([...newBoard]);

    if (hitMine) {
      playExplosion();
      setGameState('lost');
      revealAllMines(newBoard);
    } else {
      playClick();
      if (checkWin(newBoard)) {
        playWin();
        setGameState('won');
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    }
  }, [gameState]);

  const handleCellContextMenu = useCallback((e, x, y) => {
    e.preventDefault();
    if (gameState === 'won' || gameState === 'lost') return;

    const currentBoard = boardRef.current;
    const cell = currentBoard[x][y];

    if (cell.isRevealed) return;

    playFlag();
    const newBoard = toggleFlag(currentBoard, x, y);
    setBoard([...newBoard]);
    setMineCount(prev => cell.isFlagged ? prev + 1 : prev - 1);
  }, [gameState]);

  return (
    <div
      className={`h-screen w-full flex flex-col overflow-hidden font-sans transition-colors duration-300 ${theme === THEMES.DARK
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
        theme={theme}
        onThemeToggle={() => setTheme(t => t === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK)}
      />

      {/* Header */}
      <div className={`w-full flex items-center justify-between p-4 shrink-0 z-10 backdrop-blur-sm border-b relative transition-colors ${theme === THEMES.DARK
        ? 'bg-gray-900/95 border-gray-800'
        : 'bg-white/80 border-gray-200'
        }`}>

        {/* Left: Settings Button */}
        <div className="flex gap-2 z-20">
          <button
            onClick={() => setShowSettings(true)}
            className={`p-2 rounded-full transition-colors ${theme === THEMES.DARK
              ? 'bg-gray-800 hover:bg-gray-700 text-gray-200'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            title="Settings"
          >
            <Settings size={20} />
          </button>
        </div>

        {/* Center: Title */}
        <h1 className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl font-extrabold tracking-tight select-none pointer-events-none ${theme === THEMES.DARK ? 'text-white' : 'text-gray-900'
          }`}>
          MIMESWEEPER
        </h1>

        {/* Right: Stats & Reset */}
        <div className="flex items-center gap-4 z-20">
          <div className={`flex items-center gap-2 px-3 py-1 rounded-md border transition-colors ${theme === 'dark'
            ? 'bg-gray-900 border-gray-700'
            : 'bg-gray-50 border-gray-200'
            }`}>
            <Bomb size={16} className="text-red-500" />
            <span className={`font-mono text-xl font-bold ${theme === THEMES.DARK ? 'text-red-100' : 'text-red-600'
              }`}>{mineCount}</span>
          </div>

          <button
            onClick={initGame}
            className={`p-2 rounded-full transition-colors ${theme === THEMES.DARK
              ? 'bg-gray-700 hover:bg-gray-600 text-white'
              : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
              }`}
            title="Reset Game"
          >
            <RefreshCw size={20} />
          </button>

          <div className={`flex items-center gap-2 px-3 py-1 rounded-md border transition-colors ${theme === THEMES.DARK
            ? 'bg-gray-900 border-gray-700'
            : 'bg-gray-50 border-gray-200'
            }`}>
            <Clock size={16} className="text-cyan-500" />
            <span className={`font-mono text-xl font-bold ${theme === THEMES.DARK ? 'text-cyan-100' : 'text-cyan-700'
              }`}>{String(timer).padStart(3, '0')}</span>
          </div>
        </div>
      </div>

      {/* Game Board Container */}
      <div className="flex-1 flex items-center justify-center overflow-auto p-4 relative">
        <div className="relative group">
          <Board
            board={board}
            onCellClick={handleCellClick}
            onCellContextMenu={handleCellContextMenu}
            theme={theme}
          />

          {/* Game Over / Win Overlay */}
          {(gameState === 'won' || gameState === 'lost') && (
            <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/50 rounded-xl animate-in fade-in duration-200">
              <div className="bg-white text-black p-6 rounded-2xl shadow-xl text-center border-4 border-gray-200">
                <h2 className={`text-3xl font-black mb-2 ${gameState === 'won' ? 'text-yellow-600' : 'text-gray-800'}`}>
                  {gameState === 'won' ? 'VICTORY!' : 'GAME OVER'}
                </h2>
                <p className="text-gray-600 font-medium mb-4">
                  {gameState === 'won' ? `Time: ${timer}s` : 'Better luck next time!'}
                </p>
                <button
                  onClick={initGame}
                  className="px-6 py-2 bg-black text-white rounded-full font-bold hover:bg-gray-800 transition-transform hover:scale-105 active:scale-95 shadow-lg"
                >
                  Play Again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className={`p-4 shrink-0 text-center border-t transition-colors ${theme === THEMES.DARK
        ? 'bg-gray-900 border-gray-800 text-gray-500'
        : 'bg-white/80 border-gray-200 text-gray-400'
        }`}>
        <div className="text-xs">
          Left click to reveal • Right click to flag • Avoid the mines
        </div>
      </div>
    </div>
  );
}

export default App;
