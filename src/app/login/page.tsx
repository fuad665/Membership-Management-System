"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { LogIn, Mail, Lock, Shield, ArrowRight, AlertCircle, Loader2 } from "lucide-react";

export default function LoginPage() {
  const { login, token, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Clear errors when typing
  useEffect(() => {
    if (formError) setFormError("");
  }, [email, password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setFormError("Please fill in all fields.");
      return;
    }

    setIsSubmitting(true);
    setFormError("");

    try {
      await login(email, password);
    } catch (err: any) {
      setFormError(err.message || "Invalid credentials. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Left panel: Brand/Accent */}
      <div className="hidden flex-1 flex-col justify-between bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-800 p-12 text-white md:flex">
        <div className="flex items-center gap-2 font-semibold">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">MemberFlow</span>
        </div>

        <div className="space-y-6 my-auto max-w-lg">
          <h1 className="text-4xl font-extrabold leading-tight">
            Simplify Your Member & Organization Management.
          </h1>
          <p className="text-blue-100 text-lg leading-relaxed">
            Create organizations, issue digital ID badges, verify members, and streamline your operations in one central hub.
          </p>
          <div className="flex gap-4 pt-4">
            <div className="rounded-lg bg-white/5 p-4 backdrop-blur-sm border border-white/10">
              <div className="text-2xl font-bold">100%</div>
              <div className="text-sm text-blue-200">Secure Issuance</div>
            </div>
            <div className="rounded-lg bg-white/5 p-4 backdrop-blur-sm border border-white/10">
              <div className="text-2xl font-bold">Instantly</div>
              <div className="text-sm text-blue-200">Generate ID PDFs</div>
            </div>
          </div>
        </div>

        <div className="text-sm text-blue-200">
          © {new Date().getFullYear()} MemberFlow. All rights reserved.
        </div>
      </div>

      {/* Right panel: Login Form */}
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:px-20 xl:px-24 bg-white">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="text-center md:text-left">
            <div className="flex justify-center md:justify-start items-center gap-2 font-semibold text-blue-600 md:hidden mb-6">
              <Shield className="h-8 w-8" />
              <span className="text-2xl font-bold tracking-tight">MemberFlow</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Sign In</h2>
            <p className="mt-2 text-sm text-slate-600">
              Or{" "}
              <Link href="/register" className="font-semibold text-blue-600 hover:text-blue-500 transition-colors">
                create a new administrator account
              </Link>
            </p>
          </div>

          <div className="mt-8">


            {formError && (
              <div className="mb-4 flex items-start gap-3 rounded-lg bg-rose-50 p-4 text-sm text-rose-800 border border-rose-100 animate-shake">
                <AlertCircle className="h-5 w-5 shrink-0 text-rose-500" />
                <div>{formError}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
                  Email address
                </label>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="block w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
                    Password
                  </label>
                </div>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm transition-all"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:bg-blue-400 disabled:cursor-not-allowed transition-all"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
