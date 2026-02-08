
import React, { useState, useRef } from 'react';
import { WidgetSize, ClockFont } from '../types.js';
import { THEME_PRESETS } from '../constants.js';
import { findLocationData } from '../services/geminiService.js';
import { Search, Loader2, X, Check, Image as ImageIcon, Upload, Move } from 'lucide-react';

const WidgetEditor = ({ widget, onSave, onClose }) => {
  const [query, setQuery] = useState(widget?.locationName || '');
  const [label, setLabel] = useState(widget?.label || '');
  const [isSearching, setIsSearching] = useState(false);
  const [timezone, setTimezone] = useState(widget?.timezone || '');
  const [selectedSize, setSelectedSize] = useState(widget?.size || WidgetSize.MEDIUM);
  const [style, setStyle] = useState(widget?.style || {
    ...THEME_PRESETS[0].style,
    bgPosX: 50,
    bgPosY: 50,
    bgScale: 100
  });
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setIsSearching(true);
    setError('');
    const data = await findLocationData(query);
    if (data) {
      setTimezone(data.timezone);
      setQuery(`${data.cityName}, ${data.country}`);
      if (!label) setLabel(data.cityName);
    } else {
      setError('Could not find location. Please try another search.');
    }
    setIsSearching(false);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setStyle({ 
          ...style, 
          backgroundImage: reader.result,
          bgPosX: 50,
          bgPosY: 50,
          bgScale: 100
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!timezone) {
      setError('Please search and select a location first.');
      return;
    }
    onSave({
      id: widget?.id || Math.random().toString(36).substr(2, 9),
      label: label || 'My Clock',
      locationName: query,
      timezone,
      size: selectedSize,
      style,
      isFavorite: widget?.isFavorite || false,
    });
  };

  const updateStyle = (key, value) => {
    setStyle(prev => ({ ...prev, [key]: value }));
  };

  // Plain JS Render using JSX-like React components from imports works if served correctly, 
  // but to be safe for pure static we'll use createElement or ensure the server supports it.
  // Actually, browsers DON'T support JSX natively. I must use React.createElement.
  return React.createElement('div', { className: "fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4" },
    React.createElement('div', { className: "bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden" }, [
      React.createElement('div', { key: 'header', className: "p-6 border-b border-slate-800 flex justify-between items-center" }, [
        React.createElement('div', { className: "flex items-center gap-3" }, [
          React.createElement('div', { className: "bg-indigo-600/20 p-2 rounded-xl" }, React.createElement(ImageIcon, { size: 20, className: "text-indigo-400" })),
          React.createElement('h2', { className: "text-xl font-bold" }, widget ? 'Customize Widget' : 'Design New Widget')
        ]),
        React.createElement('button', { onClick: onClose, className: "p-2 hover:bg-slate-800 rounded-full text-slate-400" }, React.createElement(X, { size: 20 }))
      ]),
      React.createElement('div', { key: 'body', className: "p-6 space-y-8 max-h-[75vh] overflow-y-auto no-scrollbar" }, [
        React.createElement('section', { className: "space-y-3" }, [
          React.createElement('label', { className: "text-sm font-bold text-slate-400 uppercase tracking-wider" }, "Target Location"),
          React.createElement('div', { className: "relative" }, [
            React.createElement('input', {
              type: "text",
              value: query,
              onChange: (e) => setQuery(e.target.value),
              placeholder: "Where in the world?",
              className: "w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-5 py-4 pr-14 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium",
              onKeyDown: (e) => e.key === 'Enter' && handleSearch()
            }),
            React.createElement('button', {
              onClick: handleSearch,
              disabled: isSearching,
              className: "absolute right-2 top-2 p-2.5 bg-indigo-600 text-white rounded-xl"
            }, isSearching ? React.createElement(Loader2, { className: "animate-spin", size: 24 }) : React.createElement(Search, { size: 24 }))
          ]),
          error && React.createElement('p', { className: "text-red-400 text-xs font-medium" }, error),
          timezone && React.createElement('p', { className: "text-emerald-400 text-xs font-bold" }, `Timezone: ${timezone}`)
        ]),
        React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 gap-6" }, [
          React.createElement('section', { className: "space-y-3" }, [
            React.createElement('label', { className: "text-sm font-bold text-slate-400 uppercase" }, "Identify As"),
            React.createElement('input', {
              value: label,
              onChange: (e) => setLabel(e.target.value),
              className: "w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-5 py-4"
            })
          ]),
          React.createElement('section', { className: "space-y-3" }, [
            React.createElement('label', { className: "text-sm font-bold text-slate-400 uppercase" }, "Layout Style"),
            React.createElement('select', {
              value: selectedSize,
              onChange: (e) => setSelectedSize(e.target.value),
              className: "w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-5 py-4 appearance-none"
            }, [
              React.createElement('option', { value: WidgetSize.SMALL }, "Compact (1x1)"),
              React.createElement('option', { value: WidgetSize.MEDIUM }, "Standard (1x1 Tall)"),
              React.createElement('option', { value: WidgetSize.WIDE }, "Wide (2x1)")
            ])
          ])
        ]),
        React.createElement('div', { className: "p-6 border-t border-slate-800 flex gap-4" }, [
          React.createElement('button', { onClick: onClose, className: "flex-1 px-6 py-4 rounded-2xl border border-slate-700 font-bold" }, "Discard"),
          React.createElement('button', { onClick: handleSave, className: "flex-1 px-6 py-4 rounded-2xl bg-indigo-600 font-bold text-white shadow-xl" }, widget ? 'Apply Changes' : 'Create Widget')
        ])
      ])
    ])
  );
};

export default WidgetEditor;
