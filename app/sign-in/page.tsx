import React from "react";

export const metadata = {
  title: "Sign in - Dream Generator",
  description: "Sign in to access your Dream Generator experience.",
};

export default function SignInPage() {
  return (
    <main className="min-h-[60vh]">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-semibold tracking-tight">Sign in</h1>
        <p className="mt-3 text-neutral-700 dark:text-neutral-300">
          Authentication isn&#39;t set up in this demo. This is a placeholder page.
        </p>

        <div className="mt-8 rounded-lg border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <p className="text-neutral-600 dark:text-neutral-300">
            In a future iteration, this page can integrate with your preferred auth provider
            (e.g., NextAuth, custom JWT, Clerk, Auth0).
          </p>
        </div>
      </div>
    </main>
  );
}
