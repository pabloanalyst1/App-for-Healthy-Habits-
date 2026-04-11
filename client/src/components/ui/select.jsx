"use client";

import { mergeProps } from "@base-ui/react/merge-props";
import { Select as SelectPrimitive } from "@base-ui/react/select";
import { useRender } from "@base-ui/react/use-render";
import { cva } from "class-variance-authority";
import {
  ChevronDownIcon,
  ChevronsUpDownIcon,
  ChevronUpIcon,
} from "lucide-react";
import { cn } from "../../lib/utils";

export const Select = SelectPrimitive.Root;

export const selectTriggerVariants = cva(
  "relative inline-flex min-h-10 w-full min-w-36 select-none items-center justify-between gap-2 rounded-xl border border-slate-300 bg-white px-3 text-left text-base text-slate-900 shadow-sm outline-none transition-shadow focus-visible:border-green-500 focus-visible:ring-4 focus-visible:ring-green-100 aria-invalid:border-red-300 data-disabled:pointer-events-none data-disabled:opacity-60 sm:min-h-9 sm:text-sm [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    defaultVariants: {
      size: "default",
    },
    variants: {
      size: {
        default: "",
        lg: "min-h-11 sm:min-h-10",
        sm: "min-h-9 gap-1.5 px-2.5 sm:min-h-8",
      },
    },
  }
);

export const selectTriggerIconClassName = "-me-1 size-4 opacity-80";

export function SelectButton({
  className,
  size,
  render,
  children,
  ...props
}) {
  const typeValue = render ? undefined : "button";

  const defaultProps = {
    children: (
      <>
        <span className="flex-1 truncate data-[placeholder]:text-slate-400">
          {children}
        </span>
        <ChevronsUpDownIcon className={selectTriggerIconClassName} />
      </>
    ),
    className: cn(selectTriggerVariants({ size }), "min-w-0", className),
    "data-slot": "select-button",
    type: typeValue,
  };

  return useRender({
    defaultTagName: "button",
    props: mergeProps(defaultProps, props),
    render,
  });
}

export function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}) {
  return (
    <SelectPrimitive.Trigger
      className={cn(selectTriggerVariants({ size }), className)}
      data-slot="select-trigger"
      {...props}
    >
      {children}
      <SelectPrimitive.Icon data-slot="select-icon">
        <ChevronsUpDownIcon className={selectTriggerIconClassName} />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

export function SelectValue({ className, ...props }) {
  return (
    <SelectPrimitive.Value
      className={cn("flex-1 truncate data-placeholder:text-slate-400", className)}
      data-slot="select-value"
      {...props}
    />
  );
}

export function SelectPopup({
  className,
  children,
  side = "bottom",
  sideOffset = 4,
  align = "start",
  alignOffset = 0,
  alignItemWithTrigger = true,
  anchor,
  ...props
}) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner
        align={align}
        alignItemWithTrigger={alignItemWithTrigger}
        alignOffset={alignOffset}
        anchor={anchor}
        className="z-50 select-none"
        data-slot="select-positioner"
        side={side}
        sideOffset={sideOffset}
      >
        <SelectPrimitive.Popup
          className="origin-[var(--transform-origin)] text-slate-900 outline-none"
          data-slot="select-popup"
          {...props}
        >
          <SelectPrimitive.ScrollUpArrow
            className="flex h-6 w-full cursor-default items-center justify-center"
            data-slot="select-scroll-up-arrow"
          >
            <ChevronUpIcon className="size-4" />
          </SelectPrimitive.ScrollUpArrow>

          <div className="relative h-full min-w-[var(--anchor-width)] rounded-xl border border-slate-200 bg-white shadow-lg">
            <SelectPrimitive.List
              className={cn("max-h-[var(--available-height)] overflow-y-auto p-1", className)}
              data-slot="select-list"
            >
              {children}
            </SelectPrimitive.List>
          </div>

          <SelectPrimitive.ScrollDownArrow
            className="flex h-6 w-full cursor-default items-center justify-center"
            data-slot="select-scroll-down-arrow"
          >
            <ChevronDownIcon className="size-4" />
          </SelectPrimitive.ScrollDownArrow>
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  );
}

export function SelectItem({ className, children, ...props }) {
  return (
    <SelectPrimitive.Item
      className={cn(
        "grid min-h-9 cursor-default grid-cols-[1rem_1fr] items-center gap-2 rounded-md py-2 ps-2 pe-4 text-sm outline-none data-disabled:pointer-events-none data-highlighted:bg-green-50 data-highlighted:text-green-700 data-disabled:opacity-60",
        className
      )}
      data-slot="select-item"
      {...props}
    >
      <SelectPrimitive.ItemIndicator className="col-start-1">
        <svg
          aria-hidden="true"
          fill="none"
          height="24"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          width="24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M5.252 12.7 10.2 18.63 18.748 5.37" />
        </svg>
      </SelectPrimitive.ItemIndicator>

      <SelectPrimitive.ItemText className="col-start-2 min-w-0">
        {children}
      </SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}

export function SelectSeparator({ className, ...props }) {
  return (
    <SelectPrimitive.Separator
      className={cn("mx-2 my-1 h-px bg-slate-200", className)}
      data-slot="select-separator"
      {...props}
    />
  );
}

export function SelectGroup(props) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />;
}

export function SelectLabel({ className, ...props }) {
  return (
    <SelectPrimitive.Label
      className={cn(
        "inline-flex cursor-default items-center gap-2 font-medium text-base text-slate-900 sm:text-sm",
        className
      )}
      data-slot="select-label"
      {...props}
    />
  );
}

export function SelectGroupLabel(props) {
  return (
    <SelectPrimitive.GroupLabel
      className="px-2 py-1.5 font-medium text-slate-500 text-xs"
      data-slot="select-group-label"
      {...props}
    />
  );
}

export { SelectPrimitive, SelectPopup as SelectContent };