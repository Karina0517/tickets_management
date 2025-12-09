import { ButtonHTMLAttributes, ReactNode } from "react";
import s from "./button.module.css"; 

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger" | "success" | "outline";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  fullWidth?: boolean;
}

export default function Button({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  fullWidth = false,
  className = "",
  disabled,
  ...props
}: ButtonProps) {

  const classes = [
    s.btn,
    s[variant],
    s[size],
    fullWidth ? s.fullWidth : "",
    isLoading ? s.loading : "",
    className
  ].filter(Boolean).join(" ");

  return (
    <button className={classes} disabled={disabled || isLoading} {...props}>
      {isLoading && (
        <svg className={s.spinner} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
          <circle className="opacity-25" cx="12" cy="12" r="10" strokeOpacity="0.25" />
          <path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}