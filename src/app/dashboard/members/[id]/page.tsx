"use client";

import React, { useState, useEffect, use, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { QRCodeSVG } from "qrcode.react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import {
  ArrowLeft,
  Download,
  ExternalLink,
  Shield,
  Loader2,
  AlertCircle,
  Building,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  CheckCircle,
  Clock,
  UserX,
  CreditCard,
  RefreshCw
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

export default function MemberDetailsPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const cardRef = useRef<HTMLDivElement>(null);

  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Card customization state
  const [cardSide, setCardSide] = useState<"front" | "back">("front");
  const [isExporting, setIsExporting] = useState(false);
  const [qrOrigin, setQrOrigin] = useState("http://localhost:3000");

  const fetchMemberDetails = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get(`/members/${id}`);
      setMember(res.data);
    } catch (err: any) {
      setError("Member not found or connection lost.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemberDetails();
    if (typeof window !== "undefined") {
      setQrOrigin(window.location.origin);
    }
  }, [id]);

  const downloadCardPDF = async () => {
    if (!member || !cardRef.current) return;
    setIsExporting(true);

    try {
      // Temporarily switch to front side to capture front
      const previousSide = cardSide;
      setCardSide("front");
      
      // Wait for React to render the front side
      await new Promise((resolve) => setTimeout(resolve, 300));

      const canvas = await html2canvas(cardRef.current, {
        scale: 3, // Render at 3x resolution for high quality print
        useCORS: true, // Allow cross-origin images (Unsplash)
        logging: false,
        backgroundColor: null
      });

      const imgData = canvas.toDataURL("image/png");
      
      // Card size in px (320 width x 480 height approx)
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [85, 125] // Card format size
      });

      pdf.addImage(imgData, "PNG", 0, 0, 85, 125);
      pdf.save(`ID-Badge-${member.name.replace(/\s+/g, "_")}.pdf`);
      
      // Restore side preference
      setCardSide(previousSide);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Failed to export PDF badge.");
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center space-y-2">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
          <p className="text-sm font-medium text-slate-500">Loading member profile...</p>
        </div>
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="rounded-xl border border-rose-100 bg-rose-50 p-6 text-slate-900">
        <div className="flex gap-3 items-center">
          <AlertCircle className="h-6 w-6 text-rose-500" />
          <h3 className="text-lg font-bold text-rose-800">Profile Not Found</h3>
        </div>
        <p className="mt-2 text-rose-700 text-sm">{error || "The requested member records could not be recovered."}</p>
        <div className="mt-4 flex gap-4">
          <Link
            href="/dashboard/members"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            Back to members
          </Link>
        </div>
      </div>
    );
  }

  const verificationUrl = `${qrOrigin}/verify/${member.id}`;

  return (
    <div className="space-y-6">
      {/* Back navigation */}
      <Link
        href="/dashboard/members"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Members List
      </Link>

      {/* Main Profile Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Full Member Profile Details */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
            {/* Header info */}
            <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
              <div className="h-16 w-16 overflow-hidden rounded-full border border-slate-200 bg-slate-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={member.avatar} alt={member.name} className="h-full w-full object-cover" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-950">{member.name}</h2>
                <div className="flex items-center gap-1.5 text-sm font-medium text-slate-500 mt-1">
                  <Briefcase className="h-4 w-4" />
                  <span>{member.role}</span>
                </div>
              </div>
            </div>

            {/* Detailed list fields */}
            <div className="py-6 space-y-4 text-slate-900">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Contact & Affiliation</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="block text-xs font-semibold text-slate-500">Organization</span>
                  <div className="mt-1 flex items-center gap-1.5 text-sm font-bold text-slate-800">
                    <Building className="h-4.5 w-4.5 text-slate-400" />
                    <span>{member.organizationName}</span>
                  </div>
                </div>

                <div>
                  <span className="block text-xs font-semibold text-slate-500">Member ID Code</span>
                  <div className="mt-1 font-mono text-sm font-bold text-blue-600">
                    MB-{member.organizationName.substring(0, 3).toUpperCase()}-{member.id.split("-")[1] || member.id}
                  </div>
                </div>

                <div>
                  <span className="block text-xs font-semibold text-slate-500">Email Address</span>
                  <div className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-slate-800">
                    <Mail className="h-4.5 w-4.5 text-slate-400" />
                    <span>{member.email}</span>
                  </div>
                </div>

                <div>
                  <span className="block text-xs font-semibold text-slate-500">Phone Number</span>
                  <div className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-slate-800">
                    <Phone className="h-4.5 w-4.5 text-slate-400" />
                    <span>{member.phone || "(N/A)"}</span>
                  </div>
                </div>

                <div>
                  <span className="block text-xs font-semibold text-slate-500">Creation Date</span>
                  <div className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-slate-800">
                    <Calendar className="h-4.5 w-4.5 text-slate-400" />
                    <span>{new Date(member.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div>
                  <span className="block text-xs font-semibold text-slate-500">Badge Status</span>
                  <div className="mt-1 flex items-center gap-1.5 text-sm">
                    {member.status === "active" ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full text-xs">
                        <CheckCircle className="h-3.5 w-3.5" />
                        Active Badge
                      </span>
                    ) : member.status === "pending" ? (
                      <span className="inline-flex items-center gap-1 text-amber-700 font-bold bg-amber-50 px-2.5 py-0.5 rounded-full text-xs">
                        <Clock className="h-3.5 w-3.5 animate-pulse" />
                        Pending review
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-slate-700 font-bold bg-slate-100 px-2.5 py-0.5 rounded-full text-xs">
                        <UserX className="h-3.5 w-3.5" />
                        Suspended/Expired
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Action panel */}
            <div className="border-t border-slate-100 pt-6 flex flex-wrap gap-4">
              <button
                onClick={downloadCardPDF}
                disabled={isExporting}
                className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-5 py-3 text-sm font-bold shadow-xs hover:shadow-md transition-all cursor-pointer disabled:bg-blue-400 shrink-0"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="h-4.5 w-4.5 animate-spin" />
                    Downloading PDF...
                  </>
                ) : (
                  <>
                    <Download className="h-4.5 w-4.5" />
                    Download ID Card PDF
                  </>
                )}
              </button>

              <Link
                href={verificationUrl}
                target="_blank"
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-5 py-3 text-sm font-bold shadow-2xs hover:shadow-xs transition-all shrink-0"
              >
                <ExternalLink className="h-4.5 w-4.5 text-slate-500" />
                View Public Verification URL
              </Link>
            </div>
          </div>

          {/* Quick verification card details */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
            <h3 className="font-bold text-slate-900 text-md">Verification Information</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Scanning the card QR code directs security validators to a public URL verifying the badge authenticity in real-time. This protects against identity duplication and unauthorized access attempts.
            </p>
            <div className="rounded-lg bg-slate-50 p-4 font-mono text-xs border border-slate-100 text-slate-600 break-all select-all">
              {verificationUrl}
            </div>
          </div>
        </div>

        {/* Right Column: High-Fidelity Interactive ID Badge Preview */}
        <div className="lg:col-span-5 flex flex-col items-center">
          {/* Card Side switcher */}
          <div className="flex gap-2 rounded-lg bg-slate-200/60 p-1 mb-6">
            <button
              onClick={() => setCardSide("front")}
              className={`flex items-center gap-1.5 rounded-md px-4 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                cardSide === "front"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <CreditCard className="h-3.5 w-3.5" />
              Front Badge
            </button>
            <button
              onClick={() => setCardSide("back")}
              className={`flex items-center gap-1.5 rounded-md px-4 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                cardSide === "back"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Back Badge
            </button>
          </div>

          {/* ID CARD WIDGET FRAME */}
          <div className="relative group transition-all duration-300">
            {/* Holographic backdrop glow */}
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-600 opacity-20 blur-xl transition-all group-hover:opacity-40" />

            {/* Actual Card Body */}
            <div
              ref={cardRef}
              id="id-card-element"
              className="relative w-[320px] h-[480px] select-none rounded-[28px] bg-white text-slate-900 shadow-2xl overflow-hidden border border-slate-200 flex flex-col justify-between"
            >
              {cardSide === "front" ? (
                /* --- FRONT OF CARD --- */
                <>
                  {/* Holographic top design wave */}
                  <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800 flex flex-col items-center justify-start pt-6 text-white px-6">
                    {/* Floating circular shapes */}
                    <div className="absolute top-[-20%] right-[-10%] h-36 w-36 rounded-full bg-white/5" />
                    <div className="absolute top-12 left-[-10%] h-24 w-24 rounded-full bg-white/5" />
                    
                    {/* Header Logo & Org Name */}
                    <div className="relative flex items-center gap-1.5 font-bold tracking-tight">
                      <Shield className="h-5 w-5 text-blue-300" />
                      <span className="text-sm truncate uppercase tracking-widest max-w-[200px]">
                        {member.organizationName}
                      </span>
                    </div>
                    <span className="text-[10px] text-blue-200 font-bold uppercase tracking-wider mt-1.5">
                      Official Membership
                    </span>
                  </div>

                  {/* Avatar wrapper that overlaps the blue header */}
                  <div className="relative flex flex-col items-center mt-24 px-6">
                    <div className="relative h-28 w-28 rounded-full overflow-hidden border-4 border-white bg-slate-50 shadow-md">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={member.avatar} alt={member.name} className="h-full w-full object-cover" />
                    </div>
                  </div>

                  {/* Profile texts */}
                  <div className="text-center px-6 mt-3 flex-1 flex flex-col justify-between pb-6">
                    <div>
                      <h3 className="text-xl font-extrabold text-slate-950 tracking-tight leading-tight">
                        {member.name}
                      </h3>
                      <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mt-1">
                        {member.role}
                      </p>
                    </div>

                    {/* Metadata details Grid */}
                    <div className="my-4 bg-slate-50 border border-slate-100 rounded-xl p-3 grid grid-cols-2 gap-2 text-left">
                      <div>
                        <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wide">ID Number</span>
                        <span className="font-mono text-xs font-bold text-slate-800">
                          {member.id.substring(0, 8).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wide">Status</span>
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${
                          member.status === "active" ? "text-emerald-600" : "text-amber-500"
                        }`}>
                          ● {member.status}
                        </span>
                      </div>
                    </div>

                    {/* QR Code section */}
                    <div className="flex flex-col items-center justify-end">
                      <div className="p-2 border border-slate-200/80 bg-white rounded-xl shadow-xs">
                        <QRCodeSVG value={verificationUrl} size={64} level="M" />
                      </div>
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1.5">
                        Scan to verify
                      </span>
                    </div>
                  </div>

                  {/* Aesthetic barcode mockup at very bottom */}
                  <div className="h-1.5 bg-gradient-to-r from-blue-700 via-indigo-600 to-indigo-900" />
                </>
              ) : (
                /* --- BACK OF CARD --- */
                <>
                  <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-blue-700 via-indigo-600 to-indigo-900" />
                  
                  <div className="flex-1 flex flex-col justify-between p-6 text-center text-slate-900">
                    {/* Header Logo */}
                    <div className="flex flex-col items-center mt-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <Shield className="h-5 w-5" />
                      </div>
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest mt-2">
                        {member.organizationName}
                      </h4>
                    </div>

                    {/* Terms & details */}
                    <div className="space-y-3 text-[10px] text-slate-500 text-left leading-relaxed my-auto border-y border-slate-100 py-4">
                      <p>
                        • This card is the property of <span className="font-semibold text-slate-700">{member.organizationName}</span> and is non-transferable.
                      </p>
                      <p>
                        • Presentation of this digital badge permits entry to authorized areas. If lost or suspended, card privileges are voided.
                      </p>
                      <p>
                        • Validator security can verify the cardholder profile by scanning the active front-side QR verification link.
                      </p>
                    </div>

                    {/* Emergency details */}
                    <div className="text-center space-y-1">
                      <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wide">Emergency Helpline</span>
                      <span className="font-bold text-slate-800 text-xs">+1 (800) 555-0199</span>
                    </div>

                    {/* Barcode mockup */}
                    <div className="flex flex-col items-center mt-3">
                      <div className="w-48 h-8 bg-slate-900 flex items-center justify-around px-2 relative overflow-hidden rounded-xs opacity-75">
                        {/* Mock vertical barcode lines */}
                        <div className="absolute inset-y-0 left-0 right-0 bg-repeat-x bg-[linear-gradient(to_right,#000_1px,transparent_1px,#000_2px,transparent_3px,#000_1px,transparent_5px)]" />
                      </div>
                      <span className="font-mono text-[9px] text-slate-400 mt-1 uppercase tracking-wider">
                        *MB-{member.id.substring(0, 6).toUpperCase()}*
                      </span>
                    </div>
                  </div>

                  <div className="h-1.5 bg-slate-900" />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
