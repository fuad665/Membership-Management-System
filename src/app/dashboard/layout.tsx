"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  Building2,
  Users,
  LogOut,
  Menu,
  X,
  Shield,
  Loader2,
  User as UserIcon,
  ChevronRight
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Organizations", href: "/dashboard/organizations", icon: Building2 },
    { name: "Members", href: "/dashboard/members", icon: Users },
  ];

  // Helper to check if link is active
  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  // Helper to render current section name for breadcrumbs
  const getBreadcrumbs = () => {
    const paths = pathname.split("/").filter(Boolean);
    return (
      <div className="flex items-center gap-1.5 text-sm font-medium text-slate-500">
        <span className="hover:text-slate-800 transition-colors">Admin</span>
        {paths.map((p, idx) => {
          const isLast = idx === paths.length - 1;
          const display = p.charAt(0).toUpperCase() + p.slice(1);
          return (
            <React.Fragment key={p}>
              <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
              <span className={isLast ? "text-slate-800 font-semibold" : "hover:text-slate-800 transition-colors"}>
                {display}
              </span>
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  // If auth is loading, or user is not authenticated yet, show a clean loading screen
  // (AuthContext handles the actual redirect to /login)
  if (loading || !isAuthenticated) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-slate-50 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <span className="text-sm font-semibold text-slate-600">Verifying session...</span>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      {/* 1. Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-white border-r border-slate-200">
        {/* Sidebar Header */}
        <div className="flex h-16 shrink-0 items-center px-6 border-b border-slate-200 gap-2 font-bold text-blue-600">
          <Shield className="h-6 w-6" />
          <span className="text-lg font-bold tracking-tight text-slate-900">MemberFlow</span>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1 px-4 py-6">
          {navigation.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-3 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                  active
                    ? "bg-blue-50 text-blue-600"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <item.icon
                  className={`mr-3 h-5 w-5 shrink-0 ${
                    active ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"
                  }`}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer User Info & Logout */}
        <div className="border-t border-slate-200 p-4 bg-slate-50/50">
          <div className="flex items-center gap-3 px-2 py-1.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <UserIcon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-900 truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 transition-all shadow-xs cursor-pointer"
          >
            <LogOut className="h-4 w-4 text-slate-500" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* 2. Mobile Hamburger Drawer */}
      {mobileMenuOpen && (
        <div className="relative z-50 md:hidden">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed inset-y-0 left-0 flex w-full max-w-xs flex-col bg-white border-r border-slate-200">
            {/* Drawer Header */}
            <div className="flex h-16 items-center justify-between px-6 border-b border-slate-200">
              <div className="flex items-center gap-2 font-bold text-blue-600">
                <Shield className="h-6 w-6" />
                <span className="text-lg font-bold tracking-tight text-slate-900">MemberFlow</span>
              </div>
              <button
                type="button"
                className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 focus:outline-none"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 space-y-1 px-4 py-6">
              {navigation.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`group flex items-center px-3 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                      active
                        ? "bg-blue-50 text-blue-600"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <item.icon
                      className={`mr-3 h-5 w-5 shrink-0 ${
                        active ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"
                      }`}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Sidebar Drawer Footer */}
            <div className="border-t border-slate-200 p-4 bg-slate-50/50">
              <div className="flex items-center gap-3 px-2 py-1.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <UserIcon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-900 truncate">{user?.name}</p>
                  <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-950 transition-all cursor-pointer"
              >
                <LogOut className="h-4 w-4 text-slate-500" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Main Dashboard Wrapper */}
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen">
        {/* Top Header bar */}
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="text-slate-500 hover:bg-slate-100 rounded-md p-1.5 focus:outline-none md:hidden cursor-pointer"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="hidden sm:block">{getBreadcrumbs()}</div>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 border border-blue-100 hidden sm:block">
              Role: System Administrator
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-500 font-bold text-white shadow-xs">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Scrollable Core Content */}
        <main className="flex-grow p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
