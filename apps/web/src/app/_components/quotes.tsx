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
  const { data = [], isLoading } = api.quote.getMyQuotes.useQuery();
  const trpc = api.useUtils();
  const deleteQuotesMutation = api.quote.deleteQuote.useMutation({
    onSuccess: () => {
      console.log("DONE!");
      void trpc.quote.getMyQuotes.invalidate();
    },
  });
  // Debug: log raw data
  useEffect(() => {
    console.log("[Quotes] Raw data:", data);
  }, [data]);

  // Filter the data
  const filteredData = data.filter((quote) => {
    if (!filter) return true;
    console.log("[Quotes] Quote:", quote);
    console.log("[Quotes] Filtering by userId:", filter);
    console.log("[Quotes] Quote author userId:", quote.userId);
    return quote.authorId === filter;
  });

  // Debug: log filtered data
  useEffect(() => {
    console.log("[Quotes] Filter:", filter);
    console.log("[Quotes] Filtered data:", filteredData);
  }, [filter, filteredData]);

  // get all users from data, remove duplicates
  const users = Array.from(
    new Map(data.map((quote) => [quote.authorId, quote.author])).values(),
  );

  if (isLoading) {
    console.log("[Quotes] Loading...");
    return <p>Loading...</p>;
  }

  const handleSelect = (value: string) => {
    if (value === "null") return setFilter(null);
    console.log("[Quotes] Selected userId:", value);
    setFilter(value);
  };

  return (
    <div className="dark flex flex-col items-center justify-center gap-2">
      <h1 className="text-4xl font-bold">Messages you quoted</h1>

      {/* User filter */}
      <Select onValueChange={handleSelect} defaultValue="null">
        <SelectTrigger>
          <SelectValue placeholder="Filter by user" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="null" key="all">
            All
          </SelectItem>
          {users.map(
            (user) =>
              user && (
                <SelectItem value={user.userId} key={user.userId}>
                  <div className="flex items-center gap-2">
                    <Image
                      src={user.avatarUrl}
                      alt={user.username}
                      width={20}
                      height={20}
                      className="rounded-full"
                    />
                  </div>
                </SelectItem>
              ),
          )}
        </SelectContent>
      </Select>

      <div className="flex flex-row flex-wrap justify-center gap-8">
        {filteredData?.map((quote) => (
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
            <p
              className="hover:cursor-pointer"
              onClick={() => {
                deleteQuotesMutation.mutate({ quoteId: quote.id });
              }}
            >
              Delete quote
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
