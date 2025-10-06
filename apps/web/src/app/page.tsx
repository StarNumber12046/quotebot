import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { api, HydrateClient } from "~/trpc/server";
import { Quotes } from "./_components/quotes";

export default async function Home() {
  void api.quote.getMyQuotes.prefetch();

  return (
    <HydrateClient>
      <main className="dark flex min-h-screen flex-col bg-black text-white">
        <nav className="flex w-full flex-row justify-end p-4">
          <SignedIn>
            <UserButton />
          </SignedIn>
          <SignedOut>
            <SignInButton />
          </SignedOut>
        </nav>
        <SignedOut>
          <SignInButton />
        </SignedOut>
        <SignedIn>
          <Quotes />
        </SignedIn>
      </main>
    </HydrateClient>
  );
}
