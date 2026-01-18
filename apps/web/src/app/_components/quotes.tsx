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
import Link from "next/link";
import { Quote } from "~/components/quote";
import { Button } from "~/components/ui/button";

export function Quotes() {
  const [filter, setFilter] = useState<string | null>(null);
  const [tab, setTab] = useState<'real' | 'fake'>('real');
  const { data = [], isLoading } = api.quote.getMyQuotes.useQuery();
  
  // Debug: log raw data
  useEffect(() => {
    console.log("[Quotes] Raw data:", data);
  }, [data]);

  // Filter the data by user and tab
  const filteredData = data.filter((quote) => {
    if (filter && quote.authorId !== filter) return false;
    
    if (tab === 'real') return !quote.isFake;
    if (tab === 'fake') return quote.isFake;
    
    return true;
  });

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

      <div className="flex gap-4 my-4">
        <Button variant={tab === 'real' ? 'default' : 'outline'} onClick={() => setTab('real')}>Real Quotes</Button>
        <Button variant={tab === 'fake' ? 'default' : 'outline'} onClick={() => setTab('fake')}>Fake Quotes</Button>
      </div>

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
                    {user.username}
                  </div>
                </SelectItem>
              ),
          )}
        </SelectContent>
      </Select>

      <div className="flex flex-row flex-wrap justify-center gap-8">
        {filteredData?.map((quote) => (
          <Quote
            key={quote.id}
            quote={quote}
            canDelete={true}
            canChangeVisibility={true}
            canCopy={true}
          />
        ))}
      </div>
    </div>
  );
}
