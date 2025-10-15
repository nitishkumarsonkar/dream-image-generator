"use client";

import React, { useState, useEffect, useRef } from "react";
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
  { name: "Credits", href: "/credits" },
  { name: "About Us", href: "/about" },
  { name: "Public Prompts", href: "/prompt-library" },
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

// Helper function to get user initials from email
function getUserInitials(email: string): string {
  const parts = email.split('@')[0].split('.');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

export default function Header(): JSX.Element {
  const pathname = usePathname() || "/";
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // State for user dropdown menu (desktop)
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

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

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  const handleSignOut = async () => {
    try {
      await signOut();
      setUser(null);
      setShowUserMenu(false); // Close dropdown after sign out
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
                  // Desktop: User dropdown menu with avatar
                  <div className="hidden md:block relative" ref={userMenuRef}>
                    {/* Avatar button to toggle dropdown */}
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-950/30 transition-all duration-300 border border-transparent hover:border-primary-200 dark:hover:border-primary-800"
                      aria-haspopup="menu"
                      aria-expanded={showUserMenu}
                    >
                      {/* User Avatar with initials */}
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-sm font-bold shadow-soft">
                        {getUserInitials(user.email || 'U')}
                      </div>
                      {/* Dropdown arrow icon */}
                      <svg 
                        className={`w-4 h-4 text-neutral-600 dark:text-neutral-400 transition-transform duration-300 ${showUserMenu ? 'rotate-180' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Dropdown menu - appears when showUserMenu is true */}
                    {showUserMenu && (
                      <div className="absolute right-0 mt-2 w-72 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md rounded-xl border-2 border-primary-200 dark:border-primary-800 shadow-xl z-50 animate-slide-down overflow-hidden">
                        {/* User info section */}
                        <div className="px-4 py-3 bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-950/30 dark:to-accent-950/30 border-b border-primary-200 dark:border-primary-800">
                          <div className="flex items-center gap-3">
                            {/* Avatar */}
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-base font-bold shadow-soft flex-shrink-0">
                              {getUserInitials(user.email || 'U')}
                            </div>
                            {/* User details */}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100 truncate">
                                {user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}
                              </p>
                              <p className="text-xs text-neutral-600 dark:text-neutral-400 truncate">
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Menu items */}
                        <div className="py-2">
                          {/* Account Settings - Optional, can be uncommented if needed */}
                          {/* <button
                            className="w-full px-4 py-2.5 text-left text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-primary-50 dark:hover:bg-primary-950/30 transition-all duration-300 flex items-center gap-3"
                          >
                            <svg className="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Account Settings
                          </button> */}

                          {/* Divider */}
                          <div className="my-2 border-t border-neutral-200 dark:border-neutral-800"></div>

                          {/* Sign Out button */}
                          <button
                            onClick={handleSignOut}
                            className="w-full px-4 py-2.5 text-left text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all duration-300 flex items-center gap-3"
                          >
                            {/* Sign out icon */}
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Sign out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  // Sign in button for non-authenticated users
                  <Link
                    href="/sign-in"
                    className="hidden md:block px-4 py-2 text-sm font-medium rounded-lg bg-gradient-to-r from-primary-600 to-primary-700 text-white hover:from-primary-500 hover:to-primary-600 shadow-lg shadow-primary-500/30 transition-all duration-300"
                  >
                    Sign in
                  </Link>
                )}
              </>
            )}

            {/* Theme toggle button */}
            <div className="hidden md:block">
              <ThemeToggle />
            </div>

            {/* Mobile menu hamburger button */}
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
