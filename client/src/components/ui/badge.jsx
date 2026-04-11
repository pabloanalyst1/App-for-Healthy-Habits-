"use client";

import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";

export const badgeVariants = cva(
  "relative inline-flex shrink-0 items-center justify-center gap-1 whitespace-nowrap rounded-sm border border-transparent font-medium outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-1 focus-visible:ring-offset-white disabled:pointer-events-none disabled:opacity-64 [&_svg:not([class*='opacity-'])]:opacity-80 [&_svg:not([class*='size-'])]:size-3.5 [&_svg]:pointer-events-none [&_svg]:shrink-0 [button&,a&]:cursor-pointer",
  {
    defaultVariants: {
      size: "default",
      variant: "default",
    },
    variants: {
      size: {
        default:
          "h-6 min-w-6 px-2 text-xs sm:h-5 sm:min-w-5",
        lg: "h-7 min-w-7 px-2.5 text-sm sm:h-6 sm:min-w-6",
        sm: "h-5 min-w-5 rounded-md px-1.5 text-[11px] sm:h-4",
      },
      variant: {
        default:
          "bg-green-600 text-white [button&,a&]:hover:bg-green-700",
        destructive:
          "bg-red-600 text-white [button&,a&]:hover:bg-red-700",
        error:
          "bg-red-50 text-red-700",
        info:
          "bg-blue-50 text-blue-700",
        outline:
          "border-slate-300 bg-white text-slate-900 [button&,a&]:hover:bg-slate-50",
        secondary:
          "bg-slate-200 text-slate-900 [button&,a&]:hover:bg-slate-300",
        success:
          "bg-green-50 text-green-700",
        warning:
          "bg-amber-50 text-amber-700",
      },
    },
  }
);

export function Badge({
  className,
  variant,
  size,
  render,
  ...props
}) {
  const defaultProps = {
    className: cn(badgeVariants({ className, size, variant })),
    "data-slot": "badge",
  };

  return useRender({
    defaultTagName: "span",
    props: mergeProps(defaultProps, props),
    render,
  });
}