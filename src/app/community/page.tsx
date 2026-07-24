'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import {
  Users,
  MessageSquare,
  ThumbsUp,
  Send,
  PlusCircle,
  Search,
  Filter,
  MapPin,
  Sprout,
  X,
  MessageCircle,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { apiService } from '@/services/api';
import { CommunityPost } from '@/types';
import { INDIAN_CROPS } from '@/constants/crops';
import { toast } from 'sonner';

export default function CommunityPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCrop, setSelectedCrop] = useState<string>('all');

  // New Post Modal State
  const [showNewPostModal, setShowNewPostModal] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newContent, setNewContent] = useState<string>('');
  const [newCropCategory, setNewCropCategory] = useState<string>('Tomato');
  const [submittingPost, setSubmittingPost] = useState<boolean>(false);

  // Active Comment input states key: postId, val: string
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const data = await apiService.community.getPosts();
      setPosts(data);
    } catch {
      toast.error('Failed to load community discussions');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      const updatedLikes = await apiService.community.likePost(postId);
      setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, likes: updatedLikes } : p)));
      toast.success('Post upvoted!');
    } catch {
      toast.error('Could not upvote post');
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) {
      toast.error('Please fill in both title and content');
      return;
    }

    setSubmittingPost(true);
    try {
      const created = await apiService.community.createPost({
        authorName: user?.fullName || 'Farmer',
        authorLocation: user ? `${user.district}, ${user.state}` : 'Gujarat, India',
        cropCategory: newCropCategory,
        title: newTitle,
        content: newContent,
      });

      setPosts((prev) => [created, ...prev]);
      setShowNewPostModal(false);
      setNewTitle('');
      setNewContent('');
      toast.success('Discussion topic published successfully 🌿');
    } catch {
      toast.error('Failed to post discussion');
    } finally {
      setSubmittingPost(false);
    }
  };

  const handleAddComment = async (postId: string) => {
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;

    try {
      const createdComment = await apiService.community.addComment(postId, {
        authorName: user?.fullName || 'Farmer',
        authorLocation: user ? `${user.district}, ${user.state}` : 'India',
        content: text.trim(),
      });

      setPosts((prev) =>
        prev.map((p) => {
          if (p.id === postId) {
            const comments = p.comments || [];
            return {
              ...p,
              comments: [...comments, createdComment],
              commentsCount: comments.length + 1,
            };
          }
          return p;
        })
      );

      setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
      toast.success('Comment added');
    } catch {
      toast.error('Failed to add comment');
    }
  };

  const toggleCommentsView = (postId: string) => {
    setExpandedComments((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.authorName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCrop =
      selectedCrop === 'all' || post.cropCategory.toLowerCase() === selectedCrop.toLowerCase();

    return matchesSearch && matchesCrop;
  });

  return (
    <AppLayout currentPath="/community">
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Users className="text-primary" /> Indian Farmer Community Forum
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Connect with fellow agriculturalists, ask crop health questions, and share remedies
              across India.
            </p>
          </div>
          <button
            onClick={() => setShowNewPostModal(true)}
            className="btn-primary gap-2 self-start md:self-auto text-sm px-5 py-2.5"
          >
            <PlusCircle size={18} /> Start Discussion
          </button>
        </div>

        {/* Filter bar */}
        <div className="card-base p-4 grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <div className="md:col-span-8 relative">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search discussion topics, symptoms, or author..."
              className="input-field pl-10"
            />
          </div>

          <div className="md:col-span-4 relative">
            <Filter
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="input-field pl-8 text-xs cursor-pointer"
            >
              <option value="all">All Crops & Categories</option>
              {INDIAN_CROPS.map((crop) => (
                <option key={`comm-crop-${crop.id}`} value={crop.name.split(' (')[0]}>
                  {crop.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="space-y-4 py-8 animate-pulse">
            <div className="h-32 bg-muted rounded-2xl"></div>
            <div className="h-32 bg-muted rounded-2xl"></div>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredPosts.length === 0 && (
          <div className="card-base p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center mx-auto text-primary">
              <MessageSquare size={32} />
            </div>
            <h2 className="text-xl font-bold text-foreground">No Discussions Found</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Be the first farmer to start a discussion thread or ask a question!
            </p>
            <button
              onClick={() => setShowNewPostModal(true)}
              className="btn-primary inline-flex items-center gap-2 px-5 py-2.5"
            >
              <PlusCircle size={18} /> Post First Question
            </button>
          </div>
        )}

        {/* Posts List */}
        {!loading && filteredPosts.length > 0 && (
          <div className="space-y-4">
            {filteredPosts.map((post) => {
              const timeFormatted = new Date(post.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              });
              const commentsOpen = expandedComments[post.id];

              return (
                <div key={post.id} className="card-base space-y-4 fade-in-up">
                  {/* Author Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full gradient-green flex items-center justify-center text-white font-bold text-sm">
                        {post.authorName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-foreground">{post.authorName}</h3>
                          <span className="text-[10px] font-semibold bg-accent text-primary px-2 py-0.5 rounded-full border border-primary/20">
                            {post.cropCategory}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <MapPin size={11} className="text-primary" /> {post.authorLocation} ·{' '}
                          {timeFormatted}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="space-y-2">
                    <h2 className="text-base font-bold text-foreground">{post.title}</h2>
                    <p className="text-xs text-foreground/80 leading-relaxed whitespace-pre-line">
                      {post.content}
                    </p>
                  </div>

                  {/* Action Bar */}
                  <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => handleLike(post.id)}
                        className="flex items-center gap-1.5 hover:text-primary transition-colors font-semibold"
                      >
                        <ThumbsUp size={15} />
                        <span>{post.likes} Helpful</span>
                      </button>

                      <button
                        onClick={() => toggleCommentsView(post.id)}
                        className="flex items-center gap-1.5 hover:text-primary transition-colors font-semibold"
                      >
                        <MessageCircle size={15} />
                        <span>{post.commentsCount || post.comments?.length || 0} Replies</span>
                      </button>
                    </div>

                    <span className="flex items-center gap-1 text-[11px] text-muted-foreground font-mono">
                      <Sprout size={12} className="text-primary" /> CropX Community
                    </span>
                  </div>

                  {/* Expandable Comments Section */}
                  {commentsOpen && (
                    <div className="pt-3 border-t border-border/60 space-y-3 bg-muted/20 p-4 rounded-xl">
                      <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                        Farmer Replies ({post.comments?.length || 0})
                      </h4>

                      {/* Comment List */}
                      {post.comments && post.comments.length > 0 ? (
                        <div className="space-y-2">
                          {post.comments.map((comment) => (
                            <div
                              key={comment.id}
                              className="bg-card p-3 rounded-xl border border-border space-y-1"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-foreground">
                                  {comment.authorName}
                                </span>
                                <span className="text-[10px] text-muted-foreground">
                                  {comment.authorLocation}
                                </span>
                              </div>
                              <p className="text-xs text-foreground/80">{comment.content}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground italic">
                          No replies yet. Be the first to answer!
                        </p>
                      )}

                      {/* Add Comment Input */}
                      <div className="flex items-center gap-2 pt-2">
                        <input
                          type="text"
                          value={commentInputs[post.id] || ''}
                          onChange={(e) =>
                            setCommentInputs({ ...commentInputs, [post.id]: e.target.value })
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAddComment(post.id);
                          }}
                          placeholder="Write a reply or recommendation..."
                          className="input-field text-xs py-2"
                        />
                        <button
                          onClick={() => handleAddComment(post.id)}
                          className="btn-primary text-xs px-3.5 py-2 gap-1"
                        >
                          <Send size={13} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Modal for New Post */}
        {showNewPostModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="card-base max-w-lg w-full space-y-4 fade-in-up">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <PlusCircle className="text-primary" size={20} /> Ask Farmer Community
                </h3>
                <button
                  onClick={() => setShowNewPostModal(false)}
                  className="text-muted-foreground hover:text-foreground text-sm font-bold p-1"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreatePost} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1.5">
                    Target Crop Category
                  </label>
                  <select
                    value={newCropCategory}
                    onChange={(e) => setNewCropCategory(e.target.value)}
                    className="input-field text-xs cursor-pointer"
                  >
                    {INDIAN_CROPS.map((crop) => (
                      <option key={`newpost-crop-${crop.id}`} value={crop.name.split(' (')[0]}>
                        {crop.name}
                      </option>
                    ))}
                    <option value="General Agriculture">General Agriculture</option>
                    <option value="Fertilizers & Soil">Fertilizers & Soil</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1.5">
                    Discussion Title / Question
                  </label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. How to treat Yellow Leaf Curl on Kharif chilli crop?"
                    className="input-field text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1.5">
                    Detailed Symptoms / Context
                  </label>
                  <textarea
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    rows={4}
                    placeholder="Describe crop symptoms, region, soil moisture, or remedy advice requested..."
                    className="input-field text-xs"
                    required
                  ></textarea>
                </div>

                <div className="pt-3 border-t border-border flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowNewPostModal(false)}
                    className="btn-ghost text-xs px-4 py-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingPost}
                    className="btn-primary text-xs px-5 py-2 gap-1.5"
                  >
                    <Send size={14} /> {submittingPost ? 'Publishing...' : 'Publish Question'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
