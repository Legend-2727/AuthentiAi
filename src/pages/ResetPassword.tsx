import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import AuthLayout from '../components/AuthLayout';
import FormInput from '../components/FormInput';

interface ResetPasswordFormValues {
  password: string;
  confirmPassword: string;
}

const ResetPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { updatePassword } = useAuth();
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>();

  const password = watch('password', '');

  const onSubmit = async (data: ResetPasswordFormValues) => {
    setIsLoading(true);
    try {
      const { error } = await updatePassword(data.password);
      
      if (error) {
        toast.error(error.message || 'Failed to update password');
        return;
      }
      
      toast.success('Password updated successfully!');
      navigate('/login');
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Set New Password"
      subtitle="Create a strong new password for your account"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <FormInput
          id="password"
          label="New Password"
          type="password"
          register={register}
          registerOptions={{
            required: 'Password is required',
            minLength: {
              value: 8,
              message: 'Password must be at least 8 characters',
            },
            pattern: {
              value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
              message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
            },
          }}
          error={errors.password}
          placeholder="••••••••"
          autoComplete="new-password"
        />

        <FormInput
          id="confirmPassword"
          label="Confirm New Password"
          type="password"
          register={register}
          registerOptions={{
            required: 'Please confirm your password',
            validate: value => value === password || 'Passwords do not match',
          }}
          error={errors.confirmPassword}
          placeholder="••••••••"
          autoComplete="new-password"
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
              Updating password...
            </>
          ) : (
            'Reset Password'
          )}
        </motion.button>
      </form>
    </AuthLayout>
  );
};

export default ResetPassword;