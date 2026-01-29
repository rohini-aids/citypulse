import React, { useState } from 'react';
import { X, Send, AlertCircle, Users, Car, Calendar, MapPin } from 'lucide-react';
import { UpdateCategory, CATEGORY_COLORS, CATEGORY_LABELS } from '../types';

interface PostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (description: string, category: UpdateCategory) => void;
  loading: boolean;
}

const PostModal: React.FC<PostModalProps> = ({ isOpen, onClose, onSubmit, loading }) => {
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<UpdateCategory>(UpdateCategory.TRAFFIC);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (description.trim()) {
      onSubmit(description, category);
      setDescription('');
    }
  };

  const categories = [
    { id: UpdateCategory.TRAFFIC, icon: Car },
    { id: UpdateCategory.CROWD, icon: Users },
    { id: UpdateCategory.ISSUE, icon: AlertCircle },
    { id: UpdateCategory.EVENT, icon: Calendar },
    { id: UpdateCategory.NEIGHBORHOOD, icon: MapPin },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800">Post Update</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Category</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => {
                const isSelected = category === cat.id;
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`flex items-center px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                      isSelected 
                        ? 'border-transparent text-white shadow-md transform scale-105' 
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                    style={{ backgroundColor: isSelected ? CATEGORY_COLORS[cat.id] : undefined }}
                  >
                    <Icon className="w-3 h-3 mr-1.5" />
                    {CATEGORY_LABELS[cat.id]}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">What's happening?</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none h-24 text-sm"
              placeholder="E.g., Traffic light broken at Main St, or Jazz band playing in the park..."
              maxLength={140}
              required
            />
            <div className="text-right text-xs text-slate-400 mt-1">
              {description.length}/140
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !description.trim()}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-xl font-semibold shadow-lg shadow-blue-200 transition-all flex justify-center items-center"
          >
            {loading ? 'Posting...' : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Share with City
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PostModal;