"use client";

import { AuthUIProvider } from "@daveyplate/better-auth-ui";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

import { authClient } from "~/lib/auth-client";
import { PostHogProvider } from "~/components/PostHogProvider";

export function AuthUiProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  return (
    <PostHogProvider>
      <AuthUIProvider
        authClient={authClient}
        // eslint-disable-next-line @typescript-eslint/unbound-method
        navigate={router.push}
        // eslint-disable-next-line @typescript-eslint/unbound-method
        replace={router.replace}
        onSessionChange={() => {
          // Clear router cache (protected routes)
          router.refresh();
        }}
        Link={Link}
      >
        {children}
      </AuthUIProvider>
    </PostHogProvider>
  );
}