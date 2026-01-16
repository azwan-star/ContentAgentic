import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, XCircle, Calendar, Loader2 } from 'lucide-react';
import PostPreview, { Post } from './PostPreview';
import { supabase } from '../lib/supabase';

export interface Campaign {
  topic: string;
  mainImage: string;
  posts: Post[];
}

interface CampaignModalProps {
  campaign: Campaign | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const PLATFORMS = ['twitter', 'linkedin', 'instagram'];

export default function CampaignModal({ campaign, isOpen, onClose, onUpdate }: CampaignModalProps) {
  const [activeTab, setActiveTab] = useState<string>('linkedin');
  const [processing, setProcessing] = useState<string | null>(null);

  // Reset tab when campaign changes
  useEffect(() => {
    if (isOpen) {
      setActiveTab('linkedin');
    }
  }, [isOpen, campaign]);

  if (!campaign) return null;

  const activePost = campaign.posts.find(p => p.platform === activeTab);

  const handleAction = async (status: 'approved' | 'rejected') => {
    if (!activePost) return;
    
    try {
      setProcessing(activePost.id);
      
      const { error } = await supabase
        .from('posts')
        .update({ status })
        .eq('id', activePost.id);

      if (error) throw error;
      
      // Refresh parent data
      onUpdate();
      
    } catch (error) {
      console.error('Error updating post:', error);
    } finally {
      setProcessing(null);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
              <div>
                <h2 className="text-xl font-bold text-white">{campaign.topic}</h2>
                <p className="text-slate-400 text-sm mt-1">Campaign Review</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Tab Bar */}
            <div className="flex items-center px-6 border-b border-slate-800 bg-slate-900/30 overflow-x-auto">
              {PLATFORMS.map((platform) => {
                const hasDraft = campaign.posts.some(p => p.platform === platform);
                const isActive = activeTab === platform;
                
                return (
                  <button
                    key={platform}
                    onClick={() => setActiveTab(platform)}
                    className={`
                      relative px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap
                      ${isActive ? 'text-white' : 'text-slate-500 hover:text-slate-300'}
                    `}
                  >
                    <span className="capitalize flex items-center gap-2">
                      {platform}
                      {!hasDraft && <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />}
                      {hasDraft && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />}
                    </span>
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500"
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-950/50">
              {activePost ? (
                <div className="flex flex-col items-center">
                  <div className="w-full max-w-md mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className={`
                        px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider
                        ${activePost.status === 'approved' ? 'bg-green-500/10 text-green-400' : 
                          activePost.status === 'rejected' ? 'bg-red-500/10 text-red-400' : 
                          'bg-yellow-500/10 text-yellow-400'}
                      `}>
                        Status: {activePost.status}
                      </span>
                      <span className="text-xs text-slate-500">
                        ID: {activePost.id.slice(0, 8)}
                      </span>
                    </div>
                  </div>
                  
                  <PostPreview post={activePost} isInline={true} />
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 min-h-[300px]">
                  <p className="text-lg">No draft generated for {activeTab}</p>
                  <button className="mt-4 px-4 py-2 text-sm bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors">
                    Generate {activeTab} Draft
                  </button>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            {activePost && (
              <div className="p-6 border-t border-slate-800 bg-slate-900/50 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Calendar className="w-4 h-4" />
                  <span>Scheduled for tomorrow</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => handleAction('rejected')}
                    disabled={processing === activePost.id || activePost.status === 'rejected'}
                    className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processing === activePost.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                    Reject
                  </button>
                  
                  <button 
                    onClick={() => handleAction('approved')}
                    disabled={processing === activePost.id || activePost.status === 'approved'}
                    className="px-6 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors flex items-center gap-2 font-medium shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processing === activePost.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    Approve & Schedule
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
