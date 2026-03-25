import Spinner from './Spinner';

const variants = {
  primary:   'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-blue-300',
  secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-800 disabled:opacity-50',
  danger:    'bg-red-600 hover:bg-red-700 text-white disabled:opacity-50',
  ghost:     'bg-transparent hover:bg-gray-100 text-gray-700 disabled:opacity-50',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  ...props
}) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center gap-2 font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  );
}
