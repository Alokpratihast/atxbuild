"use client";

import React, { forwardRef, TextareaHTMLAttributes } from "react";
import { clsx } from "clsx";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        {...props}
        className={clsx(
          "border rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500",
          className
        )}
      />
    );
  }
);

// ✅ Add display name for debugging and React DevTools clarity
Textarea.displayName = "Textarea";
