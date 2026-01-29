import React, { useState, useEffect, useMemo } from 'react';
import { Map, List, Plus, Sparkles, Navigation } from 'lucide-react';
import MapView from './components/MapView';
import UpdateCard from './components/UpdateCard';
import PostModal from './components/PostModal';
import { getCityPulseSummary } from './services/geminiService';
import { CityUpdate, Coordinates, UpdateCategory, ViewState } from './types';

// Demo initial data
const INITIAL_UPDATES: CityUpdate[] = [
  {
    id: '1',
    category: UpdateCategory.TRAFFIC,
    description: 'Heavy congestion due to road work on 5th Avenue.',
    timestamp: Date.now() - 1000 * 60 * 5, // 5 mins ago
    location: { lat: 40.7128, lng: -74.0060 },
    expiresAt: Date.now() + 3600000,
    likes: 12
  },
  {
    id: '2',
    category: UpdateCategory.EVENT,
    description: 'Pop-up farmers market near the central park entrance.',
    timestamp: Date.now() - 1000 * 60 * 30, // 30 mins ago
    location: { lat: 40.7138, lng: -74.0050 },
    expiresAt: Date.now() + 7200000,
    likes: 45
  },
  {
    id: '3',
    category: UpdateCategory.ISSUE,
    description: 'Street light malfunction at the intersection.',
    timestamp: Date.now() - 1000 * 60 * 15, // 15 mins ago
    location: { lat: 40.7118, lng: -74.0070 },
    expiresAt: Date.now() + 3600000,
    likes: 3
  }
];

const App: React.FC = () => {
  const [updates, setUpdates] = useState<CityUpdate[]>(INITIAL_UPDATES);
  const [viewState, setViewState] = useState<ViewState>({
    mode: 'MAP',
    center: { lat: 40.7128, lng: -74.0060 }, // NYC default
    zoom: 15
  });
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [loadingLoc, setLoadingLoc] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  // Load user location on mount
  useEffect(() => {
    if ('geolocation' in navigator) {
      setLoadingLoc(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setViewState(prev => ({
            ...prev,
            center: { lat: latitude, lng: longitude }
          }));
          setLoadingLoc(false);
          // In a real app, we would fetch updates for this location here
        },
        (err) => {
          console.error("Geo error", err);
          setLoadingLoc(false);
        }
      );
    }
  }, []);

  // Filter updates (mock expiring logic)
  const activeUpdates = useMemo(() => {
    const now = Date.now();
    return updates.filter(u => u.expiresAt > now).sort((a, b) => b.timestamp - a.timestamp);
  }, [updates]);

  const handlePostUpdate = (description: string, category: UpdateCategory) => {
    // Fuzz location slightly so items don't stack perfectly on user
    const fuzz = () => (Math.random() - 0.5) * 0.002; 
    
    const newUpdate: CityUpdate = {
      id: Date.now().toString(),
      category,
      description,
      timestamp: Date.now(),
      location: {
        lat: viewState.center.lat + fuzz(),
        lng: viewState.center.lng + fuzz()
      },
      expiresAt: Date.now() + 3600000 * 2, // 2 hours
      likes: 0
    };

    setUpdates(prev => [newUpdate, ...prev]);
    setIsPostModalOpen(false);
    
    // Switch to map to see the drop
    setViewState(prev => ({ ...prev, mode: 'MAP' }));
  };

  const handleGenerateSummary = async () => {
    setLoadingAi(true);
    setAiSummary(null);
    try {
      const summary = await getCityPulseSummary(activeUpdates, viewState.center);
      setAiSummary(summary);
    } catch (e) {
      setAiSummary("Could not generate summary.");
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="h-screen w-full flex flex-col bg-slate-100 overflow-hidden relative">
      {/* Top Header */}
      <header className="bg-white/90 backdrop-blur-md z-20 border-b border-slate-200 px-4 py-3 flex justify-between items-center shadow-sm shrink-0">
        <div className="flex items-center space-x-2">
          <div className="bg-blue-600 text-white p-1.5 rounded-lg">
            <Navigation className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-cyan-500">
            CityPulse
          </h1>
        </div>
        
        {/* Desktop View Toggles */}
        <div className="hidden md:flex bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setViewState(prev => ({ ...prev, mode: 'MAP' }))}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              viewState.mode === 'MAP' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Map View
          </button>
          <button
            onClick={() => setViewState(prev => ({ ...prev, mode: 'FEED' }))}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              viewState.mode === 'FEED' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Live Feed
          </button>
        </div>

        <button 
          onClick={() => setIsPostModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg shadow-blue-200 transition-all active:scale-95 flex items-center"
        >
          <Plus className="w-4 h-4 mr-1 md:mr-2" />
          <span className="hidden md:inline">Post Update</span>
          <span className="md:hidden">Post</span>
        </button>
      </header>

      {/* Main Content Area - Split for Desktop, Toggled for Mobile */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Map Container */}
        <div className={`absolute inset-0 md:relative md:w-2/3 lg:w-3/4 transition-transform duration-300 ${
          viewState.mode === 'FEED' ? 'translate-x-[-100%] md:translate-x-0' : 'translate-x-0'
        }`}>
          <MapView 
            center={viewState.center} 
            zoom={viewState.zoom} 
            updates={activeUpdates}
            onMarkerClick={(u) => {
              // In a real app, verify logic
              console.log(u);
            }}
          />
          {/* Overlay Actions on Map */}
          <div className="absolute top-4 left-4 z-[400] flex flex-col gap-2">
             <button 
                onClick={handleGenerateSummary}
                className="bg-white/90 backdrop-blur text-slate-700 px-4 py-2 rounded-xl shadow-lg border border-white/50 font-medium text-sm flex items-center hover:bg-white transition-all"
             >
               {loadingAi ? (
                 <span className="animate-spin mr-2">⟳</span>
               ) : (
                 <Sparkles className="w-4 h-4 text-purple-500 mr-2" />
               )}
               Pulse Check AI
             </button>
             
             {aiSummary && (
               <div className="bg-white/95 backdrop-blur-xl p-4 rounded-xl shadow-xl max-w-xs border border-purple-100 animate-in slide-in-from-left-2 duration-300">
                 <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xs font-bold text-purple-600 uppercase tracking-wider">AI Summary</h3>
                    <button onClick={() => setAiSummary(null)} className="text-slate-400 hover:text-slate-600"><span className="text-xs">✕</span></button>
                 </div>
                 <p className="text-sm text-slate-700 leading-relaxed">{aiSummary}</p>
               </div>
             )}
          </div>
        </div>

        {/* Feed Container */}
        <div className={`absolute inset-0 md:relative md:w-1/3 lg:w-1/4 bg-slate-50 z-10 transition-transform duration-300 flex flex-col border-l border-slate-200 ${
          viewState.mode === 'MAP' ? 'translate-x-[100%] md:translate-x-0' : 'translate-x-0'
        }`}>
          <div className="p-4 border-b border-slate-200 bg-white flex justify-between items-center">
            <h2 className="font-bold text-slate-700">Nearby Updates</h2>
            <span className="text-xs font-medium bg-slate-100 px-2 py-1 rounded text-slate-500">
              {activeUpdates.length} Active
            </span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 scroll-smooth">
            {activeUpdates.length === 0 ? (
              <div className="text-center py-10 opacity-50">
                <p className="text-slate-400 mb-2">No active updates nearby.</p>
                <p className="text-xs text-slate-300">Be the first to post!</p>
              </div>
            ) : (
              activeUpdates.map(update => (
                <UpdateCard 
                  key={update.id} 
                  update={update} 
                  onClick={() => {
                     setViewState(prev => ({...prev, mode: 'MAP', center: update.location}));
                  }}
                />
              ))
            )}
          </div>
        </div>

      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden bg-white border-t border-slate-200 px-6 py-3 flex justify-around items-center z-30 shrink-0 safe-area-bottom">
        <button 
          onClick={() => setViewState(prev => ({ ...prev, mode: 'MAP' }))}
          className={`flex flex-col items-center space-y-1 ${viewState.mode === 'MAP' ? 'text-blue-600' : 'text-slate-400'}`}
        >
          <Map className="w-6 h-6" />
          <span className="text-[10px] font-medium">Map</span>
        </button>
        
        {/* Floating Action Button for Mobile within Nav area - visual overlap */}
        <div className="relative -top-6">
          <button 
            onClick={() => setIsPostModalOpen(true)}
            className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white p-4 rounded-full shadow-lg shadow-blue-200 hover:scale-105 transition-transform"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>

        <button 
          onClick={() => setViewState(prev => ({ ...prev, mode: 'FEED' }))}
          className={`flex flex-col items-center space-y-1 ${viewState.mode === 'FEED' ? 'text-blue-600' : 'text-slate-400'}`}
        >
          <List className="w-6 h-6" />
          <span className="text-[10px] font-medium">Feed</span>
        </button>
      </div>

      {/* Modals */}
      <PostModal 
        isOpen={isPostModalOpen} 
        onClose={() => setIsPostModalOpen(false)}
        onSubmit={handlePostUpdate}
        loading={false}
      />
    </div>
  );
};

export default App;