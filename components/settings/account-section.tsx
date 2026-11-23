import { requireUser } from "@/lib/current-user";

import { AccountCard } from "./account-card";

/** Settings > Account: name, password and deleting the account. */
export async function AccountSection() {
  const user = await requireUser();
  return (
    <section aria-labelledby="account-heading" className="flex flex-col gap-3">
      <h2 id="account-heading" className="text-base font-semibold">
        Account
      </h2>
      <AccountCard name={user.name} email={user.email} />
    </section>
  );
}
