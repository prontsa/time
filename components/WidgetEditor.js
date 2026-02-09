
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
    bgScale: 100,
    imageOpacity: 100
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
          bgScale: 100,
          imageOpacity: 100
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

  return React.createElement('div', { 
    className: "fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4",
    onClick: (e) => e.target === e.currentTarget && onClose()
  },
    React.createElement('div', { className: "bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" }, [
      // Header
      React.createElement('div', { key: 'header', className: "p-6 border-b border-slate-800 flex justify-between items-center shrink-0" }, [
        React.createElement('div', { className: "flex items-center gap-3" }, [
          React.createElement('div', { className: "bg-indigo-600/20 p-2 rounded-xl" }, React.createElement(ImageIcon, { size: 20, className: "text-indigo-400" })),
          React.createElement('h2', { className: "text-xl font-bold" }, widget ? 'Customize Widget' : 'Design New Widget')
        ]),
        React.createElement('button', { onClick: onClose, className: "p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-colors" }, React.createElement(X, { size: 20 }))
      ]),

      // Scrollable Content
      React.createElement('div', { key: 'body', className: "p-6 space-y-8 overflow-y-auto no-scrollbar" }, [
        
        // Section: Location
        React.createElement('section', { key: 'loc', className: "space-y-3" }, [
          React.createElement('label', { className: "text-sm font-bold text-slate-400 uppercase tracking-wider" }, "Target Location"),
          React.createElement('div', { className: "relative" }, [
            React.createElement('input', {
              type: "text",
              value: query,
              onChange: (e) => setQuery(e.target.value),
              placeholder: "Where in the world?",
              className: "w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-5 py-4 pr-14 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-white transition-all",
              onKeyDown: (e) => e.key === 'Enter' && handleSearch()
            }),
            React.createElement('button', {
              onClick: handleSearch,
              disabled: isSearching,
              className: "absolute right-2 top-2 p-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-colors disabled:opacity-50"
            }, isSearching ? React.createElement(Loader2, { className: "animate-spin", size: 24 }) : React.createElement(Search, { size: 24 }))
          ]),
          error && React.createElement('p', { className: "text-red-400 text-xs font-medium px-2" }, error),
          timezone && React.createElement('p', { className: "text-emerald-400 text-xs font-bold flex items-center gap-1 px-2" }, [
            React.createElement(Check, { size: 14, key: 'check' }), 
            `Timezone: ${timezone}`
          ])
        ]),

        // Section: Label & Layout
        React.createElement('div', { key: 'basic-config', className: "grid grid-cols-1 md:grid-cols-2 gap-6" }, [
          React.createElement('section', { className: "space-y-3" }, [
            React.createElement('label', { className: "text-sm font-bold text-slate-400 uppercase tracking-wider" }, "Identify As"),
            React.createElement('input', {
              value: label,
              onChange: (e) => setLabel(e.target.value),
              placeholder: "e.g. Home, HQ, Mom",
              className: "w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-white"
            })
          ]),
          React.createElement('section', { className: "space-y-3" }, [
            React.createElement('label', { className: "text-sm font-bold text-slate-400 uppercase tracking-wider" }, "Layout Style"),
            React.createElement('select', {
              value: selectedSize,
              onChange: (e) => setSelectedSize(e.target.value),
              className: "w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-5 py-4 appearance-none text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            }, [
              React.createElement('option', { key: 's', value: WidgetSize.SMALL }, "Compact (1x1)"),
              React.createElement('option', { key: 'm', value: WidgetSize.MEDIUM }, "Standard (1x1 Tall)"),
              React.createElement('option', { key: 'w', value: WidgetSize.WIDE }, "Wide (2x1)")
            ])
          ])
        ]),

        // Section: Aesthetic & Decoration
        React.createElement('section', { key: 'aesthetic', className: "space-y-4" }, [
          React.createElement('div', { className: "flex justify-between items-center" }, [
            React.createElement('label', { className: "text-sm font-bold text-slate-400 uppercase tracking-wider" }, "Aesthetic & Decoration"),
            React.createElement('button', { 
              onClick: () => fileInputRef.current?.click(),
              className: "text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 transition-colors"
            }, [React.createElement(Upload, { size: 14, key: 'up' }), "Custom Background"]),
            React.createElement('input', { 
              type: "file", 
              ref: fileInputRef, 
              onChange: handleImageUpload, 
              className: "hidden", 
              accept: "image/*",
              key: 'file-input'
            })
          ]),
          
          style.backgroundImage && React.createElement('div', { className: "space-y-6 bg-slate-800/30 p-4 rounded-3xl border border-slate-700/50" }, [
            React.createElement('div', { className: "flex flex-col md:flex-row gap-6 items-center" }, [
              // Cropping Preview
              React.createElement('div', { 
                className: `relative overflow-hidden rounded-2xl border-2 border-indigo-500/50 shadow-2xl shrink-0 ${style.backgroundColor} ${selectedSize === WidgetSize.WIDE ? 'w-48 h-24' : 'w-32 h-32'}`,
              }, [
                React.createElement('div', {
                  key: 'bg-prev',
                  className: "absolute inset-0",
                  style: {
                    backgroundImage: `url(${style.backgroundImage})`,
                    backgroundSize: `${style.bgScale}%`,
                    backgroundPosition: `${style.bgPosX}% ${style.bgPosY}%`,
                    backgroundRepeat: 'no-repeat',
                    opacity: (style.imageOpacity ?? 100) / 100
                  }
                }),
                React.createElement('div', { key: 'move-icon', className: "absolute inset-0 flex items-center justify-center pointer-events-none" }, React.createElement(Move, { className: "text-white/20", size: 32 }))
              ]),

              // Adjustment Sliders
              React.createElement('div', { className: "flex-1 w-full space-y-4" }, [
                [['Zoom', 'bgScale', 100, 300], ['Opacity', 'imageOpacity', 0, 100], ['H-Pos', 'bgPosX', 0, 100], ['V-Pos', 'bgPosY', 0, 100]].map(([lbl, key, min, max]) => 
                  React.createElement('div', { key: key, className: "space-y-1" }, [
                    React.createElement('div', { className: "flex justify-between text-[10px] font-black uppercase text-slate-500" }, [
                      React.createElement('span', null, lbl),
                      React.createElement('span', null, `${style[key]}%`)
                    ]),
                    React.createElement('input', { 
                      type: "range", min, max, 
                      value: style[key], 
                      onChange: (e) => updateStyle(key, parseInt(e.target.value)),
                      className: "w-full accent-indigo-500 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                    })
                  ])
                )
              ])
            ]),
            React.createElement('button', { 
              onClick: () => updateStyle('backgroundImage', undefined),
              className: "w-full py-2 bg-red-500/10 text-red-400 text-xs font-bold rounded-xl hover:bg-red-500/20 transition-all"
            }, "Remove Image")
          ]),

          // Theme Presets Grid
          React.createElement('div', { className: "grid grid-cols-5 gap-3" }, 
            THEME_PRESETS.map((preset) => 
              React.createElement('button', {
                key: preset.name,
                onClick: () => setStyle({ ...style, ...preset.style, backgroundImage: style.backgroundImage }),
                className: `relative h-12 rounded-xl transition-all ${preset.style.backgroundColor} ${style.backgroundColor === preset.style.backgroundColor && !style.backgroundImage ? 'ring-2 ring-indigo-500 ring-offset-4 ring-offset-slate-900' : 'hover:opacity-80'}`
              }, style.backgroundColor === preset.style.backgroundColor && !style.backgroundImage && React.createElement('div', { className: "absolute inset-0 flex items-center justify-center" }, React.createElement(Check, { size: 20, className: preset.style.textColor })))
            )
          )
        ]),

        // Section: Typography
        React.createElement('section', { key: 'typography', className: "space-y-3" }, [
          React.createElement('label', { className: "text-sm font-bold text-slate-400 uppercase tracking-wider" }, "Typography"),
          React.createElement('div', { className: "flex gap-3" }, 
            Object.values(ClockFont).map((f) => 
              React.createElement('button', {
                key: f,
                onClick: () => updateStyle('font', f),
                className: `flex-1 py-3 px-4 rounded-xl border-2 transition-all ${style.font === f ? 'border-indigo-500 bg-indigo-500/10 text-white' : 'border-slate-800 hover:bg-slate-800 text-slate-400'}`
              }, React.createElement('span', { className: `text-base font-bold ${f === ClockFont.MONO ? 'font-mono' : f === ClockFont.SERIF ? 'font-serif' : 'font-sans'}` }, f.charAt(0).toUpperCase() + f.slice(1)))
            )
          )
        ])
      ]),

      // Footer
      React.createElement('div', { key: 'footer', className: "p-6 bg-slate-900 border-t border-slate-800 flex gap-4 shrink-0" }, [
        React.createElement('button', { onClick: onClose, className: "flex-1 px-6 py-4 rounded-2xl border border-slate-700 font-bold hover:bg-slate-800 text-slate-300 transition-colors" }, "Discard"),
        React.createElement('button', { onClick: handleSave, className: "flex-1 px-6 py-4 rounded-2xl bg-indigo-600 font-bold text-white hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/30" }, widget ? 'Apply Changes' : 'Create Widget')
      ])
    ])
  );
};

export default WidgetEditor;
