import React from 'react';

type TooltipProps = {
  id: string;
  place?: 'top' | 'bottom' | 'left' | 'right';
  effect?: string;
};

export const Tooltip: React.FC<TooltipProps> = ({ id, place, effect }) => {
  return (
    <div 
      id={id} 
      className="absolute hidden group-hover:block z-50 bg-gray-800 text-white text-xs rounded py-1 px-2"
      style={{ 
        top: place === 'bottom' ? '100%' : place === 'top' ? 'auto' : '50%',
        bottom: place === 'top' ? '100%' : 'auto',
        left: place === 'right' ? '100%' : place === 'left' ? 'auto' : '50%',
        right: place === 'left' ? '100%' : 'auto',
        transform: (place === 'top' || place === 'bottom') ? 'translateX(-50%)' : 
                   (place === 'left' || place === 'right') ? 'translateY(-50%)' : 'translate(-50%, -50%)',
        marginTop: place === 'bottom' ? '5px' : '0',
        marginBottom: place === 'top' ? '5px' : '0',
        marginLeft: place === 'right' ? '5px' : '0',
        marginRight: place === 'left' ? '5px' : '0',
        opacity: effect === 'solid' ? '1' : '0.9'
      }}
    />
  );
}; 