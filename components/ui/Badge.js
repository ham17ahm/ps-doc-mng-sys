const variants = {
  default:    'bg-gray-100 text-gray-700',
  blue:       'bg-blue-100 text-blue-700',
  green:      'bg-green-100 text-green-700',
  yellow:     'bg-yellow-100 text-yellow-700',
  red:        'bg-red-100 text-red-700',
  purple:     'bg-purple-100 text-purple-700',
  queued:     'bg-gray-100 text-gray-600',
  processing: 'bg-blue-100 text-blue-700',
  extracted:  'bg-amber-100 text-amber-700',
  saving:     'bg-purple-100 text-purple-700',
  completed:  'bg-green-100 text-green-700',
  failed:     'bg-red-100 text-red-700',
  en:         'bg-blue-50 text-blue-600',
  ur:         'bg-purple-50 text-purple-700',
  mixed:      'bg-orange-50 text-orange-700',
};

export default function Badge({ children, variant = 'default', className = '' }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${variants[variant] || variants.default} ${className}`}>
      {children}
    </span>
  );
}
