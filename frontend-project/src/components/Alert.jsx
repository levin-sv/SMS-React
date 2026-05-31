import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

const config = {
  success: {
    className: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    Icon: CheckCircle2,
  },
  error: {
    className: 'border-red-200 bg-red-50 text-red-900',
    Icon: AlertCircle,
  },
  info: {
    className: 'border-primary-200 bg-primary-50 text-primary-900',
    Icon: Info,
  },
};

export default function Alert({ type = 'info', message, onClose }) {
  if (!message) return null;
  const { className, Icon } = config[type] || config.info;
  return (
    <div role="alert" className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-sm ${className}`}>
      <Icon className="mt-0.5 h-5 w-5 shrink-0" strokeWidth={2} />
      <span className="flex-1 pt-0.5">{message}</span>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded p-1 opacity-60 transition hover:bg-black/5 hover:opacity-100"
          aria-label="Dismiss"
        >
          ×
        </button>
      )}
    </div>
  );
}
