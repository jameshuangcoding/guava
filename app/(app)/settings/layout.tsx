import { SettingsTabs } from "@/components/settings/settings-tabs";
import { Page, PageHeader } from "@/components/shell/page";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Page width="narrow">
      <PageHeader
        title="Settings"
        subtitle="Manage how guava works and your account."
      />
      <SettingsTabs />
      {children}
    </Page>
  );
}
