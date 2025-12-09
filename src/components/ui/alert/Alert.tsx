import { ReactNode } from "react";

type AlertVariant = "success" | "error" | "warning" | "info";

interface AlertProps {
  children: ReactNode;
  variant?: AlertVariant;
  onClose?: () => void;
  className?: string;
}

const variantStyles: Record<AlertVariant, string> = {
  success: "bg-green-50 text-green-800 border-green-200",
  error: "bg-red-50 text-red-800 border-red-200",
  warning: "bg-yellow-50 text-yellow-800 border-yellow-200",
  info: "bg-blue-50 text-blue-800 border-blue-200",
};

const icons: Record<AlertVariant, string> = {
  success: "✓",
  error: "✕",
  warning: "⚠",
  info: "ℹ",
};

export default function Alert({
  children,
  variant = "info",
  onClose,
  className = "",
}: AlertProps) {
  return (
    <div
      className={`
        ${variantStyles[variant]}
        border rounded-lg p-4
        flex items-start gap-3
        ${className}
      `}
    >
      <span className="text-lg">{icons[variant]}</span>
      <div className="flex-1">{children}</div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-current opacity-70 hover:opacity-100"
        >
          ✕
        </button>
      )}
    </div>
  );
}