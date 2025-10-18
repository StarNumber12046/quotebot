import { HydrateClient } from "~/trpc/server";
import { Quotes } from "./_components/quotes";
import { UserButton, SignedIn, SignedOut } from "@daveyplate/better-auth-ui";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import type { SVGProps } from "react";

export default async function Home() {
  return (
    <HydrateClient>
      <main className="dark flex min-h-screen flex-col items-center bg-black text-white">
        <Quotes />
      </main>
    </HydrateClient>
  );
}
