import { HydrateClient } from "~/trpc/server";
import { Quotes } from "./_components/quotes";

export default async function Home() {
  return (
    <HydrateClient>
      <main className="dark flex min-h-screen flex-col items-center bg-black text-white">
        <Quotes />
      </main>
    </HydrateClient>
  );
}
