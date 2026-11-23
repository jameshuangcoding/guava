import type { Metadata } from "next";

import { PreferencesCard } from "@/components/settings/preferences-card";

export const metadata: Metadata = { title: "Settings · guava" };

/** Settings > General: how guava sorts new transactions, and appearance. */
export default function GeneralSettingsPage() {
  return <PreferencesCard />;
}
