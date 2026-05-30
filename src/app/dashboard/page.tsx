"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import api from "@/lib/api";
import {
  Users,
  Building2,
  TrendingUp,
  UserCheck,
  Clock,
  ArrowUpRight,
  UserPlus,
  PlusCircle,
  Loader2,
  AlertCircle
} from "lucide-react";

interface Organization {
  id: string;
  name: string;
  code: string;
}

interface Member {
  id: string;
  name: string;
  role: string;
  organizationName: string;
  status: "active" | "inactive" | "pending";
  avatar: string;
  createdAt: string;
}

export default function DashboardOverview() {
  const [stats, setStats] = useState({
    totalMembers: 0,
    totalOrgs: 0,
    activeMembers: 0,
    pendingVerification: 0,
  });
  const [recentMembers, setRecentMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const [orgsRes, membersRes] = await Promise.all([
        api.get("/organizations"),
        api.get("/members"),
      ]);

      const orgs: Organization[] = orgsRes.data;
      const members: Member[] = membersRes.data;

      const active = members.filter((m) => m.status === "active").length;
      const pending = members.filter((m) => m.status === "pending").length;

      setStats({
        totalMembers: members.length,
        totalOrgs: orgs.length,
        activeMembers: active,
        pendingVerification: pending,
      });

      // Sort recent members by id or createdAt desc, take top 4
      const sorted = [...members].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setRecentMembers(sorted.slice(0, 4));
    } catch (err: any) {
      setError("Failed to load dashboard statistics. Please refresh the page.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center space-y-2">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
          <p className="text-sm font-medium text-slate-500">Loading statistics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-rose-100 bg-rose-50 p-6 text-slate-900">
        <div className="flex gap-3 items-center">
          <AlertCircle className="h-6 w-6 text-rose-500" />
          <h3 className="text-lg font-bold text-rose-800">Connection Error</h3>
        </div>
        <p className="mt-2 text-rose-700 text-sm">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="mt-4 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-semibold transition-colors cursor-pointer"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Overview Dashboard</h1>
        <p className="mt-1 text-slate-500">
          Analyze analytics, create organizations, and manage active membership badges.
        </p>
      </div>

      {/* Grid Statistics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Members */}
        <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-xs border border-slate-200/80 transition-all hover:shadow-md group">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-500">Total Members</span>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-100">
              <Users className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-slate-900">{stats.totalMembers}</h3>
            <p className="mt-1 flex items-center text-xs font-semibold text-emerald-600">
              <TrendingUp className="mr-1 h-3.5 w-3.5" />
              <span>+12.5% vs last month</span>
            </p>
          </div>
        </div>

        {/* Total Organizations */}
        <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-xs border border-slate-200/80 transition-all hover:shadow-md group">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-500">Organizations</span>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition-colors group-hover:bg-indigo-100">
              <Building2 className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-slate-900">{stats.totalOrgs}</h3>
            <p className="mt-1 flex items-center text-xs font-semibold text-indigo-600">
              <span>Registered org units</span>
            </p>
          </div>
        </div>

        {/* Active Badgeholders */}
        <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-xs border border-slate-200/80 transition-all hover:shadow-md group">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-500">Active Badges</span>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition-colors group-hover:bg-emerald-100">
              <UserCheck className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-slate-900">{stats.activeMembers}</h3>
            <p className="mt-1 flex items-center text-xs font-semibold text-slate-500">
              <span>{stats.totalMembers ? Math.round((stats.activeMembers / stats.totalMembers) * 100) : 0}% active rate</span>
            </p>
          </div>
        </div>

        {/* Pending Verification */}
        <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-xs border border-slate-200/80 transition-all hover:shadow-md group">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-500">Pending Reviews</span>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600 transition-colors group-hover:bg-amber-100">
              <Clock className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-slate-900">{stats.pendingVerification}</h3>
            <p className="mt-1 flex items-center text-xs font-semibold text-amber-600">
              <span>Requires admin approval</span>
            </p>
          </div>
        </div>
      </div>

      {/* Main split sections */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 cols: Recent Members & Analytics visual */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Stats Distribution chart mock */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <h3 className="font-bold text-slate-900 text-lg">System Health & Verification</h3>
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">Online</span>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="font-semibold text-slate-600">Active Members</span>
                  <span className="font-bold text-slate-800">{stats.activeMembers} / {stats.totalMembers}</span>
                </div>
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${stats.totalMembers ? (stats.activeMembers / stats.totalMembers) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="font-semibold text-slate-600">Pending Reviews</span>
                  <span className="font-bold text-slate-800">{stats.pendingVerification} / {stats.totalMembers}</span>
                </div>
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${stats.totalMembers ? (stats.pendingVerification / stats.totalMembers) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="font-semibold text-slate-600">Inactive Accounts</span>
                  <span className="font-bold text-slate-800">{stats.totalMembers - stats.activeMembers - stats.pendingVerification} / {stats.totalMembers}</span>
                </div>
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-slate-400 rounded-full transition-all duration-500"
                    style={{
                      width: `${
                        stats.totalMembers
                          ? ((stats.totalMembers - stats.activeMembers - stats.pendingVerification) / stats.totalMembers) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Recent Members Panel */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Recently Added Members</h3>
                <p className="text-slate-500 text-xs mt-0.5">List of newest badgeholders</p>
              </div>
              <Link
                href="/dashboard/members"
                className="flex items-center text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
              >
                View all members
                <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </div>

            {recentMembers.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">
                No members found. Get started by adding a member!
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between py-3.5 group">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 overflow-hidden rounded-full border border-slate-200 bg-slate-50">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={member.avatar} alt={member.name} className="h-full w-full object-cover" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {member.name}
                        </h4>
                        <p className="text-xs text-slate-500">
                          {member.role} • <span className="font-semibold">{member.organizationName}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                          member.status === "active"
                            ? "bg-emerald-50 text-emerald-700"
                            : member.status === "pending"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {member.status}
                      </span>
                      <Link
                        href={`/dashboard/members/${member.id}`}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-all"
                      >
                        <ArrowUpRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 col: Quick Actions */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
            <h3 className="font-bold text-slate-900 text-lg border-b border-slate-100 pb-4 mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <Link
                href="/dashboard/members?action=new"
                className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 text-left hover:bg-slate-50 hover:border-blue-300 hover:shadow-xs transition-all group"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-100">
                  <UserPlus className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                    Add New Member
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">Register profile and generate ID card</p>
                </div>
              </Link>

              <Link
                href="/dashboard/organizations?action=new"
                className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 text-left hover:bg-slate-50 hover:border-indigo-300 hover:shadow-xs transition-all group"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100">
                  <PlusCircle className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">
                    Create Organization
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">Register a business or organization branch</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Quick tips panel */}
          <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-blue-950 p-6 text-white shadow-sm relative overflow-hidden">
            <div className="absolute right-0 bottom-0 opacity-15 transform translate-x-4 translate-y-4">
              <Building2 className="h-32 w-32" />
            </div>
            <h4 className="font-extrabold text-md tracking-wide uppercase text-blue-400">Security Tip</h4>
            <p className="mt-2 text-sm text-slate-200 leading-relaxed">
              Every digital ID card has a unique QR code which encodes a link to verify the active status of members offline. Always ensure members present their QR badges at security checkpoints.
            </p>
            <div className="mt-4 flex gap-2">
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              <span className="h-2 w-2 rounded-full bg-indigo-500" />
              <span className="h-2 w-2 rounded-full bg-purple-500" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
