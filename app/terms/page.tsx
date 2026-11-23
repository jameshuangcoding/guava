import type { Metadata } from "next";
import Link from "next/link";

import { CONTACT_URL, LegalPage } from "@/components/legal/legal-page";

export const metadata: Metadata = { title: "Terms of Service · guava" };

// DRAFT pending owner review. Not legal advice; the owner decides the final
// wording (and things like governing law) before launch.
export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="November 22, 2026">
      <section>
        <p>
          These terms cover your use of guava, a personal expense tracker. By
          creating an account you agree to them. Please also read the{" "}
          <Link href="/privacy">Privacy Policy</Link>, which explains what guava
          stores and where.
        </p>
      </section>

      <section>
        <h2>What guava is</h2>
        <p>
          guava lets you record expenses by hand or import them from your bank,
          then review and categorize them. Your expenses are stored in a Neon
          Postgres database that you own and connect to guava. guava’s source
          code is public on GitHub under the MIT License.
        </p>
      </section>

      <section>
        <h2>Your account</h2>
        <ul>
          <li>Give a real email address and keep your password to yourself.</li>
          <li>
            You’re responsible for what happens under your account. If you think
            someone else has access to it, change your password and let us know.
          </li>
          <li>One person per account.</li>
        </ul>
      </section>

      <section>
        <h2>Your database and other services</h2>
        <ul>
          <li>
            You create and pay for your own Neon database, under Neon’s terms.
            guava creates and updates its tables there and reads and writes your
            data while you use the app.
          </li>
          <li>
            Bank syncing is optional and uses your own Plaid account and API
            keys, under Plaid’s terms. Any Plaid charges are between you and
            Plaid.
          </li>
          <li>
            Keep your own backups. If your database is deleted, changed outside
            guava, or unreachable, guava can’t recover the data for you.
          </li>
        </ul>
      </section>

      <section>
        <h2>Acceptable use</h2>
        <p>Don’t use guava to:</p>
        <ul>
          <li>break the law or anyone else’s rights;</li>
          <li>connect databases or bank accounts you aren’t allowed to use;</li>
          <li>
            try to get into other people’s accounts, or disrupt or overload the
            service.
          </li>
        </ul>
        <p>
          We may suspend or close accounts that do. Security problems should be
          reported privately as described in guava’s security policy, not
          exploited.
        </p>
      </section>

      <section>
        <h2>Not financial advice</h2>
        <p>
          guava shows you your own numbers. Categories, totals and imported
          transactions can be wrong or incomplete, so check anything important
          against your bank. Nothing in guava is financial, tax or legal advice.
        </p>
      </section>

      <section>
        <h2>No warranty</h2>
        <p>
          guava is provided “as is”, without warranties of any kind. It may have
          bugs, change, or be unavailable at times. To the extent the law
          allows, the people who run guava aren’t liable for losses that come
          from using it, including lost data.
        </p>
      </section>

      <section>
        <h2>Ending your use</h2>
        <p>
          You can stop using guava at any time. Your database stays in your Neon
          account. To have your guava account deleted, contact us (there’s no
          self-serve option in the app yet).
        </p>
      </section>

      <section>
        <h2>Changes to these terms</h2>
        <p>
          We may update these terms. When we do, the “Last updated” date above
          changes, and the history of every change is public on GitHub.
          Continuing to use guava after a change means you accept the new terms.
        </p>
      </section>

      <section>
        <h2>Contact</h2>
        <p>
          Questions about these terms: open an issue on{" "}
          <a href={CONTACT_URL}>guava’s GitHub</a>.
        </p>
      </section>
    </LegalPage>
  );
}
