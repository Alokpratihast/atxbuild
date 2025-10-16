"use client";

import React, { LabelHTMLAttributes } from "react";
import { clsx } from "clsx";

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {}

export const Label: React.FC<LabelProps> = ({ className, ...props }) => {
  return (
    <label
      {...props}
      className={clsx("block text-sm font-medium mb-1", className)}
    />
  );
};
