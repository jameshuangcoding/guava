import type { Metadata } from "next";

import {
  CONTACT_URL,
  LegalPage,
  SECURITY_URL,
} from "@/components/legal/legal-page";

export const metadata: Metadata = { title: "Privacy Policy · guava" };

// DRAFT pending owner review. Every claim here should match the code:
// prisma/schema.prisma (app database), prisma/user/schema.prisma (the user's
// database), lib/crypto.ts, lib/auth.ts and lib/bank-actions.ts.
export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="November 22, 2026">
      <section>
        <p>
          guava is an expense tracker built so that your financial data lives in
          a database you own, not ours. This page explains what guava stores,
          where, and why.
        </p>
      </section>

      <section>
        <h2>Two databases</h2>
        <p>guava keeps data in two places:</p>
        <ul>
          <li>
            <strong>guava’s own database</strong> holds what’s needed to log you
            in, plus a pointer to your database. Nothing about your spending is
            stored here.
          </li>
          <li>
            <strong>Your database</strong> is a Neon Postgres database that you
            create in your own Neon account and connect during signup. Your
            expenses and everything related to them are stored there.
          </li>
        </ul>
      </section>

      <section>
        <h2>What guava’s database stores</h2>
        <ul>
          <li>
            <strong>Your account:</strong> your name, email address, and when
            the account was created.
          </li>
          <li>
            <strong>Your password, as a hash.</strong> guava stores a one-way
            hash of your password (scrypt), never the password itself.
          </li>
          <li>
            <strong>Sessions:</strong> one record per signed-in browser, with
            its expiry time and the IP address and browser user agent it signed
            in from.
          </li>
          <li>
            <strong>Password reset requests:</strong> a one-time token for each
            reset link, which expires after an hour.
          </li>
          <li>
            <strong>Your database connection string, encrypted.</strong> It’s
            encrypted with AES-256-GCM before it’s saved, along with your
            database’s name, region and Postgres version for display. It’s never
            sent to your browser.
          </li>
        </ul>
      </section>

      <section>
        <h2>What your database stores</h2>
        <ul>
          <li>Expenses, notes, categories and subcategories.</li>
          <li>Your settings and dashboard layout.</li>
          <li>
            If you set up bank syncing: your Plaid client ID and secret, the
            access token for each bank you connect, and the details of your bank
            accounts (the bank’s name, the account’s name and type, and its last
            four digits) and imported transactions. The Plaid secret and access
            tokens are encrypted with AES-256-GCM.
          </li>
        </ul>
        <p>
          guava’s servers read and write this data in your database while you
          use the app, to show your pages and save your changes. It isn’t copied
          into guava’s database.
        </p>
        <p>
          The key that encrypts your connection string and Plaid secrets is held
          by the guava server, not by you. That means whoever operates guava can
          decrypt them and reach your database. Neon’s and Plaid’s own privacy
          policies cover the data they hold for you.
        </p>
      </section>

      <section>
        <h2>Bank syncing with Plaid</h2>
        <p>
          Bank syncing is optional. Without it, guava is a manual expense
          tracker and talks to no outside service except your database.
        </p>
        <p>
          If you turn it on, you use your own Plaid account and API keys. guava
          uses them to open Plaid Link, where you sign in to your bank with
          Plaid directly (guava never sees your bank password), and to fetch
          your accounts and transactions when you connect a bank and when you
          click Sync now. When you disconnect a bank, guava asks Plaid to remove
          access and deletes the saved access token. Accounts and expenses
          already imported stay in your database until you delete them.
        </p>
      </section>

      <section>
        <h2>Cookies and browser storage</h2>
        <ul>
          <li>
            <strong>Session cookies</strong> keep you logged in. They’re
            required for the app to work and are removed when you log out. If
            you untick <strong>Remember me</strong> when logging in, the cookie
            is also removed when you close your browser.
          </li>
          <li>
            <strong>Browser storage</strong> (localStorage) remembers display
            preferences on your device, such as the light or dark theme and
            whether the sidebar is collapsed. It isn’t sent to guava.
          </li>
        </ul>
        <p>
          guava doesn’t use advertising or analytics cookies or tracking
          scripts.
        </p>
      </section>

      <section>
        <h2>What guava doesn’t do</h2>
        <ul>
          <li>Sell or share your data with advertisers.</li>
          <li>Send you marketing email.</li>
        </ul>
      </section>

      <section>
        <h2>Email</h2>
        <p>
          guava only emails you when you ask it to, such as a password reset
          link. These emails are sent through Resend, an email delivery service,
          which receives your email address and the message.
        </p>
      </section>

      <section>
        <h2>Logs and hosting</h2>
        <p>
          When something fails, guava’s server writes an error message to its
          logs, which the hosting provider keeps for a limited time. guava’s own
          database is hosted on Neon.
        </p>
      </section>

      <section>
        <h2>Deleting your data</h2>
        <p>
          Your database is yours: you can export or delete it from your Neon
          account at any time, and guava keeps no copy. To delete your guava
          account (your login, sessions and the encrypted pointer), go to
          Settings, then Account, then Delete account. This doesn’t touch your
          Neon database.
        </p>
      </section>

      <section>
        <h2>Changes</h2>
        <p>
          If this policy changes, the “Last updated” date above will change too.
          guava is open source, so every change to this page is public in its
          history on GitHub.
        </p>
      </section>

      <section>
        <h2>Contact</h2>
        <p>
          Questions about this policy: open an issue on{" "}
          <a href={CONTACT_URL}>guava’s GitHub</a>. Please don’t post personal
          details there. To report a security problem privately, use the{" "}
          <a href={SECURITY_URL}>Security tab</a>.
        </p>
      </section>
    </LegalPage>
  );
}
