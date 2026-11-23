import Link from "next/link";
import { Star } from "lucide-react";

import { authLinkClass } from "@/components/auth/auth-layout";
import { LegalLinks } from "@/components/legal/legal-links";

/** Where people reach the project until there's a real contact address. */
export const CONTACT_URL = "https://github.com/jameshuangcoding/guava/issues";
export const SECURITY_URL =
  "https://github.com/jameshuangcoding/guava/security";

/** A readable single column for the Terms and Privacy pages. */
export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  /** "Last updated" date, e.g. "November 22, 2026". */
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-background">
      <div className="mx-auto flex w-full max-w-[720px] flex-col gap-8 px-6 py-10">
        <Link href="/" className="flex w-fit items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground [&_svg]:size-4">
            <Star className="fill-current" strokeWidth={1.5} />
          </span>
          <span className="text-base font-semibold">guava</span>
        </Link>

        <div
          role="note"
          className="rounded-lg border border-warning/40 bg-warning/10 px-4 py-3 text-[13px] leading-normal"
        >
          <strong className="font-semibold">Draft.</strong> This text is a draft
          and hasn’t been reviewed by the project owner or a lawyer yet. It may
          change before launch.
        </div>

        <header>
          <h1 className="text-[32px] leading-tight font-semibold tracking-[-0.02em]">
            {title}
          </h1>
          <p className="mt-1.5 text-sm text-ink-3">Last updated {updated}</p>
        </header>

        <article className="flex flex-col gap-6 leading-relaxed text-ink-2 [&_a]:font-medium [&_a]:text-primary-text [&_a]:underline [&_a]:underline-offset-3 [&_h2]:mb-2 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-foreground [&_li]:mt-1.5 [&_p+p]:mt-3 [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:pl-5">
          {children}
        </article>

        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6 text-[13px] text-ink-3">
          <Link href="/login" className={authLinkClass}>
            Back to guava
          </Link>
          <LegalLinks />
        </footer>
      </div>
    </div>
  );
}
