import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import AuthLayout from '../components/AuthLayout';
import FormInput from '../components/FormInput';

interface SignUpFormValues {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const SignUp = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignUpFormValues>();

  const password = watch('password', '');

  const validatePassword = (value: string) => {
    if (value.length < 8) return "Password must be at least 8 characters";
    if (!/[A-Z]/.test(value)) return "Password must contain at least one uppercase letter";
    if (!/[a-z]/.test(value)) return "Password must contain at least one lowercase letter";
    if (!/[0-9]/.test(value)) return "Password must contain at least one number";
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) return "Password must contain at least one special character";
    return true;
  };

  const onSubmit = async (data: SignUpFormValues) => {
    setIsLoading(true);
    try {
      const { error } = await signUp(data.email, data.password, data.username);
      
      if (error) {
        toast.error(error.message || 'Failed to create account');
        return;
      }
      
      toast.success('Account created successfully! Please check your email to verify your account.');
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
      title="Create an Account"
      subtitle="Secure Authentication System"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <FormInput
          id="username"
          label="Username"
          type="text"
          register={register}
          registerOptions={{
            required: 'Username is required',
            minLength: {
              value: 3,
              message: 'Username must be at least 3 characters',
            },
          }}
          error={errors.username}
          placeholder="johndoe"
          autoComplete="username"
        />

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

        <FormInput
          id="password"
          label="Password"
          type="password"
          register={register}
          registerOptions={{
            required: 'Password is required',
            validate: validatePassword
          }}
          error={errors.password}
          placeholder="••••••••"
          autoComplete="new-password"
        />

        <FormInput
          id="confirmPassword"
          label="Confirm Password"
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
              Creating account...
            </>
          ) : (
            'Sign up'
          )}
        </motion.button>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              Sign in
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
};

export default SignUp;