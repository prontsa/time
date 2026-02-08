
import React, { useState, useEffect } from 'react';
import { WidgetSize, ClockFont } from '../types.js';
import { Trash2, Heart, Settings, GripVertical } from 'lucide-react';

const Widget = ({ widget, onDelete, onToggleFavorite, onEdit, isDraggable }) => {
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

  const bgStyle = widget.style.backgroundImage 
    ? { 
        backgroundImage: `url(${widget.style.backgroundImage})`, 
        backgroundSize: `${widget.style.bgScale || 100}%`, 
        backgroundPosition: `${widget.style.bgPosX || 50}% ${widget.style.bgPosY || 50}%`,
        backgroundRepeat: 'no-repeat'
      }
    : {};

  return React.createElement('div', {
    className: `relative group rounded-3xl p-4 sm:p-6 flex flex-col justify-between transition-all duration-300 shadow-xl overflow-hidden ${widget.style.backgroundColor} ${widget.style.textColor} ${isDraggable ? 'w-full h-32 sm:h-40' : sizeClasses[widget.size]} ${widget.style.borderWidth ? 'border' : ''}`,
    style: { ...bgStyle, borderColor: 'rgba(255,255,255,0.1)' }
  }, [
    widget.style.backgroundImage && React.createElement('div', { key: 'overlay', className: "absolute inset-0 bg-black/30 pointer-events-none" }),
    isDraggable && React.createElement('div', { key: 'drag', className: "absolute left-2 top-1/2 -translate-y-1/2 opacity-30 group-hover:opacity-100 transition-opacity z-20" }, React.createElement(GripVertical, { size: 20 })),
    React.createElement('div', { key: 'top', className: `flex justify-between items-start z-10 ${isDraggable ? 'pl-6' : ''}` }, [
      React.createElement('div', { key: 'info' }, [
        React.createElement('h3', { className: "text-[10px] font-bold uppercase tracking-widest opacity-80 drop-shadow-sm" }, widget.label),
        React.createElement('p', { className: "text-xs sm:text-sm font-semibold drop-shadow-sm" }, widget.locationName)
      ]),
      (onToggleFavorite || onEdit || onDelete) && React.createElement('div', { key: 'actions', className: "flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" }, [
        onToggleFavorite && React.createElement('button', { key: 'fav', onClick: () => onToggleFavorite(widget.id), className: `p-1.5 rounded-full hover:bg-black/20 transition-colors ${widget.isFavorite ? 'text-red-400' : ''}` }, React.createElement(Heart, { size: 14, fill: widget.isFavorite ? 'currentColor' : 'none' })),
        onEdit && React.createElement('button', { key: 'edit', onClick: () => onEdit(widget), className: "p-1.5 rounded-full hover:bg-black/20 transition-colors" }, React.createElement(Settings, { size: 14 })),
        onDelete && React.createElement('button', { key: 'del', onClick: () => onDelete(widget.id), className: "p-1.5 rounded-full hover:bg-red-500/20 hover:text-red-400 transition-colors" }, React.createElement(Trash2, { size: 14 }))
      ])
    ]),
    React.createElement('div', { key: 'bottom', className: `z-10 mt-auto ${isDraggable ? 'pl-6' : ''}` }, [
      React.createElement('div', { key: 'time', className: `flex items-baseline gap-1.5 ${fontClass}` }, [
        React.createElement('span', { className: "text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tighter drop-shadow-md" }, timeStr),
        React.createElement('span', { className: "text-xs sm:text-base font-bold opacity-90 drop-shadow-sm uppercase" }, period)
      ]),
      React.createElement('p', { key: 'date', className: "text-[10px] sm:text-xs mt-0.5 opacity-80 font-bold drop-shadow-sm" }, dateStr)
    ]),
    !widget.style.backgroundImage && React.createElement('div', { key: 'glow', className: "absolute -bottom-10 -right-10 w-32 h-32 rounded-full bg-white/10 blur-2xl pointer-events-none" })
  ]);
};

export default Widget;
