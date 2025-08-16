import { GradientBackground } from "@/features/shared/ui/gradient-background";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy - Online Utilities",
};

export default function PrivacyPage() {
  return (
    <main className="container mx-auto px-4 pt-8 pb-20">
      <GradientBackground />
      <div className="prose prose-lg dark:prose-invert prose-stone max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            Privacy Policy
          </h1>
          <p className="text-lg text-muted-foreground">
            Updated September 23, 2024
          </p>
        </div>

        <div className="space-y-6">
          <p>
            At Online Utilities, accessible via{" "}
            <Link href="https://onlineutilities.org">
              https://onlineutilities.org/
            </Link>
            , we prioritize the privacy and security of our users&apos; personal
            information. This Privacy Policy outlines the types of data we
            collect and how we handle, process, and protect that information. We
            are fully committed to complying with applicable data protection
            regulations, including the General Data Protection Regulation (GDPR)
            (see GDPR Data Protection Rights below).
          </p>

          <p>
            If you have any questions or require additional information
            regarding this policy, please contact{" "}
            <Link
              href="https://github.com/jaycho1214"
              target="_blank"
              className="text-primary hover:underline"
            >
              us
            </Link>
          </p>

          <p>
            This Privacy Policy governs only our online activities and applies
            solely to information collected through our website. It does not
            extend to any information gathered through offline channels or any
            third-party services not operated by Online Utilities.
          </p>

          <section>
            <h2 className="text-2xl font-semibold mb-4 mt-8">Consent</h2>
            <p>
              By accessing or using our website, you consent to the collection,
              use, and disclosure of your information as described in this
              Privacy Policy and agree to its terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 mt-8">
              Information We Collect
            </h2>
            <p>
              We only collect data related to Google AdSense to serve relevant
              ads to our users. This may include: Cookies: Cookies are used by
              Google AdSense to deliver advertisements based on a user&apos;s
              prior visits to our website or other websites. IP Address and
              Browser Information: Information such as your IP address, browser
              type, and other non-personally identifiable data may be collected
              to serve personalized ads and improve ad relevance. No personally
              identifiable information (such as names, email addresses, or phone
              numbers) is collected by Online Utilities.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 mt-8">
              Use of Collected Information
            </h2>
            <p className="mb-4">
              The data we collect is used solely for the following purposes:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li>Displaying relevant advertisements through Google AdSense</li>
              <li>Ensuring compliance with Google AdSense policies</li>
              <li>Improving the effectiveness of advertising campaigns</li>
            </ul>
            <p>
              We do not collect, store, or use any personal data for any other
              purposes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 mt-8">
              Cookies and Similar Technologies
            </h2>
            <p>
              As part of the Google AdSense service, cookies are used to deliver
              ads that are more relevant to users based on their browsing
              behavior. These cookies track information such as user preferences
              and the pages accessed or visited on our website. You may choose
              to disable cookies through your individual browser settings. For
              more information on how to manage cookies and other tracking
              technologies, please refer to your browser&apos;s help page or
              settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 mt-8">
              GDPR Data Protection Rights
            </h2>
            <p className="mb-4">
              Although we do not collect personally identifiable information, we
              fully comply with the General Data Protection Regulation (GDPR).
              As such, users located within the European Economic Area (EEA) are
              entitled to certain rights, including:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>
                <strong>Right to Access:</strong> You have the right to request
                copies of your personal data that we may hold.
              </li>
              <li>
                <strong>Right to Rectification:</strong> You have the right to
                request that we correct any information you believe is
                inaccurate.
              </li>
              <li>
                <strong>Right to Erasure:</strong> You have the right to request
                that we delete any personal data we may have collected.
              </li>
              <li>
                <strong>Right to Restrict Processing:</strong> You have the
                right to request that we restrict the processing of your
                personal data.
              </li>
              <li>
                <strong>Right to Object:</strong> You have the right to object
                to the processing of your personal data.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 mt-8">
              Changes to This Privacy Policy
            </h2>
            <p>
              Online Utilities reserves the right to update or modify this
              Privacy Policy at any time. Any changes will be posted on this
              page with an updated effective date. We encourage you to review
              this policy regularly to stay informed of any updates.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
