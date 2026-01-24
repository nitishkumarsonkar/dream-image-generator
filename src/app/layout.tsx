import React from "react";
import "./globals.css";
import Header from "@/components/layout/Header";
import { SidebarProvider } from "@/components/features/presets/SidebarPresets";
import AuthHandler from "@/components/features/auth/AuthHandler";

export const metadata = {
  title: "Image Generator",
  description: "Upload an image and preview it instantly.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100 antialiased">
        <AuthHandler />
        <SidebarProvider>
          <Header />
          {children}
        </SidebarProvider>
      </body>
    </html>
  );
}
