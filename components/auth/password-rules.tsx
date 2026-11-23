import { Check } from "lucide-react";

import { PASSWORD_RULES } from "@/lib/auth-validation";
import { cn } from "@/lib/utils";

/** The live password checklist under a new-password input. */
export function PasswordRules({
  id,
  password,
  tried,
}: {
  id: string;
  password: string;
  /** After a submit attempt, unmet rules turn red. */
  tried: boolean;
}) {
  return (
    <ul id={id} className="mt-0.5 flex flex-wrap gap-x-3.5 gap-y-1.5">
      {PASSWORD_RULES.map((rule) => {
        const ok = rule.test(password);
        return (
          <li
            key={rule.label}
            className={cn(
              "inline-flex items-center gap-1.5 text-xs",
              ok ? "text-foreground" : tried ? "text-danger" : "text-ink-3",
            )}
          >
            <span
              className={cn(
                "flex size-4 items-center justify-center rounded-full text-white",
                ok ? "bg-primary" : "bg-border-strong",
              )}
            >
              <Check className="size-3" strokeWidth={3} />
            </span>
            {rule.label}
          </li>
        );
      })}
    </ul>
  );
}
