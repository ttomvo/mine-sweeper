import React from 'react';
import { Flag, Bomb } from 'lucide-react';

const Cell = React.memo(({ x, y, cell, onClick, onContextMenu, theme }) => {
    const { isRevealed, isFlagged, isMine, neighborMines } = cell;

    const getCellContent = () => {
        if (isFlagged) return <Flag size={16} className="text-red-500 fill-red-500" />;
        if (isRevealed && isMine) return <Bomb size={18} className="text-white fill-white" />;
        if (isRevealed && neighborMines > 0) return <span className={`font-bold text-lg ${getNumberColor(neighborMines)}`}>{neighborMines}</span>;
        return null;
    };

    const getNumberColor = (num) => {
        const colors = theme === 'dark' ? {
            1: 'text-blue-400',
            2: 'text-green-400',
            3: 'text-red-400',
            4: 'text-purple-400',
            5: 'text-yellow-400',
            6: 'text-pink-400',
            7: 'text-teal-400',
            8: 'text-gray-400'
        } : {
            1: 'text-blue-600',
            2: 'text-green-600',
            3: 'text-red-600',
            4: 'text-purple-600',
            5: 'text-yellow-600',
            6: 'text-pink-600',
            7: 'text-teal-600',
            8: 'text-gray-600'
        };
        return colors[num] || (theme === 'dark' ? 'text-gray-700' : 'text-gray-400');
    };

    const baseClasses = `w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center border rounded-md select-none cursor-pointer transition-colors ${theme === 'dark'
            ? 'border-gray-600'
            : 'border-gray-300'
        }`;

    const revealedClasses = isRevealed
        ? (isMine
            ? "bg-red-500 border-red-500"
            : (theme === 'dark' ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"))
        : (theme === 'dark'
            ? "bg-gray-700 hover:bg-gray-600"
            : "bg-gray-200 hover:bg-gray-300");

    return (
        <div
            className={`${baseClasses} ${revealedClasses}`}
            onClick={() => onClick(x, y)}
            onContextMenu={(e) => onContextMenu(e, x, y)}
        >
            {getCellContent()}
        </div>
    );
}, (prevProps, nextProps) => {
    return (
        prevProps.cell.isRevealed === nextProps.cell.isRevealed &&
        prevProps.cell.isFlagged === nextProps.cell.isFlagged &&
        prevProps.cell.isMine === nextProps.cell.isMine &&
        prevProps.cell.neighborMines === nextProps.cell.neighborMines &&
        prevProps.theme === nextProps.theme
    );
});

export default Cell;
