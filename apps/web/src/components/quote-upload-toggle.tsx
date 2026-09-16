"use client";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";

export function QuoteUploadToggle() {
  const configQuery = api.quote.getUserConfig.useQuery();
  const toggleMutation = api.quote.toggleQuoteUploadAllowed.useMutation({
    onSuccess: () => {
      void configQuery.refetch();
    },
  });

  return (
    <div className="my-4 flex w-full max-w-md items-center gap-4 rounded-md border p-4 md:ml-72">
      <span className="flex-1">
        Allow your messages to be saved as quotes?
      </span>
      <Button
        variant={configQuery.data?.quoteUploadAllowed ? "default" : "destructive"}
        onClick={() => toggleMutation.mutate()}
        className="cursor-pointer"
        disabled={configQuery.isLoading || toggleMutation.isPending}
      >
        {configQuery.isLoading
          ? "Loading..."
          : configQuery.data?.quoteUploadAllowed
            ? "Allowed"
            : "Not Allowed"}
      </Button>
    </div>
  );
}
