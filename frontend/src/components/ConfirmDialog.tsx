'use client';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'OK',
  cancelText = 'Cancel',
  type = 'danger'
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const bgColor = 
    type === 'danger' ? 'from-red-500 to-red-600' :
    type === 'warning' ? 'from-yellow-500 to-yellow-600' :
    'from-blue-500 to-blue-600';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-fade-in">
        {/* Header with gradient */}
        <div className={`bg-gradient-to-r ${bgColor} px-6 py-4 text-white`}>
          <h3 className="text-xl font-bold text-center">{title}</h3>
        </div>
        
        {/* Content */}
        <div className="p-6">
          <p className="text-center text-gray-700 text-lg leading-relaxed">
            {message}
          </p>
        </div>
        
        {/* Actions */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-6 py-3 rounded-lg font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-6 py-3 rounded-lg font-medium text-white bg-gradient-to-r ${bgColor} hover:opacity-90 transition shadow-lg`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
