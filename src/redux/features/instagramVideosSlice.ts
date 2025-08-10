import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface InstagramVideo {
  id: string;
  caption?: string;
  timestamp: string;
  thumbnail?: string;
  media_type?: string;
  permalink?: string;
  media_url?: string;
}

interface InstagramVideosState {
  videos: InstagramVideo[];
  selectedVideo: InstagramVideo | null;
  isLoading: boolean;
  error: string | null;
  lastSync: string | null;
}

const initialState: InstagramVideosState = {
  videos: [],
  selectedVideo: null,
  isLoading: false,
  error: null,
  lastSync: null,
};

const instagramVideosSlice = createSlice({
  name: 'instagramVideos',
  initialState,
  reducers: {
    setVideos: (state, action: PayloadAction<InstagramVideo[]>) => {
      state.videos = action.payload;
      state.lastSync = new Date().toISOString();
      state.error = null;
    },
    setSelectedVideo: (state, action: PayloadAction<InstagramVideo | null>) => {
      state.selectedVideo = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearVideos: (state) => {
      state.videos = [];
      state.selectedVideo = null;
      state.lastSync = null;
    },
  },
});

export const { 
  setVideos, 
  setSelectedVideo, 
  setLoading, 
  setError, 
  clearVideos 
} = instagramVideosSlice.actions;

export default instagramVideosSlice.reducer; 