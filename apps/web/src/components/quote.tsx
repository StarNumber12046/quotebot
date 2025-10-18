import Link from "next/link";
import Image from "next/image";
import { api } from "~/trpc/react";
import { LockOpen, Lock, Trash } from "lucide-react";
export function Quote({
  quote,
  canDelete,
  canChangeVisibility,
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
          {canChangeVisibility && (
            <button
              className={
                "rounded bg-black/80 p-1.5 hover:cursor-pointer hover:bg-black " +
                (quote.visibility === "PUBLIC"
                  ? "text-green-500"
                  : "text-red-500")
              }
              onClick={() =>
                updateVisibilityMutation.mutate({
                  quoteId: quote.id,
                  visibility:
                    quote.visibility === "PUBLIC" ? "PRIVATE" : "PUBLIC",
                })
              }
            >
              {quote.visibility === "PRIVATE" ? <Lock /> : <LockOpen />}
            </button>
          )}
          {canDelete && (
            <button
              className="rounded bg-black/80 p-1.5 text-red-500 hover:cursor-pointer hover:bg-black"
              onClick={() => deleteQuotesMutation.mutate({ quoteId: quote.id })}
            >
              <Trash size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
