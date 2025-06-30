# AuthentiAi

A React-based application for creating authentic AI-generated videos and audio content using Tavus and ElevenLabs APIs.

## Features

- **AI Video Generation**: Create videos using personal or system replicas via Tavus API
- **Audio Post Creation**: Generate AI voices using ElevenLabs API
- **Video Upload**: Direct video upload functionality
- **Social Feed**: Share and interact with community content
- **User Authentication**: Secure user management with Supabase

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   Copy `.env.example` to `.env` and fill in your API keys:
   ```bash
   cp .env.example .env
   ```

   Required environment variables:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key
   - `VITE_TAVUS_API_KEY`: Your Tavus API key for video generation
   - `VITE_ELEVENLABS_API_KEY`: Your ElevenLabs API key (optional, for audio)

3. **Database Setup**
   Run the migrations in the `supabase/migrations/` folder in your Supabase dashboard.

4. **Start Development Server**
   ```bash
   npm run dev
   ```

## Video Creation Flow Testing

### Test Cases to Verify:

1. **Personal Replica Creation**
   - Navigate to Create Video → Personal Replica
   - Verify user replicas load from Tavus API
   - Test creating new personal replica (if you have training footage)
   - Verify replica selection and video generation

2. **Stock Replica Usage**
   - Navigate to Create Video → Stock Replica
   - Verify system replicas load from Tavus API
   - Test selecting a system replica
   - Verify video generation with script input

3. **Video Upload**
   - Navigate to Create Video → Upload Video
   - Test file upload functionality (MP4, MOV, AVI)
   - Verify file size validation (100MB limit)
   - Confirm video saves to Supabase storage

4. **Database Integration**
   - Verify video records save correctly with all fields
   - Check status tracking: processing → generating → completed
   - Confirm replica information is stored correctly

5. **Error Handling**
   - Test with invalid API keys
   - Test with no replicas available
   - Test with invalid file uploads
   - Verify graceful error messages

### Key Bug Fixes Applied:

- Fixed database schema mismatch (updated TypeScript types)
- Removed fake STOCK_REPLICAS, now loads real system replicas
- Added proper video generation status polling
- Improved error handling and user feedback
- Fixed Tavus API integration for replica loading
- Added comprehensive validation for replica selection

## Troubleshooting

- Ensure all environment variables are set correctly
- Check Supabase database migrations are applied
- Verify API keys have proper permissions
- Check browser console for detailed error messages
