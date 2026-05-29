import { X, AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import { Button } from "./button"; 

export type MessageBoxType = "info" | "success" | "warning" | "danger";

interface MessageBoxProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: MessageBoxType;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  isLoading?: boolean;
}

const typeConfig = {
  info: {
    icon: Info,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    btnClass: "bg-blue-600 hover:bg-blue-700",
  },
  success: {
    icon: CheckCircle2,
    color: "text-green-600",
    bgColor: "bg-green-100",
    btnClass: "bg-green-600 hover:bg-green-700",
  },
  warning: {
    icon: AlertTriangle,
    color: "text-amber-600",
    bgColor: "bg-amber-100",
    btnClass: "bg-amber-600 hover:bg-amber-700",
  },
  danger: {
    icon: XCircle,
    color: "text-red-600",
    bgColor: "bg-red-100",
    btnClass: "bg-red-600 hover:bg-red-700",
  },
};

export function MessageBox({
  isOpen,
  onClose,
  title,
  message,
  type = "info",
  cancelText = "Ok",
  isLoading = false,
}: MessageBoxProps) {
  if (!isOpen) return null;

  const Config = typeConfig[type];
  const Icon = Config.icon;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${Config.bgColor} ${Config.color}`}>
              <Icon className="w-6 h-6" />
            </div>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
              disabled={isLoading}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>
          <p className="text-gray-600 text-sm">{message}</p>
        </div>

        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-100">
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isLoading}
            className=" w-25 bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
          >
            {cancelText}
          </Button>
        </div>
      </div>
    </div>
  );
}