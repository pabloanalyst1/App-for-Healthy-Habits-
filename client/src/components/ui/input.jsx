"use client";

import { Input as InputPrimitive } from "@base-ui/react/input";
import { cn } from "../../lib/utils";

export function Input({
  className,
  size = "default",
  unstyled = false,
  nativeInput = false,
  type = "text",
  ...props
}) {
  const inputClassName = cn(
    "h-10 w-full min-w-0 rounded-[inherit] px-3 leading-10 outline-none bg-transparent placeholder:text-slate-400 sm:h-9 sm:leading-9",
    size === "sm" && "h-9 px-2.5 leading-9 sm:h-8 sm:leading-8",
    size === "lg" && "h-11 leading-11 sm:h-10 sm:leading-10",
    type === "search" &&
      "[&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none [&::-webkit-search-results-button]:appearance-none [&::-webkit-search-results-decoration]:appearance-none",
    type === "file" &&
      "text-slate-500 file:me-3 file:bg-transparent file:font-medium file:text-slate-900 file:text-sm"
  );

  return (
    <span
      className={
        cn(
          !unstyled &&
            "relative inline-flex w-full rounded-xl border border-slate-300 bg-white text-base text-slate-900 shadow-sm transition-shadow has-focus-visible:border-green-500 has-focus-visible:ring-4 has-focus-visible:ring-green-100 has-disabled:opacity-60 sm:text-sm",
          className
        ) || undefined
      }
      data-size={size}
      data-slot="input-control"
    >
      {nativeInput ? (
        <input
          className={inputClassName}
          data-slot="input"
          size={typeof size === "number" ? size : undefined}
          type={type}
          {...props}
        />
      ) : (
        <InputPrimitive
          className={inputClassName}
          data-slot="input"
          size={typeof size === "number" ? size : undefined}
          type={type}
          {...props}
        />
      )}
    </span>
  );
}

export { InputPrimitive };