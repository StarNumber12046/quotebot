"use client";
import { api } from "~/trpc/react";
import Image from "next/image";
import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

export function Quotes() {
  const [filter, setFilter] = useState<string | null>(null);
  const { data = [], isLoading } = api.quote.getQuotesAboutMe.useQuery();

  // Debug: log raw data
  useEffect(() => {
    console.log("[Quotes] Raw data:", data);
  }, [data]);

  if (isLoading) {
    console.log("[Quotes] Loading...");
    return <p>Loading...</p>;
  }

  return (
    <div className="dark flex flex-col items-center justify-center gap-2">
      <h1 className="text-4xl font-bold">Quotes about you</h1>

      <div className="flex flex-row flex-wrap justify-center gap-8">
        {data?.map((quote) => (
          <div
            key={quote.id}
            className="flex flex-col items-center gap-2 rounded border-2 border-neutral-900 p-2"
          >
            <Image
              src={quote.imageStorageUrl}
              alt={quote.quote}
              width={400}
              height={200}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
