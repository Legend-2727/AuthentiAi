# Veridica

A blockchain-powered content authenticity verification platform built with React, featuring AI-generated video and audio content creation with Algorand blockchain protection.

## 🌟 Features

- **🔗 Blockchain Content Protection**: Automatic registration of all content on Algorand blockchain
- **🎥 AI Video Generation**: Create videos using personal or system replicas via Tavus API  
- **🎵 AI Audio Creation**: Generate AI voices using ElevenLabs API
- **📁 Content Upload**: Direct video and audio upload with automatic blockchain registration
- **🛡️ Ownership Verification**: Cryptographic proof of content ownership and authenticity
- **🌐 Social Feed**: Share and interact with verified community content
- **🔐 Secure Authentication**: User management with Supabase
- **⚡ Deployment Ready**: Production-ready with blockchain-only mode option

## 🔐 Blockchain Security

Every piece of content uploaded or generated through Veridica is automatically:
- **Hashed** using SHA-256 cryptographic algorithm
- **Registered** on Algorand blockchain for immutable proof
- **Verified** with transaction IDs and AlgoExplorer links
- **Protected** against unauthorized duplication claims

## 🚀 Quick Start

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
   - `VITE_ALGORAND_BACKEND_MNEMONIC`: 25-word Algorand account mnemonic
   - `VITE_ALGORAND_API_TOKEN`: Nodely API token for Algorand access
   - `VITE_TAVUS_API_KEY`: Your Tavus API key for video generation
   - `VITE_ELEVENLABS_API_KEY`: Your ElevenLabs API key (optional, for audio)
   - `VITE_DEPLOYMENT_MODE`: 'full' or 'blockchain-only' (for production without Supabase Pro)

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
