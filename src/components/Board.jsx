import React from 'react';
import Cell from './Cell';

const Board = React.memo(({ board, onCellClick, onCellContextMenu, theme }) => {
    return (
        <div className={`flex flex-col gap-1 p-4 rounded-xl border transition-colors ${theme === 'dark'
                ? 'bg-gray-800 border-gray-700'
                : 'bg-white border-gray-200 shadow-sm'
            }`}>
            {board.map((row, rowIndex) => (
                <div key={rowIndex} className="flex gap-1">
                    {row.map((cell, colIndex) => (
                        <Cell
                            key={`${rowIndex}-${colIndex}`}
                            x={rowIndex}
                            y={colIndex}
                            cell={cell}
                            onClick={onCellClick}
                            onContextMenu={onCellContextMenu}
                            theme={theme}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
});

export default Board;
