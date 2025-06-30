import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Shield, Lock, Mail, ChevronRight, Github, Twitter, Mic, Video, Star, CreditCard } from 'lucide-react';
import FormInput from '../components/FormInput';
import BoltBadge from '../components/BoltBadge';

interface LoginFormValues {
  email: string;
  password: string;
}

// Features for the carousel
const features = [
  {
    title: "Blockchain Content Protection",
    description: "Immutable proof of ownership on Algorand blockchain",
    icon: <Shield className="h-8 w-8 text-indigo-400" />
  },
  {
    title: "AI-Powered Video Creation",
    description: "Generate professional videos with Tavus AI technology",
    icon: <Video className="h-8 w-8 text-indigo-400" />
  },
  {
    title: "ElevenLabs Voice Synthesis",
    description: "Create natural-sounding audio content with AI voices",
    icon: <Mic className="h-8 w-8 text-indigo-400" />
  },
  {
    title: "Star Tipping System",
    description: "Support creators with integrated payment system",
    icon: <Star className="h-8 w-8 text-indigo-400" />
  },
  {
    title: "Premium Content Access",
    description: "Unlock exclusive content with star payments",
    icon: <CreditCard className="h-8 w-8 text-indigo-400" />
  }
];

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentFeature, setCurrentFeature] = useState(0);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>();

  // Auto-rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const { error } = await signIn(data.email, data.password);
      
      if (error) {
        toast.error(error.message || 'Failed to sign in');
        return;
      }
      
      toast.success('Successfully signed in!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-gray-900 via-indigo-950 to-purple-900 overflow-hidden relative">
      {/* Bolt.new Badge - Fixed Top Right */}
      <div className="fixed top-4 right-4 z-50">
        <BoltBadge size="lg" />
      </div>
      
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 opacity-10">
          {[...Array(20)].map((_, i) => (
            <div 
              key={i}
              className="absolute rounded-full bg-indigo-500"
              style={{
                width: `${Math.random() * 300 + 50}px`,
                height: `${Math.random() * 300 + 50}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.5,
                filter: 'blur(70px)',
                animation: `float ${Math.random() * 10 + 10}s infinite ease-in-out`,
                animationDelay: `${Math.random() * 5}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Left Panel - Feature Showcase */}
      <motion.div 
        className="hidden md:flex md:w-1/2 p-8 items-center justify-center relative"
        initial={{ opacity: 0, x: -100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="max-w-md w-full">
          <motion.div 
            className="mb-12"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="flex items-center mb-6">
              <motion.div 
                className="w-12 h-12 bg-indigo-600/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-indigo-500/30 shadow-lg mr-4"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <BlockchainShieldLogo isDark={true} />
              </motion.div>
              <motion.h2 
                className="text-3xl font-bold text-white"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <span className="font-['Abril_Fatface',_cursive] italic cursive-flow">Veridica</span>
              </motion.h2>
            </div>
            <motion.p 
              className="text-indigo-200 text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              Secure your creative work with immutable proof of ownership on the Algorand blockchain.
            </motion.p>
          </motion.div>

          {/* Feature Carousel */}
          <motion.div 
            className="bg-indigo-900/30 backdrop-blur-sm border border-indigo-700/30 rounded-2xl p-8 shadow-xl h-80 relative overflow-hidden"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentFeature}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 p-8 flex flex-col justify-center"
              >
                <div className="flex items-center mb-4">
                  {features[currentFeature].icon}
                  <h3 className="text-2xl font-bold text-white ml-3">
                    {features[currentFeature].title}
                  </h3>
                </div>
                <p className="text-indigo-200 text-lg">
                  {features[currentFeature].description}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Feature Navigation Dots */}
            <div className="absolute bottom-6 left-0 right-0 flex justify-center space-x-2">
              {features.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentFeature(index)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    currentFeature === index 
                      ? 'bg-indigo-400 w-8' 
                      : 'bg-indigo-700 hover:bg-indigo-600'
                  }`}
                  aria-label={`Go to feature ${index + 1}`}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Center Brand Section (Mobile Only) */}
      <div className="md:hidden pt-16 pb-8 px-6 text-center">
        <BrandSection />
      </div>

      {/* Right Panel - Login Form */}
      <motion.div 
        className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12"
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="w-full max-w-md">
          {/* Brand Section (Desktop Only) */}
          <div className="hidden md:block mb-12">
            <BrandSection />
          </div>

          <motion.div 
            className="bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/20"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <motion.h2 
              className="text-2xl font-bold text-white mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              Sign In
            </motion.h2>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <motion.div 
                className="space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-300 h-5 w-5" />
                  <input
                    type="email"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address',
                      },
                    })}
                    className="pl-10 w-full px-4 py-3 bg-indigo-900/50 border border-indigo-700 rounded-lg text-white placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Email address"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
                  )}
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-300 h-5 w-5" />
                  <input
                    type="password"
                    {...register('password', {
                      required: 'Password is required',
                    })}
                    className="pl-10 w-full px-4 py-3 bg-indigo-900/50 border border-indigo-700 rounded-lg text-white placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Password"
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
                  )}
                </div>
              </motion.div>

              <motion.div 
                className="flex items-center justify-between"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 1 }}
              >
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-indigo-700 rounded bg-indigo-900/50"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-indigo-200">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <Link to="/forgot-password" className="font-medium text-indigo-300 hover:text-indigo-200 transition-colors">
                    Forgot password?
                  </Link>
                </div>
              </motion.div>

              <motion.button
                type="submit"
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 1.2 }}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </motion.button>

              {/* Social Login Options */}
              <motion.div 
                className="mt-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 1.4 }}
              >
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-indigo-700"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-indigo-900/50 text-indigo-300">Or continue with</span>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    className="w-full inline-flex justify-center py-2.5 px-4 border border-indigo-700 rounded-lg shadow-sm bg-indigo-900/50 text-sm font-medium text-indigo-200 hover:bg-indigo-800/50 transition-colors"
                  >
                    <Github className="h-5 w-5 mr-2" />
                    GitHub
                  </button>
                  <button
                    type="button"
                    className="w-full inline-flex justify-center py-2.5 px-4 border border-indigo-700 rounded-lg shadow-sm bg-indigo-900/50 text-sm font-medium text-indigo-200 hover:bg-indigo-800/50 transition-colors"
                  >
                    <Twitter className="h-5 w-5 mr-2" />
                    Twitter
                  </button>
                </div>
              </motion.div>
            </form>

            <motion.div 
              className="mt-8 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.6 }}
            >
              <p className="text-sm text-indigo-300">
                Don't have an account?{' '}
                <Link to="/signup" className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
                  Sign up
                </Link>
              </p>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

// Animated Brand Section Component
const BrandSection = () => {
  return (
    <div className="relative">
      <motion.div
        className="flex flex-col items-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div 
          className="w-20 h-20 bg-indigo-600/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-indigo-500/30 shadow-lg mb-6"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <BlockchainShieldLogo isDark={true} />
        </motion.div>
        
        <div className="relative">
          <motion.h1 
            className="text-5xl md:text-6xl font-['Abril_Fatface',_cursive] italic text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-indigo-300 tracking-wide relative z-10 cursive-flow"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Veridica
          </motion.h1>
          
          {/* Animated Wave Effect */}
          <div className="absolute inset-0 overflow-hidden">
            <div 
              className="absolute inset-0 opacity-50"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(129, 140, 248, 0.6), transparent)',
                width: '200%',
                animation: 'waveAnimation 3s linear infinite',
              }}
            />
          </div>
          
          {/* Glow Effect */}
          <div className="absolute inset-0 blur-md opacity-30 bg-indigo-400 rounded-full" />
        </div>
        
        <motion.p 
          className="text-indigo-300 mt-4 text-lg"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          Blockchain Content Authenticity
        </motion.p>
      </motion.div>
    </div>
  );
};

// Custom blockchain shield logo component with cursive X
const BlockchainShieldLogo: React.FC<{ isDark: boolean }> = ({ isDark }) => {
  const mainColor = isDark ? '#fff' : '#000';
  const accentColor = isDark ? '#818cf8' : '#4f46e5';
  
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Shield Base */}
      <path 
        d="M20 3L5 9V20C5 28.2843 11.7157 35 20 35C28.2843 35 35 28.2843 35 20V9L20 3Z" 
        stroke={mainColor} 
        strokeWidth="2" 
        fill="none"
      />
      
      {/* Blockchain Nodes */}
      <circle cx="14" cy="16" r="2" fill={accentColor} />
      <circle cx="20" cy="22" r="2" fill={accentColor} />
      <circle cx="26" cy="16" r="2" fill={accentColor} />
      <circle cx="14" cy="28" r="2" fill={accentColor} />
      <circle cx="26" cy="28" r="2" fill={accentColor} />
      
      {/* Blockchain Connections */}
      <line x1="14" y1="16" x2="20" y2="22" stroke={accentColor} strokeWidth="1" />
      <line x1="20" y1="22" x2="26" y2="16" stroke={accentColor} strokeWidth="1" />
      <line x1="14" y1="16" x2="26" y2="16" stroke={accentColor} strokeWidth="1" />
      <line x1="14" y1="28" x2="20" y2="22" stroke={accentColor} strokeWidth="1" />
      <line x1="20" y1="22" x2="26" y2="28" stroke={accentColor} strokeWidth="1" />
      <line x1="14" y1="28" x2="26" y2="28" stroke={accentColor} strokeWidth="1" />
      
      {/* Cursive X in the center */}
      <path 
        d="M17 19C18 20 19 21 20 22C21 21 22 20 23 19" 
        stroke={mainColor} 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        fill="none"
      />
      <path 
        d="M23 25C22 24 21 23 20 22C19 23 18 24 17 25" 
        stroke={mainColor} 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        fill="none"
      />
    </svg>
  );
};

export default Login;