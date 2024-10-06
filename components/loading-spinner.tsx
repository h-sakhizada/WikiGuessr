import React from "react";
import { cva } from "class-variance-authority";

const spinnerVariants = cva(
  "border-4 border-t-gray-900 border-r-gray-900 border-b-gray-900 border-l-gray-200 border-solid rounded-full animate-spin",
  {
    variants: {
      size: {
        sm: "w-6 h-6",
        md: "w-10 h-10",
        lg: "w-16 h-16",
      },
    },
    defaultVariants: {
      size: "lg",
    },
  }
);

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size, className }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className={spinnerVariants({ size, className })} />
    </div>
  );
};

export default LoadingSpinner;
