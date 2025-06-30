import { useState } from 'react';
import { UseFormRegister, FieldError, RegisterOptions, FieldValues } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';

interface FormInputProps {
  id: string;
  label: string;
  type: string;
  register: UseFormRegister<FieldValues>;
  error?: FieldError;
  placeholder?: string;
  registerOptions?: RegisterOptions;
  autoComplete?: string;
}

const FormInput = ({
  id,
  label,
  type,
  register,
  error,
  placeholder,
  registerOptions,
  autoComplete,
}: FormInputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const isPassword = type === 'password';

  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
      </label>
      <motion.div
        className={`relative rounded-md shadow-sm ${
          isFocused ? 'ring-2 ring-indigo-500 border-indigo-500' : error ? 'ring-2 ring-red-500 border-red-500' : ''
        }`}
        initial={{ scale: 1 }}
        animate={{ scale: isFocused ? 1.02 : 1 }}
        transition={{ duration: 0.2 }}
      >
        <input
          id={id}
          type={isPassword ? (showPassword ? 'text' : 'password') : type}
          className={`block w-full px-4 py-3 rounded-md border ${
            error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
          } bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-0 ${isPassword ? 'pr-10' : ''}`}
          placeholder={placeholder}
          autoComplete={autoComplete}
          {...register(id, registerOptions)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {isPassword && (
          <button
            type="button"
            className="absolute inset-y-0 right-0 flex items-center pr-3"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            ) : (
              <Eye className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            )}
          </button>
        )}
      </motion.div>
      {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error.message}</p>}
    </div>
  );
};

export default FormInput;