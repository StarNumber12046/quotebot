"use client";
import { api } from "~/trpc/react";
import { useEffect } from "react";
import { Quote } from "~/components/quote";

export function Quotes() {
  const { data = [], isLoading } = api.quote.getPublicQuotes.useQuery();

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
      <h1 className="text-4xl font-bold">Random public quotes</h1>

      <div className="flex flex-row flex-wrap justify-center gap-8">
        {data?.map((quote) => (
          <Quote
            key={quote.id}
            quote={quote}
            canDelete={false}
            canChangeVisibility={false}
            canCopy={true}
          />
        ))}
      </div>
    </div>
  );
}
