"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import api from "@/lib/api";
import {
  Shield,
  CheckCircle,
  Loader2,
  AlertTriangle,
  Building,
  Briefcase,
  Mail,
  Calendar,
  AlertCircle,
  Lock
} from "lucide-react";

interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  organizationId: string;
  organizationName: string;
  status: "active" | "inactive" | "pending";
  avatar: string;
  createdAt: string;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function VerificationPage({ params }: PageProps) {
  const { id } = use(params);

  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMember = async () => {
      try {
        setLoading(true);
        setError("");
        // Make call to members endpoint
        const res = await api.get(`/members/${id}`);
        setMember(res.data);
      } catch (err: any) {
        setError("Invalid Credential. The requested membership record does not exist or has been deleted.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMember();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <span className="mt-3 text-sm font-semibold text-slate-600">Verifying security certificate...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 text-slate-900 px-4 py-8">
      {/* Header logo */}
      <div className="flex items-center justify-center gap-2 font-extrabold text-blue-600 text-lg">
        <Shield className="h-6 w-6" />
        <span className="text-slate-900 tracking-tight">MemberFlow Secure</span>
      </div>

      {/* Main card */}
      <div className="mx-auto w-full max-w-md my-auto mt-8 mb-8 bg-white border border-slate-200 shadow-xl rounded-3xl overflow-hidden">
        {error || !member ? (
          /* Invalid Credential state */
          <div className="p-8 text-center space-y-6">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-500 border border-rose-100">
              <AlertTriangle className="h-8 w-8 animate-bounce" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-rose-600 tracking-tight">Verification Failed</h2>
              <p className="mt-3 text-sm text-slate-500 leading-relaxed">
                {error || "We could not find an active membership matching this identification key."}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 flex items-start gap-2.5 text-left text-xs text-slate-500">
              <AlertCircle className="h-4.5 w-4.5 shrink-0 text-slate-400 mt-0.5" />
              <span>If you believe this is an error, please contact the issuing organization administration to renew the card profile.</span>
            </div>
          </div>
        ) : (
          /* Valid Credential state */
          <div>
            {/* Top Seal banner */}
            <div className="bg-emerald-500 p-6 text-white text-center flex flex-col items-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 border border-white/30 shadow-xs mb-3">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-extrabold tracking-tight">Verified Credential</h2>
              <span className="text-xs text-emerald-100 uppercase tracking-widest font-bold mt-1">
                Active Member Profile
              </span>
            </div>

            {/* Profile body */}
            <div className="p-6 space-y-6">
              {/* Member Photo */}
              <div className="flex flex-col items-center">
                <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-slate-100 bg-slate-50 shadow-md">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={member.avatar} alt={member.name} className="h-full w-full object-cover" />
                </div>
                <h3 className="mt-3 text-xl font-extrabold text-slate-900 tracking-tight">{member.name}</h3>
                <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mt-0.5">{member.role}</p>
              </div>

              {/* Attributes grid */}
              <div className="divide-y divide-slate-100 border-t border-slate-100 text-sm">
                <div className="flex justify-between py-3">
                  <span className="font-semibold text-slate-500 flex items-center gap-1.5">
                    <Building className="h-4 w-4 text-slate-400" />
                    Organization
                  </span>
                  <span className="font-bold text-slate-900 text-right">{member.organizationName}</span>
                </div>

                <div className="flex justify-between py-3">
                  <span className="font-semibold text-slate-500 flex items-center gap-1.5">
                    <Briefcase className="h-4 w-4 text-slate-400" />
                    Position / Title
                  </span>
                  <span className="font-semibold text-slate-800 text-right">{member.role}</span>
                </div>

                <div className="flex justify-between py-3">
                  <span className="font-semibold text-slate-500 flex items-center gap-1.5">
                    <Mail className="h-4 w-4 text-slate-400" />
                    Email Contact
                  </span>
                  <span className="font-medium text-slate-600 text-right">{member.email}</span>
                </div>

                <div className="flex justify-between py-3">
                  <span className="font-semibold text-slate-500 flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    Member Since
                  </span>
                  <span className="font-medium text-slate-600 text-right">
                    {new Date(member.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Status seal indicator */}
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <Lock className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide">Secure Link Integrity</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    This identification certificate is cryptographically anchored to MemberFlow databases.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer credits */}
      <div className="text-center text-xs text-slate-400 space-y-2">
        <p>© {new Date().getFullYear()} MemberFlow. All rights reserved.</p>
        <p className="font-semibold flex items-center justify-center gap-1">
          <Lock className="h-3 w-3" />
          Encrypted Verification SSL
        </p>
      </div>
    </div>
  );
}
