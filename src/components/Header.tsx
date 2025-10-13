"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import ThemeToggle from "./ThemeToggle";
import { SidebarToggleButton } from "./SidebarPresets";
import { getCurrentUser } from "@/utils/supabase/auth/user";
import { signOut } from "@/utils/supabase/auth/sign-out";
import { User } from "@supabase/supabase-js";

type NavItem = { name: string; href: string };

const navItems: NavItem[] = [
  { name: "Home", href: "/" },
  { name: "AI Chat", href: "/chat" },
  { name: "About Us", href: "/about" },
  { name: "Prompt Library", href: "/prompt-library" },
];

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300
        ${
          active
            ? "bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg shadow-primary-500/30 dark:from-primary-500 dark:to-primary-600"
            : "text-neutral-700 hover:text-primary-600 hover:bg-primary-50 dark:text-neutral-300 dark:hover:text-primary-400 dark:hover:bg-primary-950/30"
        }`}
    >
      {item.name}
    </Link>
  );
}

export default function Header(): JSX.Element {
  const pathname = usePathname() || "/";
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    // Subscribe to auth state changes
    const { createClient } = require('@/utils/supabase/client');
    const supabase = createClient();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: string, session: { user: User } | null) => {
      setUser(session?.user || null);
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      setUser(null);
      router.push("/sign-in");
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-neutral-200/50 dark:bg-neutral-950/90 dark:border-neutral-800/50 shadow-sm">
      {/* Only show sidebar toggle on non-homepage routes */}
      {/* {pathname !== "/" && <SidebarToggleButton />} */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Left: Brand + Desktop Nav */}
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="text-lg font-bold tracking-tight bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent hover:from-primary-500 hover:to-accent-500 transition-all duration-300"
            >
              Dream Generator
            </Link>

            <nav
              className="hidden md:flex items-center gap-1"
              aria-label="Main navigation"
            >
              {navItems.map((item) => (
                <NavLink
                  key={item.href}
                  item={item}
                  active={isActive(item.href)}
                />
              ))}
            </nav>
          </div>

          {/* Right: User menu + Theme toggle + Mobile Menu Button */}
          <div className="flex items-center gap-2">
            {!loading && (
              <>
                {user ? (
                  <div className="hidden md:flex items-center gap-3">
                    <span className="text-sm text-neutral-600 dark:text-neutral-400 font-medium">
                      {user.email}
                    </span>
                    <button
                      onClick={handleSignOut}
                      className="px-4 py-2 text-sm font-medium text-neutral-700 hover:text-primary-600 hover:bg-primary-50 dark:text-neutral-300 dark:hover:text-primary-400 dark:hover:bg-primary-950/30 rounded-lg transition-all duration-300"
                    >
                      Sign out
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/sign-in"
                    className="hidden md:block px-4 py-2 text-sm font-medium rounded-lg bg-gradient-to-r from-primary-600 to-primary-700 text-white hover:from-primary-500 hover:to-primary-600 shadow-lg shadow-primary-500/30 transition-all duration-300"
                  >
                    Sign in
                  </Link>
                )}
              </>
            )}

            <div className="hidden md:block">
              <ThemeToggle />
            </div>

            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              className="inline-flex items-center justify-center md:hidden rounded-lg p-2 text-neutral-700 hover:bg-primary-50 hover:text-primary-600 dark:text-neutral-300 dark:hover:bg-primary-950/30 dark:hover:text-primary-400 transition-all duration-300"
              aria-label="Toggle navigation menu"
              aria-expanded={open ? "true" : "false"}
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                {open ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-neutral-200/50 dark:border-neutral-800/50 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-md animate-slide-down">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3">
            <div className="flex items-center justify-between">
              <ThemeToggle />
            </div>

            {/* Mobile user menu */}
            {!loading && (
              <div className="mt-3 mb-3">
                {user ? (
                  <div className="flex items-center justify-between p-3 bg-primary-50 dark:bg-primary-950/30 rounded-lg">
                    <span className="text-sm text-neutral-700 dark:text-neutral-300 font-medium">
                      {user.email}
                    </span>
                    <button
                      onClick={handleSignOut}
                      className="px-4 py-2 text-sm font-medium text-neutral-700 hover:text-primary-600 hover:bg-white dark:text-neutral-300 dark:hover:text-primary-400 dark:hover:bg-neutral-900 rounded-lg transition-all duration-300"
                    >
                      Sign out
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/sign-in"
                    className="block text-center px-4 py-2.5 text-sm font-medium rounded-lg bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg shadow-primary-500/30 transition-all duration-300"
                    onClick={() => setOpen(false)}
                  >
                    Sign in
                  </Link>
                )}
              </div>
            )}

            <nav className="mt-3 grid gap-1" aria-label="Mobile navigation">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-300 ${
                    isActive(item.href)
                      ? "bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg shadow-primary-500/30"
                      : "text-neutral-700 hover:text-primary-600 hover:bg-primary-50 dark:text-neutral-300 dark:hover:text-primary-400 dark:hover:bg-primary-950/30"
                  }`}
                  onClick={() => setOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
