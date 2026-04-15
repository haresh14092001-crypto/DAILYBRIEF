'use client';

import {
  Briefcase, FolderArchive, ArrowDownToLine, ArrowUpFromLine,
  Video, Plus, LayoutGrid, Settings, ChevronRight,
  Target, Hash, ToggleLeft, ToggleRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useUIStore } from '@/lib/store';
import { FeedCategory } from '@/lib/rssEngine';
import { cn } from '@/lib/utils';

const RESOURCE_CATS = [
  { label: 'Veterinary',        emoji: '🐄', sub: 'Merck, IVIS, VIN' },
  { label: 'Research',          emoji: '🔬', sub: 'PubMed, Frontiers' },
  { label: 'AI Tools',          emoji: '🤖', sub: 'ChatGPT, Perplexity' },
  { label: 'Business Strategy', emoji: '📈', sub: 'Harvard, Finshots' },
  { label: 'Study Templates',   emoji: '📋', sub: 'Notes, MCQs' },
];

const POST_TYPES = ['ICAR MCQ', 'Case Insights', 'Study Snippet', 'Agadham'];

export default function Hub() {
  const { posts, addPost, updatePostStatus, updatePostPerformance, userPreferences, updateUserPreferences, refreshFeed } = useUIStore();
  const [activeTab, setActiveTab] = useState<'tracking' | 'resources' | 'settings'>('tracking');
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostType, setNewPostType] = useState('Study Snippet');
  const [isAddingPost, setIsAddingPost] = useState(false);
  const [newKeyword, setNewKeyword] = useState('');
  const [isEditingPrefs, setIsEditingPrefs] = useState(false);

  const handleAddPost = () => {
    if (!newPostTitle) return;
    addPost({ id: Date.now(), title: newPostTitle, type: newPostType, status: 'Planned' });
    setNewPostTitle('');
    setIsAddingPost(false);
  };

  const handleAddKeyword = () => {
    if (!newKeyword.trim()) return;
    const updated = [...userPreferences.keywords, newKeyword.trim()];
    updateUserPreferences({ keywords: updated });
    setNewKeyword('');
  };

  const handleRemoveKeyword = (keyword: string) => {
    const updated = userPreferences.keywords.filter(k => k !== keyword);
    updateUserPreferences({ keywords: updated });
  };

  const PREFERRED_CATEGORIES: FeedCategory[] = ['Veterinary', 'Research', 'Startup', 'Jobs', 'Courses', 'Business', 'General'];

  const handleToggleCategory = (category: FeedCategory) => {
    const updated = userPreferences.preferredCategories.includes(category)
      ? userPreferences.preferredCategories.filter((c) => c !== category)
      : [...userPreferences.preferredCategories, category];
    updateUserPreferences({ preferredCategories: updated });
  };

  const TABS = [
    { id: 'tracking',   label: 'Tracking',   icon: Briefcase },
    { id: 'resources',  label: 'Resources',  icon: FolderArchive },
    { id: 'settings',   label: 'Settings',   icon: Settings },
  ] as const;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-20 glass border-b border-border/30">
        <div className="px-4 pt-4 pb-3 max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-[20px] font-extrabold tracking-tight leading-tight bg-gradient-to-r from-emerald-800 to-emerald-600 bg-clip-text text-transparent">
                Hub
              </h1>
              <p className="text-[10px] text-muted-foreground/60 mt-0.5 font-medium tracking-wide">
                Content · Resources · Settings
              </p>
            </div>
            <div className="h-9 w-9 rounded-[12px] flex items-center justify-center bg-emerald-50 border border-emerald-100">
              <LayoutGrid className="w-4 h-4 text-emerald-700" />
            </div>
          </div>

          {/* Tab bar */}
          <div className="flex gap-1.5">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1.5 py-[7px] rounded-full text-[11px] font-semibold border transition-all duration-200',
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-emerald-700 to-emerald-600 text-white border-transparent shadow-sm shadow-emerald-900/20'
                    : 'bg-white/80 text-muted-foreground/70 border-border/30 hover:border-emerald-200 hover:text-emerald-700',
                )}
              >
                <tab.icon className="w-3 h-3" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 pb-28 pt-4 max-w-2xl mx-auto w-full space-y-3">

        {/* ─── TRACKING TAB ──────────────────────────────────── */}
        {activeTab === 'tracking' && (
          <>
            {/* Job Tracker */}
            <div className="glass-card rounded-[18px] p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-[12px] bg-orange-50 border border-orange-100">
                  <Briefcase className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-bold text-[13px] text-foreground/80">Job Tracker</h3>
                  <p className="text-[10px] text-muted-foreground/50">Opportunities in pipeline</p>
                </div>
              </div>
              <div className="glass-card rounded-[14px] p-3.5">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-[13px] text-foreground/90">IVRI Research Fellow</h4>
                    <p className="text-[10px] text-muted-foreground/60 mt-0.5 italic">Drafting application…</p>
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-wide px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100">
                    In Progress
                  </span>
                </div>
              </div>
            </div>

            {/* Content Pipeline — மாட்டு டாக்டர் */}
            <div className="glass-card rounded-[18px] p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-[12px] bg-pink-50 border border-pink-100">
                    <Video className="w-4 h-4 text-pink-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[13px] text-foreground/80">மாட்டு டாக்டர்</h3>
                    <p className="text-[10px] text-muted-foreground/50">Content pipeline</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAddingPost(true)}
                  className="flex items-center gap-1 text-[11px] font-semibold px-3 py-1.5 rounded-full bg-pink-50 text-pink-700 border border-pink-100 hover:bg-pink-100 transition-all"
                >
                  <Plus className="w-3 h-3" /> New
                </button>
              </div>

              {/* Add form */}
              {isAddingPost && (
                <div className="mb-3 p-4 rounded-[14px] bg-pink-50/40 border border-pink-100/60 space-y-3">
                  <input
                    autoFocus
                    placeholder="Content title…"
                    className="w-full bg-transparent font-semibold text-[13px] outline-none placeholder:text-muted-foreground/40 border-b border-pink-100 pb-2"
                    value={newPostTitle}
                    onChange={e => setNewPostTitle(e.target.value)}
                  />
                  <div className="flex flex-wrap gap-1.5">
                    {POST_TYPES.map(t => (
                      <button
                        key={t}
                        onClick={() => setNewPostType(t)}
                        className={cn(
                          'text-[10px] font-semibold px-2.5 py-1 rounded-full border transition-all',
                          newPostType === t
                            ? 'bg-pink-600 text-white border-transparent'
                            : 'bg-white text-muted-foreground/70 border-border/30 hover:border-pink-300'
                        )}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleAddPost} className="flex-1 py-2 rounded-[10px] text-[12px] font-semibold bg-pink-600 text-white hover:bg-pink-700 transition-all">
                      Save Idea
                    </button>
                    <button onClick={() => setIsAddingPost(false)} className="px-4 py-2 rounded-[10px] text-[12px] font-semibold border border-border/30 text-muted-foreground hover:bg-muted/30 transition-all">
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Posts list */}
              <div className="space-y-2.5">
                {posts.length === 0 && (
                  <p className="text-[11px] text-muted-foreground/50 text-center py-4">No content ideas yet. Tap + New to add one.</p>
                )}
                {posts.map(post => {
                  const isIngested = (post.id as number) >= 200 && (post.id as number) < 300;
                  return (
                    <div key={post.id} className="glass-card rounded-[14px] p-3.5 relative overflow-hidden">
                      {isIngested && (
                        <div className="absolute top-0 right-0 bg-pink-600 text-white text-[7px] font-bold px-2 py-0.5 uppercase tracking-tight rounded-bl-xl">
                          AI Seeded
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0 mr-2">
                          <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                            <span className="text-[9px] font-bold text-pink-600 uppercase tracking-tight">{post.type}</span>
                            <span className={cn('text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase', post.status === 'Posted' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700')}>
                              {post.status}
                            </span>
                          </div>
                          <h4 className="font-semibold text-[13px] text-foreground/90 leading-snug">{post.title}</h4>
                          {post.performance && (
                            <p className="text-[10px] text-emerald-700 mt-0.5 font-medium">{post.performance}</p>
                          )}
                        </div>
                        <button
                          onClick={() => updatePostStatus(post.id)}
                          className={cn(
                            'rounded-full h-8 w-8 flex items-center justify-center border text-sm flex-shrink-0 transition-all',
                            post.status === 'Posted' ? 'text-green-600 bg-green-50 border-green-100' : 'text-muted-foreground bg-muted/30 border-border/30'
                          )}
                        >
                          {post.status === 'Posted' ? '✓' : '🚀'}
                        </button>
                      </div>

                      {post.status === 'Posted' && (
                        <div className="mt-2.5 pt-2.5 border-t border-border/20">
                          <input
                            placeholder="Add performance stats (e.g. 5k views)"
                            className="bg-transparent text-[11px] outline-none placeholder:text-muted-foreground/40 w-full italic"
                            value={post.performance || ''}
                            onChange={e => updatePostPerformance(post.id, e.target.value)}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* ─── RESOURCES TAB ─────────────────────────────────── */}
        {activeTab === 'resources' && (
          <div className="space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground/50 px-1">Resource Library</p>
            {RESOURCE_CATS.map(cat => (
              <button key={cat.label} className="w-full glass-card rounded-[18px] p-4 text-left transition-all hover:-translate-y-[1px] active:scale-[0.99] group">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{cat.emoji}</span>
                  <div className="flex-1">
                    <p className="font-semibold text-[13px] text-foreground/90">{cat.label}</p>
                    <p className="text-[10px] text-muted-foreground/50 mt-0.5">{cat.sub}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-emerald-500 transition-colors" />
                </div>
              </button>
            ))}
          </div>
        )}

        {/* ─── SETTINGS TAB ──────────────────────────────────── */}
        {activeTab === 'settings' && (
          <div className="space-y-4">
            {/* Feed Personalization */}
            <div className="glass-card rounded-[18px] p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-[15px] text-foreground mb-1">Feed Personalization</h3>
                  <p className="text-[12px] text-muted-foreground/70 leading-relaxed">
                    Customize your intelligence feed to show more relevant content like Finshots. Changes apply after refreshing the feed.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => refreshFeed()}
                    className="px-3 py-1.5 rounded-[10px] bg-emerald-600 text-white text-[12px] font-semibold hover:bg-emerald-700 transition-colors"
                  >
                    Refresh Feed
                  </button>
                  <button
                    onClick={() => setIsEditingPrefs(!isEditingPrefs)}
                    className="p-2 rounded-[12px] bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 transition-colors"
                  >
                    <Target className="w-4 h-4 text-emerald-700" />
                  </button>
                </div>
              </div>

              {isEditingPrefs && (
                <div className="space-y-4 pt-2 border-t border-border/20">
                  {/* Enable Personalization */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[13px] font-semibold text-foreground/80">Smart Personalization</p>
                      <p className="text-[11px] text-muted-foreground/60">Rank feed items by your interests</p>
                    </div>
                    <button
                      onClick={() => updateUserPreferences({ enablePersonalization: !userPreferences.enablePersonalization })}
                      className="p-1"
                    >
                      {userPreferences.enablePersonalization ? (
                        <ToggleRight className="w-6 h-6 text-emerald-600" />
                      ) : (
                        <ToggleLeft className="w-6 h-6 text-muted-foreground/40" />
                      )}
                    </button>
                  </div>

                  {/* Keywords */}
                  <div>
                    <p className="text-[13px] font-semibold text-foreground/80 mb-2">Interest Keywords</p>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        placeholder="e.g., veterinary, startup, AI"
                        value={newKeyword}
                        onChange={(e) => setNewKeyword(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddKeyword()}
                        className="flex-1 h-8 px-3 rounded-[10px] border border-border/40 bg-white/80 text-[12px] focus-visible:ring-1 focus-visible:ring-emerald-500"
                      />
                      <button
                        onClick={handleAddKeyword}
                        className="h-8 px-3 rounded-[10px] bg-emerald-600 text-white text-[12px] font-semibold hover:bg-emerald-700 transition-colors"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {userPreferences.keywords.map((keyword) => (
                        <button
                          key={keyword}
                          onClick={() => handleRemoveKeyword(keyword)}
                          className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-medium border border-emerald-100 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                        >
                          <Hash className="w-3 h-3" />
                          {keyword}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Preferred Categories */}
                  <div>
                    <p className="text-[13px] font-semibold text-foreground/80 mb-2">Preferred Categories</p>
                    <div className="flex flex-wrap gap-1.5">
                      {PREFERRED_CATEGORIES.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => handleToggleCategory(cat)}
                          className={cn(
                            'px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-all',
                            userPreferences.preferredCategories.includes(cat)
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                              : 'bg-white/80 text-muted-foreground/70 border-border/30 hover:border-emerald-200'
                          )}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="glass-card rounded-[18px] p-5 space-y-4">
              <div>
                <h3 className="font-bold text-[15px] text-foreground mb-1">Database Backup</h3>
                <p className="text-[12px] text-muted-foreground/70 leading-relaxed">
                  Your data lives locally on your device. Export regularly to avoid data loss on browser cache clear.
                </p>
              </div>

              <div className="space-y-2.5">
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-[14px] border border-border/30 bg-white/80 hover:bg-emerald-50/40 hover:border-emerald-200 transition-all group">
                  <ArrowDownToLine className="w-4 h-4 text-muted-foreground/60 group-hover:text-emerald-700 transition-colors" />
                  <span className="text-[14px] font-medium text-foreground/80">Export Brain (JSON)</span>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-[14px] border border-dashed border-border/40 hover:border-red-200 hover:bg-red-50/30 transition-all group">
                  <ArrowUpFromLine className="w-4 h-4 text-muted-foreground/40 group-hover:text-red-500 transition-colors" />
                  <span className="text-[14px] font-medium text-muted-foreground/70 group-hover:text-red-600 transition-colors">Import Backup</span>
                </button>
              </div>
            </div>

            <div className="glass-card rounded-[18px] p-5">
              <h3 className="font-bold text-[15px] text-foreground mb-3">About</h3>
              <div className="space-y-2">
                {[
                  ['App', 'VetDesk Intelligence OS'],
                  ['Version', '2.0.0'],
                  ['Built for', 'Final-year Vet Student → Founder'],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground/60 uppercase tracking-[0.08em] font-semibold">{k}</span>
                    <span className="text-[12px] font-semibold text-foreground/80">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
