"use client";

import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";
import { Spinner } from "./spinner";

export const buttonVariants = cva(
  "relative inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg border font-medium text-sm outline-none transition-all disabled:pointer-events-none disabled:opacity-60 data-loading:select-none data-loading:text-transparent focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    defaultVariants: {
      size: "default",
      variant: "default",
    },
    variants: {
      size: {
        default: "h-10 px-4",
        icon: "size-10",
        "icon-lg": "size-11",
        "icon-sm": "size-9",
        "icon-xl": "size-12",
        "icon-xs": "size-8 rounded-md",
        lg: "h-11 px-5",
        sm: "h-9 gap-1.5 px-3",
        xl: "h-12 px-6 text-base",
        xs: "h-8 gap-1 rounded-md px-2.5 text-xs",
      },
      variant: {
        default:
          "border-green-700 bg-green-700 text-white shadow-sm hover:bg-green-800",
        destructive:
          "border-red-600 bg-red-600 text-white shadow-sm hover:bg-red-700",
        "destructive-outline":
          "border-red-200 bg-white text-red-700 hover:bg-red-50",
        ghost:
          "border-transparent bg-transparent text-slate-900 hover:bg-slate-100",
        link:
          "border-transparent bg-transparent text-slate-900 underline-offset-4 hover:underline",
        outline:
          "border-slate-300 bg-white text-slate-900 hover:bg-slate-50",
        secondary:
          "border-transparent bg-slate-200 text-slate-900 hover:bg-slate-300",
      },
    },
  }
);

export function Button({
  className,
  variant,
  size,
  render,
  children,
  loading = false,
  disabled: disabledProp,
  ...props
}) {
  const isDisabled = Boolean(loading || disabledProp);
  const typeValue = render ? undefined : "button";

  const defaultProps = {
    children: (
      <>
        {children}
        {loading && (
          <Spinner
            className="pointer-events-none absolute size-4"
            data-slot="button-loading-indicator"
          />
        )}
      </>
    ),
    className: cn(buttonVariants({ className, size, variant })),
    "aria-disabled": loading || undefined,
    "data-loading": loading ? "" : undefined,
    "data-slot": "button",
    disabled: isDisabled,
    type: typeValue,
  };

  return useRender({
    defaultTagName: "button",
    props: mergeProps(defaultProps, props),
    render,
  });
}