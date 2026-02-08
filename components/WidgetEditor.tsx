
import React, { useState, useRef } from 'react';
import { Widget, WidgetSize, ClockFont, WidgetStyle } from '../types.ts';
import { THEME_PRESETS } from '../constants.tsx';
import { findLocationData } from '../services/geminiService.ts';
import { Search, Loader2, X, Check, Image as ImageIcon, Upload, Move } from 'lucide-react';

interface WidgetEditorProps {
  widget?: Widget;
  onSave: (widget: Widget) => void;
  onClose: () => void;
}

const WidgetEditor: React.FC<WidgetEditorProps> = ({ widget, onSave, onClose }) => {
  const [query, setQuery] = useState(widget?.locationName || '');
  const [label, setLabel] = useState(widget?.label || '');
  const [isSearching, setIsSearching] = useState(false);
  const [timezone, setTimezone] = useState(widget?.timezone || '');
  const [selectedSize, setSelectedSize] = useState<WidgetSize>(widget?.size as WidgetSize || WidgetSize.MEDIUM);
  const [style, setStyle] = useState<WidgetStyle>(widget?.style || {
    ...THEME_PRESETS[0].style,
    bgPosX: 50,
    bgPosY: 50,
    bgScale: 100
  });
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setStyle({ 
          ...style, 
          backgroundImage: reader.result as string,
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

  const updateStyle = (key: keyof WidgetStyle, value: any) => {
    setStyle(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="bg-indigo-600/20 p-2 rounded-xl">
               <ImageIcon className="text-indigo-400" size={20} />
             </div>
             <h2 className="text-xl font-bold">{widget ? 'Customize Widget' : 'Design New Widget'}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-8 max-h-[75vh] overflow-y-auto no-scrollbar">
          {/* Location Search */}
          <section className="space-y-3">
            <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">Target Location</label>
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Where in the world?"
                className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-5 py-4 pr-14 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button 
                onClick={handleSearch}
                disabled={isSearching}
                className="absolute right-2 top-2 p-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-colors disabled:opacity-50"
              >
                {isSearching ? <Loader2 size={24} className="animate-spin" /> : <Search size={24} />}
              </button>
            </div>
            {error && <p className="text-red-400 text-xs font-medium px-2">{error}</p>}
            {timezone && <p className="text-emerald-400 text-xs font-bold flex items-center gap-1 px-2"><Check size={14} /> Timezone: {timezone}</p>}
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section className="space-y-3">
              <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">Identify As</label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Mom, Office, etc."
                className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              />
            </section>
            <section className="space-y-3">
              <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">Layout Style</label>
              <select 
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value as WidgetSize)}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium appearance-none text-white"
              >
                <option value={WidgetSize.SMALL}>Compact (1x1)</option>
                <option value={WidgetSize.MEDIUM}>Standard (1x1 Tall)</option>
                <option value={WidgetSize.WIDE}>Wide (2x1)</option>
              </select>
            </section>
          </div>

          <section className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">Aesthetic & Decoration</label>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5"
              >
                <Upload size={14} /> Custom Background
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                className="hidden" 
                accept="image/*"
              />
            </div>
            
            {style.backgroundImage && (
              <div className="space-y-6 bg-slate-800/30 p-4 rounded-3xl border border-slate-700/50">
                <div className="flex flex-col md:flex-row gap-6 items-center">
                  {/* Live Cropping Preview */}
                  <div 
                    className={`relative overflow-hidden rounded-2xl border-2 border-indigo-500/50 shadow-2xl flex-shrink-0 ${selectedSize === WidgetSize.WIDE ? 'w-48 h-24' : 'w-32 h-32'}`}
                    style={{
                      backgroundImage: `url(${style.backgroundImage})`,
                      backgroundSize: `${style.bgScale}%`,
                      backgroundPosition: `${style.bgPosX}% ${style.bgPosY}%`,
                      backgroundRepeat: 'no-repeat'
                    }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                       <Move className="text-white/20" size={32} />
                    </div>
                  </div>

                  {/* Position Controls */}
                  <div className="flex-1 w-full space-y-4">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-black uppercase text-slate-500">
                        <span>Zoom</span>
                        <span>{style.bgScale}%</span>
                      </div>
                      <input 
                        type="range" min="100" max="300" 
                        value={style.bgScale} 
                        onChange={(e) => updateStyle('bgScale', parseInt(e.target.value))}
                        className="w-full accent-indigo-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-black uppercase text-slate-500">
                        <span>Horizontal Position</span>
                        <span>{style.bgPosX}%</span>
                      </div>
                      <input 
                        type="range" min="0" max="100" 
                        value={style.bgPosX} 
                        onChange={(e) => updateStyle('bgPosX', parseInt(e.target.value))}
                        className="w-full accent-indigo-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-black uppercase text-slate-500">
                        <span>Vertical Position</span>
                        <span>{style.bgPosY}%</span>
                      </div>
                      <input 
                        type="range" min="0" max="100" 
                        value={style.bgPosY} 
                        onChange={(e) => updateStyle('bgPosY', parseInt(e.target.value))}
                        className="w-full accent-indigo-500"
                      />
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setStyle({ ...style, backgroundImage: undefined })}
                  className="w-full py-2 bg-red-500/10 text-red-400 text-xs font-bold rounded-xl hover:bg-red-500/20 transition-all"
                >
                  Remove Image
                </button>
              </div>
            )}

            <div className="grid grid-cols-5 gap-3">
              {THEME_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => setStyle({ ...style, ...preset.style, backgroundImage: style.backgroundImage })}
                  className={`relative h-12 rounded-xl transition-all ${preset.style.backgroundColor} ${style.backgroundColor === preset.style.backgroundColor && !style.backgroundImage ? 'ring-2 ring-indigo-500 ring-offset-4 ring-offset-slate-900' : 'hover:opacity-80'}`}
                >
                  {style.backgroundColor === preset.style.backgroundColor && !style.backgroundImage && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Check size={20} className={preset.style.textColor} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">Typography</label>
            <div className="flex gap-3">
              {Object.values(ClockFont).map((f) => (
                <button
                  key={f}
                  onClick={() => setStyle({ ...style, font: f })}
                  className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all ${style.font === f ? 'border-indigo-500 bg-indigo-500/10 text-white' : 'border-slate-800 hover:bg-slate-800 text-slate-400'}`}
                >
                  <span className={`text-base font-bold ${f === ClockFont.MONO ? 'font-mono' : f === ClockFont.SERIF ? 'font-serif' : 'font-sans'}`}>
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </span>
                </button>
              ))}
            </div>
          </section>
        </div>

        <div className="p-6 bg-slate-900 border-t border-slate-800 flex gap-4">
          <button 
            onClick={onClose}
            className="flex-1 px-6 py-4 rounded-2xl border border-slate-700 font-bold hover:bg-slate-800 transition-colors"
          >
            Discard
          </button>
          <button 
            onClick={handleSave}
            className="flex-1 px-6 py-4 rounded-2xl bg-indigo-600 font-bold hover:bg-indigo-500 transition-colors shadow-xl shadow-indigo-600/30"
          >
            {widget ? 'Apply Changes' : 'Create Widget'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WidgetEditor;
