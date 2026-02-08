
import React, { useState, useEffect } from 'react';
import { Widget, WidgetSize } from './types.ts';
import { INITIAL_WIDGETS } from './constants.tsx';
import { getGreeting } from './services/geminiService.ts';
import WidgetComponent from './components/Widget.tsx';
import WidgetEditor from './components/WidgetEditor.tsx';
import { 
  Plus, Clock, Users, Layout, Globe, MapPin, Smartphone, 
  X, Download, Share2, ShieldCheck, Rocket, ExternalLink, 
  CheckCircle2, Info, ArrowRight, GripVertical
} from 'lucide-react';
import { motion, Reorder, AnimatePresence } from 'framer-motion';

const App: React.FC = () => {
  const [widgets, setWidgets] = useState<Widget[]>(() => {
    const saved = localStorage.getItem('timemate_widgets');
    return saved ? JSON.parse(saved) : INITIAL_WIDGETS;
  });
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingWidget, setEditingWidget] = useState<Widget | undefined>();
  const [activeTab, setActiveTab] = useState<'home' | 'friends' | 'phone' | 'publish'>('home');
  const [greeting, setGreeting] = useState('Welcome back');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    localStorage.setItem('timemate_widgets', JSON.stringify(widgets));
  }, [widgets]);

  useEffect(() => {
    const fetchGreeting = async () => {
      const hour = new Date().getHours();
      let timeOfDay = 'day';
      if (hour < 12) timeOfDay = 'morning';
      else if (hour < 18) timeOfDay = 'afternoon';
      else timeOfDay = 'evening';
      
      const res = await getGreeting(timeOfDay);
      setGreeting(res);
    };
    fetchGreeting();

    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSaveWidget = (widget: Widget) => {
    if (editingWidget) {
      setWidgets(prev => prev.map(w => w.id === widget.id ? widget : w));
    } else {
      setWidgets(prev => [...prev, widget]);
    }
    setIsEditorOpen(false);
    setEditingWidget(undefined);
  };

  const handleDeleteWidget = (id: string) => {
    setWidgets(prev => prev.filter(w => w.id !== id));
  };

  const handleToggleFavorite = (id: string) => {
    setWidgets(prev => prev.map(w => w.id === id ? { ...w, isFavorite: !w.isFavorite } : w));
  };

  const handleEditWidget = (widget: Widget) => {
    setEditingWidget(widget);
    setIsEditorOpen(true);
  };

  const handleShareApp = () => {
    if (navigator.share) {
      navigator.share({
        title: 'TimeMate',
        text: 'Check out TimeMate for tracking world clocks with style!',
        url: window.location.href,
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 pb-24 lg:pb-8 pt-safe">
      {/* Navbar */}
      <header className="sticky top-0 z-30 bg-[#020617]/90 backdrop-blur-xl border-b border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-600 p-2.5 rounded-2xl shadow-xl shadow-indigo-600/30">
              <Clock className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight flex items-center gap-2">
                TimeMate <span className="bg-white/10 text-slate-300 text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-widest">PRO</span>
              </h1>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{greeting}</p>
            </div>
          </div>
          
          <div className="hidden md:flex bg-white/5 p-1 rounded-2xl border border-white/5">
            {[
              { id: 'home', label: 'Dashboard', icon: Layout },
              { id: 'phone', label: 'Home Screen', icon: Smartphone },
              { id: 'publish', label: 'Store Launch', icon: Rocket }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <tab.icon size={18} /> {tab.label}
              </button>
            ))}
          </div>

          <button 
            onClick={() => {
              setEditingWidget(undefined);
              setIsEditorOpen(true);
            }}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-3 rounded-2xl font-black transition-all shadow-xl shadow-indigo-600/30"
          >
            <Plus size={20} /> <span className="hidden sm:inline">New Widget</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto p-4 sm:p-8">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} key="home" className="space-y-12">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Tracking', value: widgets.length, icon: Globe, color: 'text-indigo-400' },
                  { label: 'Timezones', value: new Set(widgets.map(w => w.timezone)).size, icon: MapPin, color: 'text-emerald-400' },
                  { label: 'Favorites', value: widgets.filter(w => w.isFavorite).length, icon: Users, color: 'text-pink-400' },
                  { label: 'Time', value: currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), icon: Clock, color: 'text-amber-400', mono: true }
                ].map((stat, i) => (
                  <div key={i} className="bg-white/5 border border-white/5 p-6 rounded-[2rem] hover:bg-white/10 transition-colors">
                    <stat.icon className={`${stat.color} mb-3`} size={22} />
                    <p className={`text-2xl font-black ${stat.mono ? 'font-mono' : ''}`}>{stat.value}</p>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{stat.label}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {widgets.length > 0 ? (
                  widgets.map((widget) => (
                    <WidgetComponent 
                      key={widget.id} 
                      widget={widget} 
                      onDelete={handleDeleteWidget}
                      onToggleFavorite={handleToggleFavorite}
                      onEdit={handleEditWidget}
                    />
                  ))
                ) : (
                  <div className="col-span-full py-24 flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-white/5 rounded-[3rem]">
                    <Clock size={64} className="mb-6 opacity-10" />
                    <h3 className="text-xl font-black text-slate-300">No Clocks Yet</h3>
                    <p className="text-sm font-bold text-slate-500 mb-6">Start by adding your first global location.</p>
                    <button 
                      onClick={() => setIsEditorOpen(true)}
                      className="bg-white/10 px-8 py-3 rounded-2xl font-black text-white hover:bg-white/20 transition-all"
                    >
                      Add Now
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'phone' && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} key="phone" className="flex flex-col items-center justify-center min-h-[70vh] py-4">
              <div className="text-center mb-6">
                 <h2 className="text-2xl font-black mb-1 flex items-center justify-center gap-3">
                   <Smartphone className="text-indigo-500" /> Home Screen Layout
                 </h2>
                 <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Press and drag items to reorder</p>
              </div>
              
              <div className="relative w-full max-w-[380px] h-[750px] bg-slate-900 phone-frame rounded-[3.5rem] overflow-hidden p-6 border-4 border-slate-800 flex flex-col">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 opacity-90"></div>
                
                {/* Status Bar */}
                <div className="relative z-10 flex justify-between items-center mb-6 px-4 text-[10px] font-black tracking-tight opacity-70">
                  <span>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
                  <div className="flex gap-1.5 items-center">
                    <div className="w-4 h-2 rounded-[2px] border border-white/40 flex items-center px-[1px]">
                      <div className="h-full bg-white w-3/4"></div>
                    </div>
                  </div>
                </div>

                {/* Reorderable List within Phone */}
                <div className="relative z-10 flex-1 overflow-y-auto no-scrollbar pb-10">
                  <Reorder.Group 
                    axis="y" 
                    values={widgets} 
                    onReorder={setWidgets} 
                    className="space-y-3"
                  >
                    {widgets.map((widget) => (
                      <Reorder.Item 
                        key={widget.id} 
                        value={widget} 
                        className="cursor-grab active:cursor-grabbing"
                        whileDrag={{ scale: 1.05, boxShadow: "0px 10px 30px rgba(0,0,0,0.5)" }}
                      >
                         <WidgetComponent widget={widget} isDraggable />
                      </Reorder.Item>
                    ))}
                  </Reorder.Group>
                  
                  {widgets.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-40">
                      <Plus size={48} className="mb-4" />
                      <p className="font-bold">No widgets to show</p>
                    </div>
                  )}
                </div>

                {/* Simulated App Dock */}
                <div className="relative z-10 bg-white/5 backdrop-blur-2xl rounded-[2rem] p-4 flex justify-around mt-auto border border-white/5">
                  <div className="w-10 h-10 bg-white/10 rounded-xl"></div>
                  <div className="w-10 h-10 bg-indigo-500/20 rounded-xl"></div>
                  <div className="w-10 h-10 bg-white/5 rounded-xl"></div>
                  <div className="w-10 h-10 bg-white/10 rounded-xl"></div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'publish' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} key="publish" className="max-w-4xl mx-auto py-4 sm:py-8">
               <div className="text-center mb-12">
                 <Rocket size={48} className="mx-auto text-indigo-500 mb-4" />
                 <h2 className="text-3xl font-black mb-4">Native Store Launch</h2>
                 <p className="text-slate-400 font-medium max-w-xl mx-auto">Convert this TimeMate web app into a high-performance native app for Google Play and Apple App Store.</p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                 {/* PWABuilder Card */}
                 <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 flex flex-col hover:border-indigo-500/50 transition-all group">
                    <div className="flex justify-between items-start mb-6">
                      <div className="bg-indigo-600/20 w-12 h-12 rounded-2xl flex items-center justify-center">
                        <Rocket className="text-indigo-400" size={24} />
                      </div>
                      <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-indigo-500/20">Recommended Fast Path</span>
                    </div>
                    <h3 className="text-xl font-bold mb-3">PWABuilder (Fast Track)</h3>
                    <p className="text-slate-400 text-sm mb-8 leading-relaxed">The easiest way to package TimeMate. Just enter your URL and download store-ready bundles for Android and iOS.</p>
                    <div className="mt-auto space-y-3">
                      <a href="https://www.pwabuilder.com/" target="_blank" rel="noopener noreferrer" className="w-full bg-indigo-600 py-4 rounded-2xl font-black text-white hover:bg-indigo-500 transition-all flex items-center justify-center gap-2">
                        Launch PWABuilder <ExternalLink size={16} />
                      </a>
                    </div>
                 </div>

                 {/* Capacitor Card */}
                 <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 flex flex-col hover:border-emerald-500/50 transition-all group">
                    <div className="flex justify-between items-start mb-6">
                      <div className="bg-emerald-600/20 w-12 h-12 rounded-2xl flex items-center justify-center">
                        <Smartphone className="text-emerald-400" size={24} />
                      </div>
                      <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-500/20">Advanced Developer</span>
                    </div>
                    <h3 className="text-xl font-bold mb-3">Ionic Capacitor</h3>
                    <p className="text-slate-400 text-sm mb-8 leading-relaxed">For professional native features. Run TimeMate as a true native app with access to system SDKs and background updates.</p>
                    <div className="mt-auto space-y-3">
                      <a href="https://capacitorjs.com/docs/getting-started" target="_blank" rel="noopener noreferrer" className="w-full bg-white/10 py-4 rounded-2xl font-black text-white hover:bg-white/20 transition-all flex items-center justify-center gap-2">
                        Capacitor Docs <ExternalLink size={16} />
                      </a>
                    </div>
                 </div>
               </div>

               {/* Readiness Checklist */}
               <div className="bg-white/5 border border-white/10 rounded-[3rem] p-8 sm:p-12 mb-12">
                  <div className="flex items-center gap-4 mb-8">
                    <CheckCircle2 className="text-emerald-400" size={32} />
                    <h3 className="text-2xl font-black">Pre-Launch Checklist</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6">
                    {[
                      { title: "App Manifest", desc: "Configured in manifest.json", status: true },
                      { title: "App Icons", desc: "192px and 512px assets ready", status: true },
                      { title: "Splash Screen", desc: "Native CSS loader implemented", status: true },
                      { title: "Mobile UI", desc: "iPhone safe-area layout ready", status: true },
                      { title: "Theming", desc: "Dynamic slate/indigo palette", status: true },
                      { title: "Offline Storage", desc: "LocalData persistence ready", status: true },
                    ].map((item, idx) => (
                      <div key={idx} className="flex gap-4 items-start">
                        <div className="mt-1 bg-emerald-500/20 p-1 rounded-full">
                          <CheckCircle2 size={16} className="text-emerald-400" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-200">{item.title}</p>
                          <p className="text-xs text-slate-500 font-medium">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
               </div>

               {/* Step by Step Guide */}
               <div className="space-y-6">
                  <h3 className="text-xl font-black px-4">Launch Strategy</h3>
                  <div className="space-y-4">
                    <div className="flex gap-6 p-6 bg-slate-900 border border-white/5 rounded-[2rem]">
                      <div className="flex-shrink-0 w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center font-black">1</div>
                      <div>
                        <h4 className="font-bold mb-1">Package for Stores</h4>
                        <p className="text-sm text-slate-400 leading-relaxed">Use <strong>PWABuilder</strong> to generate a <code>.apk</code> (Android) and <code>.zip</code> (iOS Xcode project). This takes less than 5 minutes.</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-6 p-6 bg-slate-900 border border-white/5 rounded-[2rem]">
                      <div className="flex-shrink-0 w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center font-black">2</div>
                      <div>
                        <h4 className="font-bold mb-1">Set Up Developer Accounts</h4>
                        <p className="text-sm text-slate-400 leading-relaxed">Register at <a href="https://play.google.com/console" target="_blank" className="text-indigo-400 underline">Google Play Console</a> ($25 one-time) and <a href="https://developer.apple.com/" target="_blank" className="text-indigo-400 underline">Apple Developer Program</a> ($99/year).</p>
                      </div>
                    </div>

                    <div className="flex gap-6 p-6 bg-slate-900 border border-white/5 rounded-[2rem]">
                      <div className="flex-shrink-0 w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center font-black">3</div>
                      <div>
                        <h4 className="font-bold mb-1">Submit & Approval</h4>
                        <p className="text-sm text-slate-400 leading-relaxed">Upload your bundles, set your screenshots (use the 'Home Screen' tab for captures!), and wait 2-7 days for the global rollout.</p>
                      </div>
                    </div>
                  </div>
               </div>

               <div className="mt-12 text-center">
                 <button onClick={handleShareApp} className="inline-flex items-center gap-2 text-slate-400 hover:text-white font-bold transition-all">
                   <Share2 size={18} /> Send this dashboard to your developer device
                 </button>
               </div>
            </motion.div>
          )}

          {activeTab === 'friends' && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} key="friends" className="max-w-2xl mx-auto py-24 text-center">
              <div className="inline-block p-8 bg-white/5 rounded-[3rem] border border-white/5 mb-8">
                 <Users size={84} className="mx-auto text-indigo-500" />
              </div>
              <h2 className="text-3xl font-black mb-4 tracking-tight">Stay Synced with Friends</h2>
              <p className="text-slate-400 font-medium text-lg mb-10">Sync contact lists and see live times for all your friends in one list. Perfect for global teams.</p>
              <button onClick={() => setActiveTab('home')} className="bg-indigo-600 px-10 py-4 rounded-2xl font-black text-white hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/30">
                Explore Dashboard
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Mobile Navigation */}
      <nav className="fixed bottom-0 inset-x-0 bg-slate-900/90 backdrop-blur-2xl border-t border-white/5 px-4 sm:px-8 py-5 flex md:hidden justify-between items-center z-40 pb-safe">
        <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1.5 ${activeTab === 'home' ? 'text-indigo-400' : 'text-slate-500'}`}>
          <Layout size={24} />
          <span className="text-[10px] font-black uppercase tracking-widest">Dash</span>
        </button>
        <button onClick={() => setActiveTab('phone')} className={`flex flex-col items-center gap-1.5 ${activeTab === 'phone' ? 'text-indigo-400' : 'text-slate-500'}`}>
          <Smartphone size={24} />
          <span className="text-[10px] font-black uppercase tracking-widest">Home</span>
        </button>
        <button 
          onClick={() => {
            setEditingWidget(undefined);
            setIsEditorOpen(true);
          }}
          className="bg-indigo-600 text-white p-4 rounded-3xl -mt-12 shadow-2xl shadow-indigo-600/50 ring-8 ring-slate-900"
        >
          <Plus size={28} />
        </button>
        <button onClick={() => setActiveTab('publish')} className={`flex flex-col items-center gap-1.5 ${activeTab === 'publish' ? 'text-indigo-400' : 'text-slate-500'}`}>
          <Rocket size={24} />
          <span className="text-[10px] font-black uppercase tracking-widest">Store</span>
        </button>
        <button onClick={() => setActiveTab('friends')} className={`flex flex-col items-center gap-1.5 ${activeTab === 'friends' ? 'text-indigo-400' : 'text-slate-500'}`}>
          <Users size={24} />
          <span className="text-[10px] font-black uppercase tracking-widest">Circle</span>
        </button>
      </nav>

      {/* Editor Modal */}
      {isEditorOpen && (
        <WidgetEditor 
          widget={editingWidget}
          onSave={handleSaveWidget}
          onClose={() => {
            setIsEditorOpen(false);
            setEditingWidget(undefined);
          }}
        />
      )}
    </div>
  );
};

export default App;
