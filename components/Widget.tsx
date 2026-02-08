
import React, { useState, useEffect } from 'react';
import { Widget as WidgetType, WidgetSize, ClockFont } from '../types.ts';
import { Trash2, Heart, Settings, GripVertical } from 'lucide-react';
import { motion } from 'framer-motion';

interface WidgetProps {
  widget: WidgetType;
  onDelete?: (id: string) => void;
  onToggleFavorite?: (id: string) => void;
  onEdit?: (widget: WidgetType) => void;
  isDraggable?: boolean;
}

const Widget: React.FC<WidgetProps> = ({ widget, onDelete, onToggleFavorite, onEdit, isDraggable }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: widget.timezone,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const dateFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: widget.timezone,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const formattedParts = formatter.formatToParts(time);
  const timeStr = formattedParts.filter(p => ['hour', 'minute', 'second'].includes(p.type)).map(p => p.value).join(':').replace(/:$/, '');
  const period = formattedParts.find(p => p.type === 'dayPeriod')?.value || '';
  const dateStr = dateFormatter.format(time);

  const fontClass = widget.style.font === ClockFont.MONO ? 'font-mono' : widget.style.font === ClockFont.SERIF ? 'font-serif' : 'font-sans';

  const sizeClasses = {
    [WidgetSize.SMALL]: 'col-span-1 h-32 sm:h-40',
    [WidgetSize.MEDIUM]: 'col-span-1 h-44 sm:h-52',
    [WidgetSize.WIDE]: 'col-span-2 h-32 sm:h-40',
  };

  const bgStyle: React.CSSProperties = widget.style.backgroundImage 
    ? { 
        backgroundImage: `url(${widget.style.backgroundImage})`, 
        backgroundSize: `${widget.style.bgScale || 100}%`, 
        backgroundPosition: `${widget.style.bgPosX || 50}% ${widget.style.bgPosY || 50}%`,
        backgroundRepeat: 'no-repeat'
      }
    : {};

  return (
    <div 
      className={`relative group rounded-3xl p-4 sm:p-6 flex flex-col justify-between transition-all duration-300 shadow-xl overflow-hidden ${widget.style.backgroundColor} ${widget.style.textColor} ${isDraggable ? 'w-full h-32 sm:h-40' : sizeClasses[widget.size]} ${widget.style.borderWidth ? 'border' : ''}`}
      style={{ ...bgStyle, borderColor: 'rgba(255,255,255,0.1)' }}
    >
      {/* Dark Overlay for Image Legibility */}
      {widget.style.backgroundImage && (
        <div className="absolute inset-0 bg-black/30 pointer-events-none"></div>
      )}

      {/* Drag Handle for Reorder mode */}
      {isDraggable && (
        <div className="absolute left-2 top-1/2 -translate-y-1/2 opacity-30 group-hover:opacity-100 transition-opacity z-20">
          <GripVertical size={20} />
        </div>
      )}

      <div className={`flex justify-between items-start z-10 ${isDraggable ? 'pl-6' : ''}`}>
        <div>
          <h3 className="text-[10px] font-bold uppercase tracking-widest opacity-80 drop-shadow-sm">{widget.label}</h3>
          <p className="text-xs sm:text-sm font-semibold drop-shadow-sm">{widget.locationName}</p>
        </div>
        {(onToggleFavorite || onEdit || onDelete) && (
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {onToggleFavorite && (
              <button onClick={() => onToggleFavorite(widget.id)} className={`p-1.5 rounded-full hover:bg-black/20 transition-colors ${widget.isFavorite ? 'text-red-400' : ''}`}>
                <Heart size={14} fill={widget.isFavorite ? 'currentColor' : 'none'} />
              </button>
            )}
            {onEdit && (
              <button onClick={() => onEdit(widget)} className="p-1.5 rounded-full hover:bg-black/20 transition-colors">
                <Settings size={14} />
              </button>
            )}
            {onDelete && (
              <button onClick={() => onDelete(widget.id)} className="p-1.5 rounded-full hover:bg-red-500/20 hover:text-red-400 transition-colors">
                <Trash2 size={14} />
              </button>
            )}
          </div>
        )}
      </div>

      <div className={`z-10 mt-auto ${isDraggable ? 'pl-6' : ''}`}>
        <div className={`flex items-baseline gap-1.5 ${fontClass}`}>
          <span className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tighter drop-shadow-md">{timeStr}</span>
          <span className="text-xs sm:text-base font-bold opacity-90 drop-shadow-sm uppercase">{period}</span>
        </div>
        <p className="text-[10px] sm:text-xs mt-0.5 opacity-80 font-bold drop-shadow-sm">{dateStr}</p>
      </div>

      {/* Subtle Glow Effect */}
      {!widget.style.backgroundImage && (
        <div className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full bg-white/10 blur-2xl pointer-events-none"></div>
      )}
    </div>
  );
};

export default Widget;
