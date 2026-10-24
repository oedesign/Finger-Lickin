"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

type DialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
};

export function Dialog({
  children,
  description,
  onOpenChange,
  open,
  title,
}: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) {
      return;
    }

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      aria-describedby={description ? descriptionId : undefined}
      aria-labelledby={titleId}
      className="rounded-panel border-border bg-surface text-ink shadow-panel backdrop:bg-ink/60 m-auto max-h-[min(90dvh,48rem)] w-[calc(100%-2rem)] max-w-lg overflow-y-auto border p-0 backdrop:backdrop-blur-sm"
      onCancel={(event) => {
        event.preventDefault();
        onOpenChange(false);
      }}
      onClose={() => {
        if (open) {
          onOpenChange(false);
        }
      }}
      ref={dialogRef}
    >
      <div className="p-6 sm:p-8">
        <div className="flex items-start justify-between gap-5">
          <div className="grid gap-2">
            <h2
              className="font-display text-ink text-2xl leading-tight sm:text-3xl"
              id={titleId}
            >
              {title}
            </h2>
            {description ? (
              <p className="text-muted text-sm leading-6" id={descriptionId}>
                {description}
              </p>
            ) : null}
          </div>
          <Button
            aria-label="Close dialog"
            autoFocus
            className="shrink-0"
            onClick={() => onOpenChange(false)}
            size="icon"
            variant="ghost"
          >
            <svg
              aria-hidden="true"
              className="size-5"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                d="m6 6 12 12M18 6 6 18"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="1.8"
              />
            </svg>
          </Button>
        </div>
        <div className="mt-6">{children}</div>
      </div>
    </dialog>
  );
}
