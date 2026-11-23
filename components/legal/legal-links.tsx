import Link from "next/link";

import { cn } from "@/lib/utils";

/** "Terms · Privacy" for the auth and legal page footers. */
export function LegalLinks({ className }: { className?: string }) {
  return (
    <nav
      aria-label="Legal"
      className={cn("flex items-center gap-2 text-xs text-ink-3", className)}
    >
      <Link href="/terms" className="hover:text-foreground hover:underline">
        Terms of Service
      </Link>
      <span aria-hidden>·</span>
      <Link href="/privacy" className="hover:text-foreground hover:underline">
        Privacy Policy
      </Link>
    </nav>
  );
}
