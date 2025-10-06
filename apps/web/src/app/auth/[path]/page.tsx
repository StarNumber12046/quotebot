import { AuthView } from "@daveyplate/better-auth-ui";
import { authViewPaths } from "@daveyplate/better-auth-ui/server";

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.values(authViewPaths)
    .filter((path) => path !== "/auth/sign-in")
    .map((path) => ({ path }));
}

export default async function AuthPage({
  params,
}: {
  params: Promise<{ path: string }>;
}) {
  const { path } = await params;

  return (
    <main className="dark flex h-screen w-full flex-col items-center justify-center self-center bg-black p-4 md:p-6">
      <AuthView path={path} />
    </main>
  );
}
