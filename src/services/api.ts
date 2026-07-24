import {
  User,
  ScanRecord,
  WeatherData,
  PredictResponse,
  CommunityPost,
  PostComment,
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const TOKEN_KEY = 'cropx_access_token_v1';

export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
};

export const setAuthToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
  }
};

export const clearAuthToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
  }
};

const getHeaders = (isJson = true): Record<string, string> => {
  const headers: Record<string, string> = {};
  if (isJson) {
    headers['Content-Type'] = 'application/json';
  }
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// Complete API Service Layer for FastAPI Backend Integration
export const apiService = {
  // Authentication Endpoints
  auth: {
    async login(email: string, password: string): Promise<{ user: User; token: string }> {
      try {
        const response = await fetch(`${API_BASE_URL}/login`, {
          method: 'POST',
          headers: getHeaders(true),
          body: JSON.stringify({ email, password }),
        });
        if (response.ok) {
          const data = await response.json();
          if (data.access_token) {
            setAuthToken(data.access_token);
            // Fetch real user profile
            const profile = await apiService.auth.getProfile();
            return { user: profile, token: data.access_token };
          }
        }
      } catch {
        // Fallback for context
      }
      throw new Error('Invalid authentication credentials');
    },

    async signup(
      userData: Omit<User, 'id' | 'createdAt'> & { password: string }
    ): Promise<{ user: User; token: string }> {
      try {
        const response = await fetch(`${API_BASE_URL}/signup`, {
          method: 'POST',
          headers: getHeaders(true),
          body: JSON.stringify(userData),
        });
        if (response.ok) {
          const data = await response.json();
          if (data.access_token) {
            setAuthToken(data.access_token);
            const profile = await apiService.auth.getProfile();
            return { user: profile, token: data.access_token };
          }
        }
      } catch {
        // Fallback for context
      }
      throw new Error('Registration failed');
    },

    async getProfile(): Promise<User> {
      const response = await fetch(`${API_BASE_URL}/profile`, {
        headers: getHeaders(true),
      });
      if (response.ok) {
        return await response.json();
      }
      throw new Error('Failed to fetch user profile');
    },
  },

  // AI Crop Scan Prediction Endpoint
  scan: {
    async predict(formData: FormData): Promise<PredictResponse> {
      const response = await fetch(`${API_BASE_URL}/predict`, {
        method: 'POST',
        headers: getHeaders(false), // Multipart form data — no Content-Type header
        body: formData,
      });

      if (response.ok) {
        return await response.json();
      }

      // Parse error detail from backend response
      let errorMsg = 'AI scan prediction failed. Please try again.';
      try {
        const errData = await response.json();
        if (errData.detail) {
          errorMsg = errData.detail;
        }
      } catch {
        // Response body was not JSON
      }

      throw new Error(errorMsg);
    },

    async getHistory(): Promise<ScanRecord[]> {
      try {
        const response = await fetch(`${API_BASE_URL}/history`, {
          headers: getHeaders(true),
        });
        if (response.ok) {
          return await response.json();
        }
      } catch {
        // Local state fallback
      }
      return [];
    },

    async deleteScan(scanId: string): Promise<boolean> {
      try {
        const response = await fetch(`${API_BASE_URL}/history/${scanId}`, {
          method: 'DELETE',
          headers: getHeaders(true),
        });
        return response.ok;
      } catch {
        return false;
      }
    },
  },

  // Weather Service
  weather: {
    async getWeather(district: string, state: string): Promise<WeatherData> {
      try {
        const response = await fetch(
          `${API_BASE_URL}/weather?district=${encodeURIComponent(district)}&state=${encodeURIComponent(state)}`,
          { headers: getHeaders(true) }
        );
        if (response.ok) {
          return await response.json();
        }
      } catch {
        // Fallback weather
      }

      return {
        temperature: 31,
        humidity: 65,
        condition: 'Partly Cloudy',
        icon: 'partly-cloudy',
        rainfall: 0,
        windSpeed: 12,
        district: district || 'Anand',
        state: state || 'Gujarat',
        updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        forecast: [
          { day: 'Today', tempHigh: 33, tempLow: 24, condition: 'Sunny' },
          { day: 'Tomorrow', tempHigh: 31, tempLow: 25, condition: 'Partly Cloudy' },
          { day: 'Thu', tempHigh: 29, tempLow: 23, condition: 'Light Rain' },
        ],
      };
    },
  },

  // Dashboard Statistics Service
  dashboard: {
    async getStats() {
      try {
        const response = await fetch(`${API_BASE_URL}/dashboard`, {
          headers: getHeaders(true),
        });
        if (response.ok) {
          return await response.json();
        }
      } catch {
        // Local stats
      }
      return null;
    },
  },

  // Farmer Community Discussion Forum Service
  community: {
    async getPosts(): Promise<CommunityPost[]> {
      try {
        const response = await fetch(`${API_BASE_URL}/community/posts`, {
          headers: getHeaders(true),
        });
        if (response.ok) {
          return await response.json();
        }
      } catch {
        // Fallback mock posts if backend is offline
      }

      const stored =
        typeof window !== 'undefined' ? localStorage.getItem('cropx_community_posts_v1') : null;
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          // ignore
        }
      }

      const defaultPosts: CommunityPost[] = [
        {
          id: 'post-1',
          authorName: 'Ramesh Patel',
          authorLocation: 'Anand, Gujarat',
          cropCategory: 'Tomato',
          title: 'Effective organic treatment for Early Blight on Tomato leaves?',
          content:
            'My tomato crop has started displaying concentric dark rings with yellow halos on lower leaves during the Kharif monsoon. Has anyone successfully controlled this using Neem oil spray or Copper fungicides?',
          likes: 14,
          commentsCount: 3,
          comments: [
            {
              id: 'c-1',
              postId: 'post-1',
              authorName: 'Dr. Anita Sharma',
              authorLocation: 'ICAR Anand',
              content:
                'Apply Copper Oxychloride (3g/liter water) every 7-10 days. Ensure crop spacing for air circulation.',
              createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
            },
            {
              id: 'c-2',
              postId: 'post-1',
              authorName: 'Vikram Singh',
              authorLocation: 'Vadodara, Gujarat',
              content:
                'Neem oil emulsion (5ml/L with mild detergent) worked well in early stages for my patch.',
              createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
            },
          ],
          createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
        },
        {
          id: 'post-2',
          authorName: 'Suresh Kumar',
          authorLocation: 'Ludhiana, Punjab',
          cropCategory: 'Wheat',
          title: 'Yellow Rust prevention advice for Rabi wheat planting',
          content:
            'Preparing soil for upcoming Rabi season. What resistant varieties are best suited for North Indian plains to avoid Puccinia striiformis infection?',
          likes: 22,
          commentsCount: 2,
          comments: [
            {
              id: 'c-3',
              postId: 'post-2',
              authorName: 'Harpreet Singh',
              authorLocation: 'Amritsar, Punjab',
              content:
                'HD-2967 and DBW-187 have shown high resistance against Yellow Rust strains in Punjab.',
              createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
            },
          ],
          createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
        },
      ];

      if (typeof window !== 'undefined') {
        localStorage.setItem('cropx_community_posts_v1', JSON.stringify(defaultPosts));
      }
      return defaultPosts;
    },

    async createPost(
      post: Omit<CommunityPost, 'id' | 'likes' | 'commentsCount' | 'createdAt'>
    ): Promise<CommunityPost> {
      try {
        const response = await fetch(`${API_BASE_URL}/community/posts`, {
          method: 'POST',
          headers: getHeaders(true),
          body: JSON.stringify(post),
        });
        if (response.ok) {
          return await response.json();
        }
      } catch {
        // Fallback
      }

      const newPost: CommunityPost = {
        ...post,
        id: `post-${Date.now()}`,
        likes: 0,
        commentsCount: 0,
        comments: [],
        createdAt: new Date().toISOString(),
      };

      const existing = await apiService.community.getPosts();
      const updated = [newPost, ...existing];
      if (typeof window !== 'undefined') {
        localStorage.setItem('cropx_community_posts_v1', JSON.stringify(updated));
      }
      return newPost;
    },

    async addComment(
      postId: string,
      comment: Omit<PostComment, 'id' | 'postId' | 'createdAt'>
    ): Promise<PostComment> {
      try {
        const response = await fetch(`${API_BASE_URL}/community/posts/${postId}/comments`, {
          method: 'POST',
          headers: getHeaders(true),
          body: JSON.stringify(comment),
        });
        if (response.ok) {
          return await response.json();
        }
      } catch {
        // Fallback
      }

      const newComment: PostComment = {
        ...comment,
        id: `comment-${Date.now()}`,
        postId,
        createdAt: new Date().toISOString(),
      };

      const posts = await apiService.community.getPosts();
      const target = posts.find((p) => p.id === postId);
      if (target) {
        target.comments = target.comments || [];
        target.comments.push(newComment);
        target.commentsCount = target.comments.length;
        if (typeof window !== 'undefined') {
          localStorage.setItem('cropx_community_posts_v1', JSON.stringify(posts));
        }
      }
      return newComment;
    },

    async likePost(postId: string): Promise<number> {
      try {
        const response = await fetch(`${API_BASE_URL}/community/posts/${postId}/like`, {
          method: 'POST',
          headers: getHeaders(true),
        });
        if (response.ok) {
          const data = await response.json();
          return data.likes;
        }
      } catch {
        // Fallback
      }

      const posts = await apiService.community.getPosts();
      const target = posts.find((p) => p.id === postId);
      if (target) {
        target.likes += 1;
        if (typeof window !== 'undefined') {
          localStorage.setItem('cropx_community_posts_v1', JSON.stringify(posts));
        }
        return target.likes;
      }
      return 0;
    },
  },
};
