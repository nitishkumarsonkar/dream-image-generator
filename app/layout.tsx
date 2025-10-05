import React from "react";
import "./globals.css";
import Header from "../components/Header";
import { SidebarProvider } from "../components/SidebarPresets";

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
        <SidebarProvider>
          <Header />
          {children}
        </SidebarProvider>
      </body>
    </html>
  );
}
