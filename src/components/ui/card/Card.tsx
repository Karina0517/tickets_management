import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

interface CardBodyProps {
  children: ReactNode;
  className?: string;
}

interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

export default function Card({ 
  children, 
  className = "", 
  onClick,
  hover = false 
}: CardProps) {
  return (
    <div
      className={`
        bg-white rounded-lg shadow-md border border-gray-200
        ${hover ? "hover:shadow-lg transition-shadow cursor-pointer" : ""}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "" }: CardHeaderProps) {
  return (
    <div className={`px-4 py-3 border-b border-gray-200 ${className}`}>
      {children}
    </div>
  );
}

export function CardBody({ children, className = "" }: CardBodyProps) {
  return <div className={`px-4 py-4 ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = "" }: CardFooterProps) {
  return (
    <div className={`px-4 py-3 border-t border-gray-100 bg-gray-50 rounded-b-lg ${className}`}>
      {children}
    </div>
  );
}