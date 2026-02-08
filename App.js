
import React, { useState, useEffect } from 'react';
import { WidgetSize } from './types.js';
import { INITIAL_WIDGETS } from './constants.js';
import { getGreeting } from './services/geminiService.js';
import WidgetComponent from './components/Widget.js';
import WidgetEditor from './components/WidgetEditor.js';
import { Plus, Clock, Layout, Globe, Smartphone, Rocket, Users } from 'lucide-react';
import { motion, Reorder, AnimatePresence } from 'framer-motion';

const App = () => {
  const [widgets, setWidgets] = useState(() => {
    const saved = localStorage.getItem('timemate_widgets');
    return saved ? JSON.parse(saved) : INITIAL_WIDGETS;
  });
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingWidget, setEditingWidget] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [greeting, setGreeting] = useState('Welcome back');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    localStorage.setItem('timemate_widgets', JSON.stringify(widgets));
  }, [widgets]);

  useEffect(() => {
    const fetchGreeting = async () => {
      const hour = new Date().getHours();
      let tod = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
      const res = await getGreeting(tod);
      setGreeting(res);
    };
    fetchGreeting();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSaveWidget = (widget) => {
    if (editingWidget) {
      setWidgets(prev => prev.map(w => w.id === widget.id ? widget : w));
    } else {
      setWidgets(prev => [...prev, widget]);
    }
    setIsEditorOpen(false);
    setEditingWidget(null);
  };

  const handleDeleteWidget = (id) => setWidgets(prev => prev.filter(w => w.id !== id));
  const handleToggleFavorite = (id) => setWidgets(prev => prev.map(w => w.id === id ? { ...w, isFavorite: !w.isFavorite } : w));
  const handleEditWidget = (w) => { setEditingWidget(w); setIsEditorOpen(true); };

  return React.createElement('div', { className: "min-h-screen bg-[#020617] text-slate-100 pb-24 pt-safe" }, [
    React.createElement('header', { key: 'nav', className: "sticky top-0 z-30 bg-[#020617]/90 backdrop-blur-xl border-b border-white/5 px-6 py-4" }, 
      React.createElement('div', { className: "max-w-7xl mx-auto flex items-center justify-between" }, [
        React.createElement('div', { className: "flex items-center gap-4" }, [
          React.createElement('div', { className: "bg-indigo-600 p-2.5 rounded-2xl shadow-xl shadow-indigo-600/30" }, React.createElement(Clock, { className: "text-white", size: 24 })),
          React.createElement('div', null, [
            React.createElement('h1', { className: "text-xl font-black tracking-tight" }, "TimeMate"),
            React.createElement('p', { className: "text-xs text-slate-500 font-bold uppercase tracking-wider" }, greeting)
          ])
        ]),
        React.createElement('button', { onClick: () => setIsEditorOpen(true), className: "bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-3 rounded-2xl font-black shadow-xl" }, React.createElement(Plus, { size: 20 }))
      ])
    ),
    React.createElement('main', { key: 'main', className: "max-w-7xl mx-auto p-4 sm:p-8" }, 
      activeTab === 'home' && React.createElement('div', { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" }, 
        widgets.map(w => React.createElement(WidgetComponent, { key: w.id, widget: w, onDelete: handleDeleteWidget, onToggleFavorite: handleToggleFavorite, onEdit: handleEditWidget }))
      )
    ),
    isEditorOpen && React.createElement(WidgetEditor, { key: 'editor', widget: editingWidget, onSave: handleSaveWidget, onClose: () => { setIsEditorOpen(false); setEditingWidget(null); } })
  ]);
};

export default App;
