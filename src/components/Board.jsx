import React from 'react';
import Cell from './Cell';

const Board = ({ board, onCellClick, onCellContextMenu, theme, floatingHearts = [] }) => {
    return (
        <div
            className="grid gap-1 select-none p-4 rounded-lg shadow-2xl bg-opacity-20 backdrop-blur-md border border-opacity-30"
            style={{
                gridTemplateColumns: `repeat(${board[0].length}, minmax(0, 1fr))`,
                backgroundColor: theme === 'dark' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)',
                borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
            }}
        >
            {board.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                    <Cell
                        key={`${rowIndex}-${colIndex}`}
                        x={rowIndex}
                        y={colIndex}
                        cell={cell}
                        onClick={onCellClick}
                        onContextMenu={onCellContextMenu}
                        theme={theme}
                        hasFloatingHeart={floatingHearts.some(h => h.x === rowIndex && h.y === colIndex)}
                    />
                ))
            )}
        </div>
    );
};

export default Board;
