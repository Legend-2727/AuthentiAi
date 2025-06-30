import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { 
  Video, 
  ArrowLeft, 
  Send, 
  Upload, 
  User, 
  Users, 
  Check,
  Tag,
  X,
  Shield 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { createTavusClient, TavusReplica } from '../lib/tavus';
import { useBlockchainProof } from '../hooks/useBlockchainProof';
import BlockchainVerificationBadge from '../components/BlockchainVerificationBadge';
import ContentUploadWithProof from '../components/ContentUploadWithProof';

interface VideoFormData {
  title: string;
  script: string;
  description?: string;
  tags: string[];
}

interface VideoCreationState {
  step: 'type_selection' | 'replica_selection' | 'replica_creation' | 'video_form' | 'preview' | 'video_upload' | 'generating';
  creationType: 'personal_replica' | 'stock_replica' | 'upload' | null;
  selectedReplica?: TavusReplica | null;
  personalReplicaData?: {
    replica_name: string;
    training_video?: File;
    consent_video?: File;
  };
  uploadedVideo?: File;
  generatedVideoUrl?: string;
  videoGenerationProgress?: string;
}

const CreateVideo = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [state, setState] = useState<VideoCreationState>({
    step: 'type_selection',
    creationType: null,
  });
  const [userReplicas, setUserReplicas] = useState<TavusReplica[]>([]);
  const [systemReplicas, setSystemReplicas] = useState<TavusReplica[]>([]);
  const [newTag, setNewTag] = useState('');
  const [replicasLoaded, setReplicasLoaded] = useState(false); // Track if we've already tried loading
  const [blockchainTxnId, setBlockchainTxnId] = useState<string | null>(null);
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<VideoFormData>({
    defaultValues: {
      tags: [],
    },
  });

  const tags = watch('tags') || [];
  const tavusClient = createTavusClient();
  const { registerProof } = useBlockchainProof();

  console.log('Tavus client initialized:', !!tavusClient);
  console.log('Tavus API key available:', !!import.meta.env.VITE_TAVUS_API_KEY);

  const loadUserReplicas = useCallback(async () => {
    if (!tavusClient || replicasLoaded) return;
    
    try {
      console.log('Loading replicas from Tavus API...');
      setReplicasLoaded(true); // Mark as attempted to prevent multiple calls
      
      // Try to load user replicas
      const userResponse = await tavusClient.listReplicas({
        replica_type: 'user',
        verbose: true,
      });
      
      console.log('User replica API response:', userResponse);
      
      // Handle different response formats for user replicas
      let userReplicas: TavusReplica[] = [];
      if (userResponse.data) {
        userReplicas = userResponse.data.filter((r: TavusReplica) => r.status === 'completed');
      }
      
      console.log('Available completed user replicas:', userReplicas);
      setUserReplicas(userReplicas);
      
      // Try to load system replicas
      try {
        const systemResponse = await tavusClient.listReplicas({
          replica_type: 'system',
          verbose: true,
        });
        
        console.log('System replica API response:', systemResponse);
        
        let sysReplicas: TavusReplica[] = [];
        if (systemResponse.data) {
          sysReplicas = systemResponse.data.filter((r: TavusReplica) => r.status === 'completed');
        }
        
        console.log('Available system replicas:', sysReplicas);
        setSystemReplicas(sysReplicas);
        
      } catch (systemError) {
        console.warn('Could not load system replicas:', systemError);
        // This is okay, system replicas might not be available
      }
      
    } catch (error) {
      console.error('Failed to load replicas:', error);
      // Only show error toast if it's a real API issue, not just missing replicas
      if (error instanceof Error && !error.message.includes('not found')) {
        console.warn('Replica loading failed - this is expected if no replicas exist yet');
      }
    }
  }, [tavusClient, replicasLoaded]);

  useEffect(() => {
    if (tavusClient && user && !replicasLoaded) {
      loadUserReplicas();
    }
  }, [tavusClient, user, loadUserReplicas, replicasLoaded]);

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setValue('tags', [...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setValue('tags', tags.filter(tag => tag !== tagToRemove));
  };

  const handleTypeSelection = (type: 'personal_replica' | 'stock_replica' | 'upload') => {
      // For video upload, we can proceed without replicas
      if (type === 'upload') {
        setState(prev => ({
          ...prev,
          creationType: type,
          step: 'video_upload',
        }));
        return;
      }
      
      // For replica-based videos, try to load replicas if not already loaded
      if (!replicasLoaded && tavusClient) {
        loadUserReplicas();
      }
      
      // Check if user is trying to use personal replica but none are available
      if (type === 'personal_replica' && userReplicas.length === 0) {
        // Don't show error toast immediately, user might not have created replicas yet
        console.warn('No personal replicas available');
      }
      
      // Check if user is trying to use stock replica but none are available  
      if (type === 'stock_replica' && systemReplicas.length === 0) {
        console.warn('No stock replicas available');
      }
      
      setState(prev => ({
        ...prev,
        creationType: type,
        step: 'replica_selection',
      }));
  };

  const handleReplicaSelection = (replica: TavusReplica) => {
    setState(prev => ({
      ...prev,
      selectedReplica: replica,
      step: 'video_form',
    }));
  };

  const handlePersonalReplicaCreation = () => {
    setState(prev => ({
      ...prev,
      step: 'replica_creation',
    }));
  };

  const handleReplicaCreated = async (replicaData: { replica_name: string; training_video: File; consent_video: File }) => {
    if (!tavusClient) {
      toast.error('Tavus API not available');
      return;
    }

    setLoading(true);
    try {
      // Create personal replica using Tavus API
      const replicaResponse = await tavusClient.createReplica({
        replica_name: replicaData.replica_name,
        train_video_url: '', // We'll need to upload this file first
      });

      // Add the new replica to user replicas list
      const newReplica: TavusReplica = {
        replica_id: replicaResponse.replica_id,
        replica_name: replicaData.replica_name,
        replica_type: 'user',
        status: 'training',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setUserReplicas(prev => [...prev, newReplica]);
      setState(prev => ({
        ...prev,
        selectedReplica: newReplica,
        personalReplicaData: replicaData,
        step: 'video_form',
      }));

      toast.success('Personal replica created! Training in progress...');
    } catch (error) {
      console.error('Error creating replica:', error);
      toast.error('Failed to create personal replica');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: VideoFormData) => {
    if (!user) {
      toast.error('User not authenticated');
      return;
    }

    if (!user.id) {
      toast.error('User ID not available');
      return;
    }

    setLoading(true);
    try {
      console.log('Starting video creation process...');
      console.log('User:', user);
      console.log('Form data:', data);
      console.log('State:', state);
      
      let videoUrl = '';
      
      // Handle video upload if it's an upload type
      if (state.creationType === 'upload' && state.uploadedVideo) {
        // Create a unique filename
        const fileExt = state.uploadedVideo.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;

        // Upload video to Supabase storage
        const { error: uploadError } = await supabase.storage
          .from('videos')
          .upload(fileName, state.uploadedVideo);

        if (uploadError) {
          toast.error('Failed to upload video');
          console.error('Upload error:', uploadError);
          return;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('videos')
          .getPublicUrl(fileName);
        
        videoUrl = publicUrl;

        // Register uploaded video on blockchain for content protection
        try {
          console.log('Registering uploaded video on blockchain...');
          const txnId = await registerProof(state.uploadedVideo, 'video');
          if (txnId) {
            setBlockchainTxnId(txnId);
            console.log('Uploaded video successfully registered on blockchain:', txnId);
          }
        } catch (blockchainError) {
          console.warn('Blockchain registration failed for uploaded video (video still saved):', blockchainError);
          // Don't fail the entire process if blockchain registration fails
        }
      }

      // Save video request to database - using only basic fields for compatibility
      const videoData = {
        user_id: user.id,
        title: data.title,
        script: data.script,
        video_url: videoUrl || null,
        status: state.creationType === 'upload' ? 'completed' : 'processing'
      };

      console.log('Attempting to insert video data (basic fields only):', videoData);
      console.log('User ID type:', typeof user.id, 'Value:', user.id);

      const { data: videoRecord, error: dbError } = await supabase
        .from('videos')
        .insert(videoData)
        .select()
        .single();

      if (dbError) {
        toast.error(`Failed to save video request: ${dbError.message}`);
        console.error('Database error:', dbError);
        console.error('Database error details:', {
          code: dbError.code,
          details: dbError.details,
          hint: dbError.hint,
          message: dbError.message
        });
        return;
      }

      // Generate video using Tavus API if not upload type
      if (state.creationType !== 'upload' && tavusClient && state.selectedReplica) {
        try {
          console.log('Starting Tavus video generation...');
          console.log('Creation type:', state.creationType);
          console.log('Tavus client available:', !!tavusClient);
          console.log('Replica:', state.selectedReplica);
          console.log('Script length:', data.script.length);
          console.log('Title:', data.title);

          if (!state.selectedReplica.replica_id) {
            throw new Error('No replica ID provided');
          }

          // Additional validation for replica ID format
          if (state.selectedReplica.replica_id.startsWith('stock_')) {
            throw new Error('Invalid replica selected. Please choose a real presenter or create a personal replica.');
          }

          if (!data.script || data.script.trim().length === 0) {
            throw new Error('Script is required for video generation');
          }
          
          const videoResponse = await tavusClient.generateVideo({
            replica_id: state.selectedReplica.replica_id,
            script: data.script,
            video_name: data.title,
          });

          console.log('Tavus API response:', videoResponse);

          // Update video record with Tavus video ID for tracking
          // Store video ID in video_url temporarily since tavus_video_id column may not exist
          const { error: updateError } = await supabase
            .from('videos')
            .update({
              status: 'generating',
              video_url: `tavus:${videoResponse.video_id}`, // Prefix to distinguish from final URL
            })
            .eq('id', videoRecord.id);

          if (updateError) {
            console.error('Error updating video record:', updateError);
            throw new Error('Failed to update video record');
          }

          // Show generating status and start polling for completion
          setState(prev => ({
            ...prev,
            step: 'generating',
            videoGenerationProgress: 'Starting video generation...'
          }));
          
          toast.info('Video generation started. Please wait while we process your video...');
          
          // Start polling for video completion
          const pollVideoStatus = async () => {
            try {
              console.log(`Polling video status for video ID: ${videoResponse.video_id}`);
              
              const videoDetails = await tavusClient.getVideo(videoResponse.video_id);
              console.log('Video status poll result:', {
                status: videoDetails.status,
                video_url: videoDetails.video_url,
                download_url: videoDetails.download_url,
                full_response: videoDetails
              });
              
              // Update progress in UI
              setState(prev => ({
                ...prev,
                videoGenerationProgress: `Video status: ${videoDetails.status}`
              }));
              
              // Check if video is ready - handle multiple possible status values and video URL formats
              const isVideoReady = videoDetails.status === 'completed' || videoDetails.status === 'ready';
              const videoUrl = videoDetails.video_url || videoDetails.download_url;
              
              if (isVideoReady && videoUrl) {
                // Video is ready!
                console.log('Video generation completed!', videoUrl);
                
                // Update database with final video URL
                await supabase
                  .from('videos')
                  .update({
                    status: 'completed',
                    video_url: videoUrl,
                  })
                  .eq('id', videoRecord.id);

                // Store video ID for blockchain registration
                setCurrentVideoId(videoRecord.id);

                // Register video on blockchain for content protection
                try {
                  console.log('Registering video on blockchain...');
                  
                  // Fetch the video file for blockchain registration
                  const videoResponse = await fetch(videoUrl);
                  const videoBlob = await videoResponse.blob();
                  const currentFormData = watch();
                  const videoFile = new File([videoBlob], `${currentFormData.title || 'video'}.mp4`, {
                    type: 'video/mp4'
                  });

                  const txnId = await registerProof(videoFile, 'video', videoRecord.id);
                  if (txnId) {
                    setBlockchainTxnId(txnId);
                    console.log('Video successfully registered on blockchain:', txnId);
                    
                    // Update database with blockchain proof info
                    await supabase
                      .from('videos')
                      .update({
                        // Add blockchain_verified field if it exists in your schema
                        // blockchain_verified: true,
                        // blockchain_txn_id: txnId
                      })
                      .eq('id', videoRecord.id);
                  }
                } catch (blockchainError) {
                  console.warn('Blockchain registration failed (video still saved):', blockchainError);
                  // Don't fail the entire process if blockchain registration fails
                }

                // Set generated video URL for preview
                setState(prev => ({
                  ...prev,
                  generatedVideoUrl: videoUrl,
                  step: 'preview'
                }));

                toast.success('Video generated successfully! Review below and confirm to save.');
                return true; // Stop polling
                
              } else if (isVideoReady && !videoUrl) {
                // Status is ready but no video URL yet - continue polling a bit more
                console.log('Video status is ready but no URL available yet, continuing to poll...');
                return false;
                
              } else if (videoDetails.status === 'failed') {
                // Video generation failed
                await supabase
                  .from('videos')
                  .update({ status: 'failed' })
                  .eq('id', videoRecord.id);
                  
                toast.error('Video generation failed. Please try again.');
                return true; // Stop polling
                
              } else {
                // Still processing, continue polling
                console.log(`Video still processing. Status: ${videoDetails.status}`);
                return false; // Continue polling
              }
              
            } catch (pollError) {
              console.error('Error polling video status:', pollError);
              return false; // Continue polling, might be temporary error
            }
          };

          // Poll every 5 seconds for up to 5 minutes (60 attempts)
          let pollAttempts = 0;
          const maxPollAttempts = 60;
          const pollInterval = 5000; // 5 seconds

          const pollTimer = setInterval(async () => {
            pollAttempts++;
            
            if (pollAttempts > maxPollAttempts) {
              clearInterval(pollTimer);
              toast.error('Video generation is taking longer than expected. Please check back later.');
              return;
            }

            const shouldStop = await pollVideoStatus();
            if (shouldStop) {
              clearInterval(pollTimer);
            }
          }, pollInterval);

          // Also poll immediately
          const shouldStop = await pollVideoStatus();
          if (shouldStop) {
            clearInterval(pollTimer);
          }

          return; // Don't navigate, wait for polling to complete
        } catch (apiError) {
          console.error('Tavus API error:', apiError);
          console.error('Error details:', {
            message: apiError instanceof Error ? apiError.message : 'Unknown error',
            stack: apiError instanceof Error ? apiError.stack : undefined
          });
          
          // Update status to failed
          await supabase
            .from('videos')
            .update({ status: 'failed' })
            .eq('id', videoRecord.id);
            
          toast.error(`Video generation failed: ${apiError instanceof Error ? apiError.message : 'Unknown error'}`);
        }
      } else {
        // Handle upload type or missing Tavus configuration
        console.log('Skipping video generation because:');
        console.log('- Creation type:', state.creationType);
        console.log('- Tavus client available:', !!tavusClient);
        console.log('- Selected replica:', !!state.selectedReplica);
        
        if (state.creationType === 'upload') {
          toast.success('Video uploaded successfully!');
        } else if (!tavusClient) {
          toast.error('Video generation service not available. Check API configuration.');
          return;
        } else if (!state.selectedReplica) {
          toast.error('No replica selected for video generation.');
          return;
        } else {
          toast.success('Video request saved!');
        }
      }

      navigate('/dashboard/my-videos');
    } catch (error) {
      console.error('Error creating video:', error);
      toast.error('Failed to create video. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderTypeSelection = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Personal Replica Option */}
      <motion.div
        className="relative p-6 border-2 border-gray-200 rounded-lg hover:border-indigo-500 cursor-pointer transition-colors"
        onClick={() => handleTypeSelection('personal_replica')}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100 mb-4">
            <User className="h-8 w-8 text-indigo-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Personal Replica</h3>
          <p className="text-sm text-gray-500 mb-4">
            Create videos using your own AI replica. Train with your video footage.
          </p>
          <div className="text-xs text-indigo-600 font-medium">
            ✓ Your likeness ✓ Your voice ✓ Personalized
          </div>
        </div>
      </motion.div>

      {/* Stock Replica Option */}
      <motion.div
        className="relative p-6 border-2 border-gray-200 rounded-lg hover:border-green-500 cursor-pointer transition-colors"
        onClick={() => handleTypeSelection('stock_replica')}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <Users className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Stock Replica</h3>
          <p className="text-sm text-gray-500 mb-4">
            Use professional presenters. Ready-to-use, diverse options available.
          </p>
          <div className="text-xs text-green-600 font-medium">
            ✓ Instant use ✓ Professional ✓ Multiple styles
          </div>
        </div>
      </motion.div>

      {/* Upload Option */}
      <motion.div
        className="relative p-6 border-2 border-gray-200 rounded-lg hover:border-purple-500 cursor-pointer transition-colors"
        onClick={() => handleTypeSelection('upload')}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-purple-100 mb-4">
            <Upload className="h-8 w-8 text-purple-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Video</h3>
          <p className="text-sm text-gray-500 mb-4">
            Upload your own pre-recorded video content directly.
          </p>
          <div className="text-xs text-purple-600 font-medium">
            ✓ Your content ✓ Full control ✓ No generation needed
          </div>
        </div>
      </motion.div>
    </div>
  );

  const renderReplicaSelection = () => {
    if (state.creationType === 'personal_replica') {
      return (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Choose Your Personal Replica</h3>
            <p className="text-gray-600">
              Select an existing personal replica or create a new one
            </p>
          </div>

          {userReplicas.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userReplicas.map((replica) => (
                <motion.div
                  key={replica.replica_id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-indigo-500 cursor-pointer transition-colors"
                  onClick={() => handleReplicaSelection(replica)}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="aspect-video bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                    {replica.thumbnail_video_url ? (
                      <video
                        src={replica.thumbnail_video_url}
                        className="w-full h-full object-cover rounded-lg"
                        muted
                      />
                    ) : (
                      <Video className="h-12 w-12 text-gray-400" />
                    )}
                  </div>
                  <h4 className="font-medium text-gray-900">{replica.replica_name}</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    Created {new Date(replica.created_at).toLocaleDateString()}
                  </p>
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <Check className="h-3 w-3 mr-1" />
                      Ready
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {userReplicas.length === 0 && (
            <div className="text-center py-8">
              <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">No Personal Replicas Yet</h4>
              <p className="text-gray-600 mb-4">
                Create your first personal replica to generate videos that look and sound like you.
              </p>
            </div>
          )}

          <div className="text-center border-t pt-6">
            <button
              onClick={handlePersonalReplicaCreation}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Upload className="h-5 w-5 mr-2" />
              Create New Personal Replica
            </button>
          </div>
        </div>
      );
    }

    if (state.creationType === 'stock_replica') {
      return (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Choose a Stock Replica</h3>
            <p className="text-gray-600">
              Select from our library of professional presenters
            </p>
          </div>

          {systemReplicas.length === 0 ? (
            <div className="text-center py-8">
              <Video className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">No Stock Replicas Available</h4>
              <p className="text-gray-600 mb-4">
                Stock replicas are not currently available. You can create a personal replica instead.
              </p>
              <button
                onClick={() => handleTypeSelection('personal_replica')}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Create Personal Replica
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {systemReplicas.map((replica: TavusReplica) => (
                <motion.div
                  key={replica.replica_id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-green-500 cursor-pointer transition-colors"
                  onClick={() => handleReplicaSelection(replica)}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="aspect-video bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                    {replica.thumbnail_video_url ? (
                      <video
                        src={replica.thumbnail_video_url}
                        className="w-full h-full object-cover rounded-lg"
                        muted
                      />
                    ) : (
                      <Video className="h-12 w-12 text-gray-400" />
                    )}
                  </div>
                  <h4 className="font-medium text-gray-900">{replica.replica_name}</h4>
                  <p className="text-sm text-gray-500 mt-1">{replica.description}</p>
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {replica.style}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  const renderVideoForm = () => (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Selected Replica Info */}
      {state.selectedReplica && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 bg-gray-200 rounded-lg flex items-center justify-center">
                <User className="h-6 w-6 text-gray-500" />
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-900">
                Using: {state.selectedReplica.replica_name}
              </h4>
              <p className="text-xs text-gray-500">
                {state.selectedReplica.replica_type === 'user' ? 'Personal Replica' : 'Stock Replica'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Video Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Video Title *
        </label>
        <input
          type="text"
          {...register('title', {
            required: 'Video title is required',
            minLength: {
              value: 3,
              message: 'Title must be at least 3 characters',
            },
            maxLength: {
              value: 100,
              message: 'Title must be less than 100 characters',
            },
          })}
          className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Enter your video title"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>

      {/* Video Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          {...register('description')}
          rows={3}
          className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Brief description of your video (optional)"
        />
      </div>

      {/* Video Script */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Video Script *
        </label>
        <textarea
          {...register('script', {
            required: 'Video script is required',
            minLength: {
              value: 10,
              message: 'Script must be at least 10 characters',
            },
            maxLength: {
              value: 5000,
              message: 'Script must be less than 5000 characters',
            },
          })}
          rows={8}
          className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Write your video script here. Be descriptive and engaging..."
        />
        {errors.script && (
          <p className="mt-1 text-sm text-red-600">{errors.script.message}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Tip: Write a clear, engaging script. The AI will use this to generate your video content.
        </p>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tags
        </label>
        <div className="space-y-3">
          {/* Tag Input */}
          <div className="flex space-x-2">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Add a tag (e.g., AI, Education, Business)"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              title="Add tag"
            >
              <Tag className="h-4 w-4" />
            </button>
          </div>

          {/* Selected Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 border border-indigo-200"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-2 text-indigo-600 hover:text-indigo-800"
                    title={`Remove ${tag} tag`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Submit Buttons */}
      <div className="flex justify-between space-x-4">
        <button
          type="button"
          onClick={() => setState(prev => ({ ...prev, step: 'type_selection' }))}
          className="px-6 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Back
        </button>
        <motion.button
          type="submit"
          disabled={loading}
          className="flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Send className="h-4 w-4 mr-2" />
          {loading ? 'Creating Video...' : 'Create Video'}
        </motion.button>
      </div>
    </form>
  );

  const renderVideoUpload = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Your Video</h3>
        <p className="text-gray-600 mb-6">
          Upload your video and it will be automatically registered on the blockchain for content protection.
        </p>
      </div>

      <ContentUploadWithProof
        contentType="video"
        acceptedFileTypes={{
          'video/*': ['.mp4', '.mov', '.avi', '.mkv', '.webm']
        }}
        maxSize={100 * 1024 * 1024} // 100MB
        onProofRegistered={(txnId, fileHash) => {
          console.log('Video registered on blockchain:', { txnId, fileHash });
          setBlockchainTxnId(txnId);
        }}
        className="mb-6"
      />

      <div className="flex justify-between">
        <button
          type="button"
          onClick={() => setState(prev => ({ ...prev, step: 'type_selection' }))}
          className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>
        
        <button
          type="button"
          onClick={() => setState(prev => ({ ...prev, step: 'video_form' }))}
          className="flex items-center space-x-2 px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          disabled={!blockchainTxnId}
        >
          <span>Continue to Details</span>
          <ArrowLeft className="h-4 w-4 rotate-180" />
        </button>
      </div>
    </div>
  );

  const renderReplicaCreation = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Create Personal Replica</h3>
        <p className="text-gray-600 mb-6">
          Upload training videos to create your personal AI replica
        </p>
      </div>

      <form onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const replicaName = formData.get('replica_name') as string;
        const trainingVideo = formData.get('training_video') as File;
        const consentVideo = formData.get('consent_video') as File;

        if (!replicaName || !trainingVideo || !consentVideo) {
          toast.error('Please fill all required fields');
          return;
        }

        handleReplicaCreated({
          replica_name: replicaName,
          training_video: trainingVideo,
          consent_video: consentVideo,
        });
      }} className="space-y-6">
        {/* Replica Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Replica Name *
          </label>
          <input
            type="text"
            name="replica_name"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="e.g., My Professional Replica"
          />
        </div>

        {/* Training Video */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Training Video * (2-10 minutes)
          </label>
          <input
            type="file"
            name="training_video"
            accept="video/*"
            required
            title="Upload training video (2-10 minutes)"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            High-quality video of yourself speaking clearly, good lighting
          </p>
        </div>

        {/* Consent Video */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Consent Video *
          </label>
          <input
            type="file"
            name="consent_video"
            accept="video/*"
            required
            title="Upload consent video"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Record yourself saying: "I consent to creating an AI replica of myself"
          </p>
        </div>

        <div className="flex justify-between">
          <button
            type="button"
            onClick={() => setState(prev => ({ ...prev, step: 'replica_selection' }))}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center space-x-2 px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
            ) : (
              <Send className="h-4 w-4" />
            )}
            <span>Create Replica</span>
          </button>
        </div>
      </form>
    </div>
  );

  const renderPreview = () => {
    const formData = watch(); // Get current form data
    
    return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Preview Your Video</h3>
        <p className="text-gray-600 mb-6">
          Review your generated video before saving
        </p>
      </div>

      {state.generatedVideoUrl && (
        <div className="space-y-4">
          {/* Video Title and Description */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {formData.title || 'Untitled Video'}
            </h2>
            {formData.description && (
              <p className="text-gray-700 text-sm leading-relaxed">
                {formData.description}
              </p>
            )}
            {!formData.description && (
              <p className="text-gray-500 text-sm italic">
                No description provided
              </p>
            )}
            {formData.tags && formData.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          
          {/* Video Player */}
          <div className="bg-black rounded-lg overflow-hidden relative">
            <video
              src={state.generatedVideoUrl}
              controls
              preload="metadata"
              playsInline
              crossOrigin="anonymous"
              muted={false}
              className="w-full h-auto max-h-96"
              onLoadedMetadata={(e) => {
                const video = e.target as HTMLVideoElement;
                
                // Check for audio using multiple methods (with proper typing)
                const videoWithAudio = video as HTMLVideoElement & {
                  mozHasAudio?: boolean;
                  webkitAudioDecodedByteCount?: number;
                  audioTracks?: { length: number };
                };
                
                const hasAudio = Boolean(
                  videoWithAudio.mozHasAudio || 
                  (videoWithAudio.webkitAudioDecodedByteCount && videoWithAudio.webkitAudioDecodedByteCount > 0) || 
                  (videoWithAudio.audioTracks && videoWithAudio.audioTracks.length > 0)
                );
                
                console.log('Video metadata loaded:', {
                  duration: video.duration,
                  videoWidth: video.videoWidth,
                  videoHeight: video.videoHeight,
                  muted: video.muted,
                  volume: video.volume,
                  hasAudio,
                  audioTracks: videoWithAudio.audioTracks?.length || 0
                });
                
                // Ensure audio is enabled
                video.muted = false;
                video.volume = 1.0;
              }}
              onLoadedData={(e) => {
                const video = e.target as HTMLVideoElement;
                console.log('Video data loaded, ensuring audio is ready');
                video.muted = false;
                video.volume = 1.0;
              }}
              onError={(e) => {
                const video = e.target as HTMLVideoElement;
                console.error('Video error:', {
                  error: video.error,
                  networkState: video.networkState,
                  readyState: video.readyState,
                  src: video.src
                });
              }}
              onCanPlay={(e) => {
                const video = e.target as HTMLVideoElement;
                
                // Check for audio using properly typed methods
                const videoWithAudio = video as HTMLVideoElement & {
                  mozHasAudio?: boolean;
                  webkitAudioDecodedByteCount?: number;
                  audioTracks?: { length: number };
                };
                
                const hasAudio = Boolean(
                  videoWithAudio.mozHasAudio || 
                  (videoWithAudio.webkitAudioDecodedByteCount && videoWithAudio.webkitAudioDecodedByteCount > 0) || 
                  (videoWithAudio.audioTracks && videoWithAudio.audioTracks.length > 0)
                );
                
                console.log('Video can play - audio info:', {
                  muted: video.muted,
                  volume: video.volume,
                  duration: video.duration,
                  hasAudio,
                  readyState: video.readyState
                });
                
                // Force unmute when video is ready
                video.muted = false;
                video.volume = 1.0;
              }}
              onVolumeChange={(e) => {
                const video = e.target as HTMLVideoElement;
                console.log('Volume changed:', { muted: video.muted, volume: video.volume });
              }}
              onPlay={(e) => {
                const video = e.target as HTMLVideoElement;
                console.log('Video started playing:', { 
                  muted: video.muted, 
                  volume: video.volume,
                  currentTime: video.currentTime 
                });
                
                // Extra ensure unmute on play
                if (video.muted) {
                  video.muted = false;
                  console.log('Force unmuted video during play');
                }
              }}
              onSuspend={() => {
                console.log('Video loading suspended (network idle)');
              }}
              onWaiting={() => {
                console.log('Video waiting for more data');
              }}
            >
              Your browser does not support the video tag.
            </video>
            
            {/* Audio Notice Overlay */}
            <div className="absolute top-2 right-2">
              <div className="bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                <span className="text-green-400">🔊</span>
                <span>Audio Ready</span>
              </div>
            </div>
          </div>
          
          {/* Click to Enable Audio Button */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <button
              onClick={() => {
                const video = document.querySelector('video') as HTMLVideoElement;
                if (video) {
                  // User interaction to bypass autoplay policies
                  video.muted = false;
                  video.volume = 1.0;
                  
                  // Try playing a small portion to activate audio
                  const currentTime = video.currentTime;
                  video.play().then(() => {
                    console.log('User-initiated playback successful');
                    // Pause after a moment and return to original position
                    setTimeout(() => {
                      video.pause();
                      video.currentTime = currentTime;
                    }, 500);
                  }).catch(err => {
                    console.warn('User-initiated playback failed:', err);
                  });
                }
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto"
            >
              🔊 Click to Enable Audio
            </button>
            <p className="text-sm text-blue-700 mt-2">
              Some browsers require user interaction to play audio. Click above if you don't hear sound.
            </p>
          </div>
          
          {/* Audio Test Controls */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-yellow-800 mb-2">Audio Troubleshooting</h4>
            <div className="space-y-2 text-sm text-yellow-700">
              <p>• If audio is missing, the video might have been generated without speech</p>
              <p>• Check browser console for detailed video/audio information</p>
              <p>• Try right-clicking the video and selecting "Show controls" if available</p>
            </div>
            <button
              onClick={() => {
                const video = document.querySelector('video') as HTMLVideoElement;
                if (video) {
                  console.log('Manual video info check:', {
                    src: video.src,
                    duration: video.duration,
                    muted: video.muted,
                    volume: video.volume,
                    paused: video.paused,
                    currentTime: video.currentTime,
                    readyState: video.readyState,
                    networkState: video.networkState
                  });
                  
                  // Try to unmute and set volume
                  video.muted = false;
                  video.volume = 1.0;
                  
                  // Try to play a bit to test audio
                  video.currentTime = 1;
                  video.play().then(() => {
                    console.log('Video playback started successfully');
                    setTimeout(() => video.pause(), 2000);
                  }).catch(err => {
                    console.error('Video playback failed:', err);
                  });
                }
              }}
              className="mt-2 px-3 py-1 bg-yellow-600 text-white rounded text-xs hover:bg-yellow-700"
            >
              Test Video & Audio
            </button>
          </div>
          
          {/* Technical Details (Collapsible) */}
          <details className="bg-gray-50 border border-gray-200 rounded-lg">
            <summary className="cursor-pointer p-3 text-sm font-medium text-gray-700 hover:bg-gray-100">
              🔧 Technical Details (Click to expand)
            </summary>
            <div className="p-3 border-t border-gray-200 text-xs text-gray-600 space-y-1">
              <p><strong>Video URL:</strong> <span className="font-mono break-all">{state.generatedVideoUrl}</span></p>
              <p><strong>Browser:</strong> {navigator.userAgent}</p>
              <p><strong>Note:</strong> If you can download the video and hear audio, but not in the browser preview, this is normal browser behavior for autoplay policies.</p>
            </div>
          </details>
          
          {/* Blockchain Verification Badge */}
          {blockchainTxnId && (
            <BlockchainVerificationBadge
              proof={{
                id: '',
                user_id: user?.id || '',
                content_id: currentVideoId,
                content_type: 'video',
                filename: watch('title') || 'video.mp4',
                file_hash: '', // We don't store this locally, but it's on blockchain
                file_size: null,
                algorand_txn_id: blockchainTxnId,
                algorand_explorer_url: `https://testnet.algoexplorer.io/tx/${blockchainTxnId}`,
                verification_status: 'confirmed',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }}
              showDetails={true}
            />
          )}
        </div>
      )}

      {!state.generatedVideoUrl && (
        <div className="text-center py-8">
          <Video className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No video URL available for preview</p>
        </div>
      )}

      <div className="flex justify-between">
        <button
          type="button"
          onClick={() => setState(prev => ({ ...prev, step: 'video_form' }))}
          className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Edit</span>
        </button>
        <div className="space-x-3">
          <button
            type="button"
            onClick={() => {
              // Regenerate video
              setState(prev => ({ ...prev, step: 'video_form' }));
            }}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Regenerate
          </button>
          <button
            type="button"
            onClick={() => navigate('/dashboard/my-videos')}
            className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            <Check className="h-4 w-4" />
            <span>Confirm & Save</span>
          </button>
        </div>
      </div>
    </div>
    );
  };

  const renderGenerating = () => (
    <div className="text-center py-12">
      <div className="max-w-md mx-auto">
        {/* Loading animation */}
        <div className="relative mb-8">
          <div className="mx-auto w-20 h-20 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          <Video className="absolute inset-0 m-auto w-8 h-8 text-purple-600" />
        </div>

        <h3 className="text-2xl font-semibold text-gray-900 mb-4">
          Generating Your Video
        </h3>
        
        <p className="text-gray-600 mb-6">
          Please wait while we create your personalized video. This process typically takes 1-3 minutes.
        </p>

        {state.videoGenerationProgress && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-blue-800 text-sm">
              {state.videoGenerationProgress}
            </p>
            {state.videoGenerationProgress.includes('ready') && (
              <div className="mt-3">
                <button
                  onClick={async () => {
                    if (!user?.id || !tavusClient) {
                      toast.error('Unable to check video status. Please refresh the page.');
                      return;
                    }
                    
                    try {
                      // Get the current video ID from the database or stored state
                      const { data: videoRecord } = await supabase
                        .from('videos')
                        .select('*')
                        .eq('user_id', user.id)
                        .order('created_at', { ascending: false })
                        .limit(1)
                        .single();
                        
                      if (videoRecord && videoRecord.video_url && videoRecord.video_url.startsWith('tavus:')) {
                        const tavusVideoId = videoRecord.video_url.replace('tavus:', '');
                        const videoDetails = await tavusClient.getVideo(tavusVideoId);
                        
                        const videoUrl = videoDetails.video_url || videoDetails.download_url;
                        if (videoUrl) {
                          // Update database with final URL
                          await supabase
                            .from('videos')
                            .update({
                              status: 'completed',
                              video_url: videoUrl,
                            })
                            .eq('id', videoRecord.id);
                            
                          // Move to preview
                          setState(prev => ({
                            ...prev,
                            step: 'preview',
                            generatedVideoUrl: videoUrl
                          }));
                          
                          toast.success('Video ready for preview!');
                        } else {
                          toast.error('Video ready but URL not available yet. Please wait a moment.');
                        }
                      }
                    } catch (error) {
                      console.error('Error checking video status:', error);
                      toast.error('Failed to check video status. Please try again.');
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                >
                  Video Ready - Continue to Preview
                </button>
              </div>
            )}
          </div>
        )}

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="bg-yellow-100 rounded-full p-1">
                <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="text-left">
              <h4 className="text-sm font-medium text-yellow-800">Please don't close this page</h4>
              <p className="text-sm text-yellow-700">
                We're processing your video and will update you once it's ready. Closing this page may interrupt the process.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (state.step) {
      case 'type_selection':
        return renderTypeSelection();
      case 'replica_selection':
        return renderReplicaSelection();
      case 'replica_creation':
        return renderReplicaCreation();
      case 'video_upload':
        return renderVideoUpload();
      case 'video_form':
        return renderVideoForm();
      case 'generating':
        return renderGenerating();
      case 'preview':
        return renderPreview();
      default:
        return renderTypeSelection();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-8 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/dashboard/create')}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              title="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 flex items-center">
                <Video className="h-8 w-8 mr-3 text-purple-600" />
                Create Video
              </h2>
              <p className="mt-1 text-gray-600">
                {state.step === 'type_selection' && 'Choose how you want to create your video'}
                {state.step === 'replica_selection' && 'Select your presenter'}
                {state.step === 'video_form' && 'Configure your video content'}
                {state.step === 'generating' && 'Processing your video...'}
                {state.step === 'preview' && 'Review your generated video'}
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={state.step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderCurrentStep()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Info Section */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Video Creation Info */}
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="bg-blue-100 rounded-full p-2">
                  <Video className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900">Video Creation Process</h4>
                <p className="text-sm text-gray-600 mt-1">
                  {state.creationType === 'personal_replica' && 
                    'Personal replicas require training footage. Videos generated with your replica will look and sound like you.'}
                  {state.creationType === 'stock_replica' && 
                    'Stock replicas are ready to use immediately. Choose from professional presenters with different styles.'}
                  {state.creationType === 'upload' && 
                    'Upload your own video content directly to share with the community.'}
                  {!state.creationType && 
                    'Choose your creation method to get started. Each option offers different benefits for your content.'}
                </p>
              </div>
            </div>

            {/* Blockchain Protection Info */}
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="bg-green-100 rounded-full p-2">
                  <Shield className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900">Blockchain Protection</h4>
                <p className="text-sm text-gray-600 mt-1">
                  All content is automatically registered on the Algorand blockchain, providing immutable proof of ownership and authenticity. Your creativity is protected.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CreateVideo;