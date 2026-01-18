import { AccountView } from "@daveyplate/better-auth-ui";
import { accountViewPaths } from "@daveyplate/better-auth-ui/server";
import { FakeQuoteToggle } from "~/components/fake-quote-toggle";

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.values(accountViewPaths).map((path) => ({ path }));
}

export default async function AccountPage({
  params,
}: {
  params: Promise<{ path: string }>;
}) {
  const { path } = await params;

  return (
    <main className="container flex flex-col p-4 md:p-6">
      <AccountView path={path}></AccountView>
      <FakeQuoteToggle />
    </main>
  );
}
