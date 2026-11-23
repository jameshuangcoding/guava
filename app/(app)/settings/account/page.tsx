import type { Metadata } from "next";

import { AccountSection } from "@/components/settings/account-section";

export const metadata: Metadata = { title: "Account · Settings · guava" };

export default function AccountSettingsPage() {
  return <AccountSection />;
}
