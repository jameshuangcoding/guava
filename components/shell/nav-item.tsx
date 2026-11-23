"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

/**
 * A sidebar link. Shows a tooltip when the sidebar is collapsed. `external`
 * links open in a new tab and are never marked active.
 */
export function NavItem({
  href,
  icon,
  label,
  badge,
  tooltip,
  collapsed,
  external,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  /** Count pill (expanded) / pink dot (collapsed). Hidden when 0. */
  badge?: number;
  tooltip?: string;
  collapsed: boolean;
  /** Open in a new tab as a plain anchor instead of a client-side Link. */
  external?: boolean;
}) {
  const pathname = usePathname();
  const active =
    !external && (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const className = cn(
    "relative flex h-[34px] items-center gap-2.5 rounded-md px-2 transition-colors hover:bg-hover hover:text-foreground [&_svg]:size-4 [&_svg]:flex-none",
    active
      ? "bg-active font-semibold text-foreground"
      : "font-medium text-ink-2",
  );
  const content = (
    <>
      {icon}
      {!collapsed && <span className="flex-1 truncate">{label}</span>}
      {!!badge && !collapsed && (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 font-mono text-[11px] font-semibold text-primary-foreground">
          {badge}
        </span>
      )}
      {!!badge && collapsed && (
        <span className="absolute top-1.5 left-[21px] size-[7px] box-content rounded-full border-2 border-surface bg-pink" />
      )}
    </>
  );
  const link = external ? (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {content}
    </a>
  ) : (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={className}
    >
      {content}
    </Link>
  );
  if (!collapsed) return link;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right" sideOffset={10}>
        {tooltip ?? label}
      </TooltipContent>
    </Tooltip>
  );
}
