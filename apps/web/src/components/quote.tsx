import Link from "next/link";
import Image from "next/image";
import { api } from "~/trpc/react";
import { LockOpen, Lock, Trash, Copy } from "lucide-react";
import posthog from "posthog-js";
export function Quote({
  quote,
  canDelete,
  canChangeVisibility,
  canCopy,
}: {
  quote: {
    imageStorageUrl: string;
    quote: string;
    authorId: string;
    id: number;
    visibility: "PUBLIC" | "PRIVATE";
  };
  canDelete?: boolean;
  canChangeVisibility?: boolean;
  canCopy?: boolean;
}) {
  const trpc = api.useUtils();
  const deleteQuotesMutation = api.quote.deleteQuote.useMutation({
    onSuccess: () => {
      console.log("DONE!");
      void trpc.quote.getMyQuotes.invalidate();
    },
  });
  const updateVisibilityMutation = api.quote.setQuoteVisibility.useMutation({
    onSuccess: () => {
      console.log("DONE!");
      void trpc.quote.getMyQuotes.invalidate();
    },
  });

  function copyCommandToClipboard(quoteId: number) {
    void navigator.clipboard.writeText("/getquote id:" + quoteId);
    posthog.capture("quote-copy-command", {
      quoteId,
    });
  }

  return (
    <div
      key={quote.id}
      className="group flex flex-col items-center gap-2 rounded border-2 border-neutral-900 p-2"
    >
      <div className="relative">
        <Link href={quote.imageStorageUrl}>
          <Image
            src={quote.imageStorageUrl}
            alt={quote.quote}
            width={400}
            height={200}
          />
        </Link>
        <div className="absolute top-2 right-2 hidden flex-row items-center justify-end gap-2 group-hover:flex">
          {canCopy && (
            <button
              className="rounded bg-black/80 p-1.5 hover:cursor-pointer hover:bg-black"
              onClick={() => copyCommandToClipboard(quote.id)}
            >
              <Copy size={20} />
            </button>
          )}
          {canChangeVisibility && (
            <button
              className={
                "rounded bg-black/80 p-1.5 hover:cursor-pointer hover:bg-black " +
                (quote.visibility === "PUBLIC"
                  ? "text-green-500"
                  : "text-red-500")
              }
              onClick={() => {
                updateVisibilityMutation.mutate({
                  quoteId: quote.id,
                  visibility:
                    quote.visibility === "PUBLIC" ? "PRIVATE" : "PUBLIC",
                });
                posthog.capture("update-visibility", {
                  quoteId: quote.id,
                  visibility:
                    quote.visibility === "PUBLIC" ? "PRIVATE" : "PUBLIC",
                });
              }}
            >
              {quote.visibility === "PRIVATE" ? <Lock /> : <LockOpen />}
            </button>
          )}
          {canDelete && (
            <button
              className="rounded bg-black/80 p-1.5 text-red-500 hover:cursor-pointer hover:bg-black"
              onClick={() => {
                deleteQuotesMutation.mutate({ quoteId: quote.id });
                posthog.capture("delete-quote", {
                  quoteId: quote.id,
                });
              }}
            >
              <Trash size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
