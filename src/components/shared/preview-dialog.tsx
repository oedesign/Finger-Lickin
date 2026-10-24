"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";

export function PreviewDialog() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)} size="sm" variant="ghost">
        About this preview
      </Button>
      <Dialog
        description="This screen demonstrates the visual and interaction foundations, not a live ordering service."
        onOpenChange={setOpen}
        open={open}
        title="A thoughtful start"
      >
        <p className="text-muted text-sm leading-6">
          Finger-Lickin is being built for customers, independent restaurant
          teams, and the people who keep the marketplace running. Ordering,
          accounts, and operations will arrive in later phases.
        </p>
        <div className="mt-6 flex justify-end">
          <Button onClick={() => setOpen(false)} variant="secondary">
            Got it
          </Button>
        </div>
      </Dialog>
    </>
  );
}
