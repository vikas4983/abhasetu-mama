import { CheckCircle2, X } from 'lucide-react';

interface ToastProps {
  message: string;
  onClose: () => void;
}

export function Toast({ message, onClose }: ToastProps) {
  return (
    <div className="toast" role="status" aria-live="polite">
      <CheckCircle2 className="small-icon" aria-hidden="true" />
      <span>{message}</span>
      <button type="button" onClick={onClose} aria-label="Dismiss notification">
        <X className="small-icon" aria-hidden="true" />
      </button>
    </div>
  );
}
