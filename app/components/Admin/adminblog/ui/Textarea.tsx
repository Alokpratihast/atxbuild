"use client";

import React, { TextareaHTMLAttributes } from "react";
import { clsx } from "clsx";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea: React.FC<TextareaProps> = ({ className, ...props }) => {
  return (
    <textarea
      {...props}
      className={clsx(
        "border rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500",
        className
      )}
    />
  );
};
