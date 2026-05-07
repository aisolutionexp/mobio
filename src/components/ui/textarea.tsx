"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  autoResize?: boolean;
  showCount?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    { className, autoResize, showCount, maxLength, onChange, ...props },
    ref,
  ) => {
    const innerRef = React.useRef<HTMLTextAreaElement | null>(null);
    const [charCount, setCharCount] = React.useState(0);

    const setRefs = React.useCallback(
      (node: HTMLTextAreaElement | null) => {
        innerRef.current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current =
            node;
        }
      },
      [ref],
    );

    const resize = React.useCallback(() => {
      const el = innerRef.current;
      if (!el || !autoResize) return;
      el.style.height = "auto";
      el.style.height = `${Math.max(el.scrollHeight, 80)}px`;
    }, [autoResize]);

    React.useEffect(() => {
      resize();
    }, [resize]);

    const handleChange = React.useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setCharCount(e.target.value.length);
        resize();
        onChange?.(e);
      },
      [onChange, resize],
    );

    const nearLimit = maxLength != null && charCount > maxLength * 0.9;

    return (
      <div className="relative">
        <textarea
          ref={setRefs}
          maxLength={maxLength}
          onChange={handleChange}
          className={cn(
            "placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground border-input flex min-h-[80px] w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:opacity-50 md:text-sm",
            "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-3",
            "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 aria-invalid:ring-3",
            autoResize && "resize-none overflow-hidden",
            className,
          )}
          {...props}
        />
        {showCount && maxLength != null && (
          <span
            aria-live={nearLimit ? "polite" : "off"}
            className={cn(
              "text-muted-foreground absolute right-3 bottom-2 text-xs tabular-nums",
              nearLimit && "text-warning-foreground",
            )}
          >
            {charCount}/{maxLength}
          </span>
        )}
      </div>
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
export type { TextareaProps };
