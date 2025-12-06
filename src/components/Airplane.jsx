import React from 'react';
import { Plane } from 'lucide-react';

const Airplane = ({ y, duration, delay, direction = 'right', size = 16, opacity = 1, onComplete }) => {
    const style = {
        top: `${y}%`,
        animationDuration: `${duration}s`,
        animationDelay: `${delay}s`,
        opacity: opacity,
    };

    return (
        <div
            className={`absolute z-50 pointer-events-none transform text-gray-700 ${direction === 'right' ? 'animate-fly-right -left-20' : 'animate-fly-left -right-20'
                }`}
            style={style}
            onAnimationEnd={onComplete}
        >
            <div className="animate-fly-bob">
                {/* Icon points NE by default. Rotate 45 to point Right. Rotate -135 to point Left. */}
                <div className={`transform transition-transform ${direction === 'right' ? 'rotate-45' : '-rotate-[135deg]'}`}>
                    <Plane size={size} fill="currentColor" />
                </div>
            </div>
        </div>
    );
};

export default Airplane;
