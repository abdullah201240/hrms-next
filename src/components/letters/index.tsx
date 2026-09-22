"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Printer, X } from "lucide-react";
import { getLetterType, type HRLetter } from "@/lib/letters";
import {
  OfferLetter,
  AppointmentLetter,
  ConfirmationLetter,
  PromotionLetter,
  SalaryLetter,
  RelievingLetter,
  DefaultLetter,
} from "./templates-employment";
import {
  WarningLetter,
  FirstWarningLetter,
  FinalWarningLetter,
  SuspensionLetter,
  DomesticInquiryLetter,
  InquiryCommitteeLetter,
} from "./templates-discipline";

/**
 * Letters render dispatcher + print dialog. A letter is bespoke multi-page
 * content (not a doctype in the print-format registry), so instead of the
 * generic PrintButton we render the matching template directly and reuse the
 * exact same #print-portal isolation mechanism (see print-dialog.tsx and the
 * @media print rules in globals.css) to produce the printed / PDF sheet.
 */
export function renderLetter(letter: HRLetter): React.ReactNode {
  const cfg = getLetterType(letter.type);
  switch (cfg?.template) {
    case "offer":
      return <OfferLetter letter={letter} />;
    case "appointment":
      return <AppointmentLetter letter={letter} />;
    case "confirmation":
      return <ConfirmationLetter letter={letter} />;
    case "promotion":
      return <PromotionLetter letter={letter} />;
    case "salary":
      return <SalaryLetter letter={letter} />;
    case "relieving":
      return <RelievingLetter letter={letter} />;
    case "warning":
      return <WarningLetter letter={letter} />;
    case "first-warning":
      return <FirstWarningLetter letter={letter} />;
    case "final-warning":
      return <FinalWarningLetter letter={letter} />;
    case "suspension":
      return <SuspensionLetter letter={letter} />;
    case "domestic-inquiry":
      return <DomesticInquiryLetter letter={letter} />;
    case "inquiry-committee":
      return <InquiryCommitteeLetter letter={letter} />;
    default:
      return <DefaultLetter letter={letter} typeName={cfg?.name ?? "Official Letter"} />;
  }
}

export function LetterPrintButton({
  letter,
  variant = "ghost",
  size = "sm",
  label = "Print",
  className,
}: {
  letter: HRLetter;
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "sm" | "default" | "icon";
  label?: string | null;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const cfg = getLetterType(letter.type);
  const rendered = renderLetter(letter);

  return (
    <>
      <Button variant={variant} size={size} className={className} onClick={() => setOpen(true)}>
        <Printer />
        {label}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[92vw] sm:max-w-[880px]">
          <DialogHeader>
            <DialogTitle>Print: {cfg?.name ?? "Letter"}</DialogTitle>
            <DialogDescription>Preview the letter, then print or save as PDF.</DialogDescription>
          </DialogHeader>

          {/* A4 preview — screen only. The paper copy is portalled below. */}
          <div className="max-h-[62vh] overflow-y-auto bg-neutral-200 py-4 dark:bg-neutral-800">
            <div className="origin-top scale-[0.72] sm:scale-90">{rendered}</div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              <X /> Close
            </Button>
            <Button onClick={() => window.print()}>
              <Printer /> Print / Save as PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Print-only A4 copy — a direct child of <body>, hidden on screen and
          isolated by the @media print rules (globals.css PRINT block). */}
      {open &&
        typeof document !== "undefined" &&
        createPortal(<div id="print-portal" className="hidden">{rendered}</div>, document.body, "print-portal")}
    </>
  );
}
