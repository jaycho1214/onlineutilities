import { getTranslations, getMessages } from "next-intl/server";
import { cookies } from "next/headers";

export async function WelcomeHeading() {
  const [t, messages, cookieStore] = await Promise.all([
    getTranslations("Welcome.greetings"),
    getMessages(),
    cookies(),
  ]);

  const personalName = cookieStore.get("personalName")?.value || "";

  // Get all greeting keys dynamically
  const withNameKeys = Object.keys(messages.Welcome.greetings.withName);
  const defaultKeys = Object.keys(messages.Welcome.greetings.default);

  // Choose the appropriate greeting set
  const greetingKeys = personalName.trim() ? withNameKeys : defaultKeys;
  const randomKey =
    greetingKeys[Math.floor(Math.random() * greetingKeys.length)];

  // Get the greeting and replace name if needed
  let greeting: string;
  if (personalName.trim()) {
    // @ts-expect-error - Dynamic key access not inferred by TypeScript
    greeting = t(`withName.${randomKey}`, { name: personalName });
  } else {
    // @ts-expect-error - Dynamic key access not inferred by TypeScript
    greeting = t(`default.${randomKey}`);
  }

  return (
    <h1 className="text-5xl font-normal text-foreground font-[family-name:var(--font-eb-garamond)]">
      {greeting}
    </h1>
  );
}
