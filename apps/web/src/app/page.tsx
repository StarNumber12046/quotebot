import { api, HydrateClient } from "~/trpc/server";
import { Quotes } from "./_components/quotes";
import { UserButton, SignedIn, SignedOut } from "@daveyplate/better-auth-ui";
import { Button } from "~/components/ui/button";
import Link from "next/link";

export default async function Home() {
  void api.quote.getMyQuotes.prefetch();

  return (
    <HydrateClient>
      <main className="dark flex min-h-screen flex-col bg-black text-white">
        <nav className="flex w-full flex-row justify-end p-4">
          <SignedIn>
            <UserButton
              size={"icon"}
              className="border border-neutral-950 bg-neutral-900 text-white hover:bg-neutral-950"
            />
          </SignedIn>
          <SignedOut>
            <Button variant="outline">
              <Link href="/auth/sign-in">Sign In</Link>
            </Button>
          </SignedOut>
        </nav>
        <SignedIn>
          <Quotes />
        </SignedIn>
      </main>
    </HydrateClient>
  );
}
