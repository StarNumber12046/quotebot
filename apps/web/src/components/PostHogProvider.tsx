"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { useEffect } from "react";
import { useSession } from "~/lib/auth-client";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: "/t",
      ui_host: "https://us.posthog.com",
      defaults: "2025-05-24",
      capture_exceptions: true, // This enables capturing exceptions using Error Tracking, set to false if you don't want this
      debug: process.env.NODE_ENV === "development",
    });
  }, []);
  const { data: userInfo } = useSession();

  useEffect(() => {
    if (userInfo) {
      posthog.identify(userInfo.user.id, {
        email: userInfo.user.email,
        name: userInfo.user.name,
        avatar: userInfo.user.image,
      });
    } else {
      posthog.reset();
    }
  }, [userInfo]);

  return <PHProvider client={posthog}>{children}</PHProvider>;
}
