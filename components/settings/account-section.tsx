import { requireUser } from "@/lib/current-user";

import { AccountCard } from "./account-card";

/** Settings > Account: name, password and deleting the account. */
export async function AccountSection() {
  const user = await requireUser();
  return <AccountCard name={user.name} email={user.email} />;
}
