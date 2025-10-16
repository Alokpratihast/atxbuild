"use client";

import React, { InputHTMLAttributes, forwardRef } from "react";
import { clsx } from "clsx";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => {
  return (
    <input
      {...props}
      ref={ref}
      className={clsx(
        "border rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500",
        className
      )}
    />
  );
});

Input.displayName = "Input";
