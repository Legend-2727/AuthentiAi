import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import AuthLayout from '../components/AuthLayout';
import FormInput from '../components/FormInput';

interface ForgotPasswordFormValues {
  email: string;
}

const ForgotPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { resetPassword } = useAuth();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>();

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setIsLoading(true);
    try {
      const { error } = await resetPassword(data.email);
      
      if (error) {
        toast.error(error.message || 'Failed to send reset email');
        return;
      }
      
      setEmailSent(true);
      toast.success('Password reset email sent!');
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Reset Your Password"
      subtitle="We'll send you an email with a link to reset your password"
    >
      {emailSent ? (
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-green-50 p-4 rounded-md mb-6">
            <p className="text-green-700">
              We've sent you an email with a link to reset your password. Please check your inbox.
            </p>
          </div>
          <Link to="/login" className="inline-block text-indigo-600 hover:text-indigo-500 font-medium">
            Return to login
          </Link>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <FormInput
            id="email"
            label="Email Address"
            type="email"
            register={register}
            registerOptions={{
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address',
              },
            }}
            error={errors.email}
            placeholder="you@example.com"
            autoComplete="email"
          />

          <motion.button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white\" xmlns="http://www.w3.org/2000/svg\" fill="none\" viewBox="0 0 24 24">
                  <circle className="opacity-25\" cx="12\" cy="12\" r="10\" stroke="currentColor\" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              </>
            ) : (
              'Send Reset Link'
            )}
          </motion.button>

          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              Remember your password?{' '}
              <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                Sign in
              </Link>
            </p>
          </div>
        </form>
      )}
    </AuthLayout>
  );
};

export default ForgotPassword;