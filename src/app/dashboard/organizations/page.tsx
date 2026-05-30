"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import {
  Building2,
  Search,
  Plus,
  X,
  Loader2,
  AlertCircle,
  MapPin,
  Users,
  Briefcase,
  Calendar,
  CheckCircle,
  FileText
} from "lucide-react";

interface Organization {
  id: string;
  name: string;
  code: string;
  address: string;
  memberCount: number;
  createdAt: string;
}

export default function OrganizationsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Create Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", code: "", address: "" });
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check query parameters to open modal automatically
  useEffect(() => {
    if (searchParams.get("action") === "new") {
      setIsModalOpen(true);
    }
  }, [searchParams]);

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/organizations");
      setOrgs(res.data);
    } catch (err: any) {
      setError("Failed to fetch organizations. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formError) setFormError("");
  };

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    const { name, code } = formData;

    if (!name || !code) {
      setFormError("Organization name and code are required.");
      return;
    }

    if (code.length < 2 || code.length > 8) {
      setFormError("Code must be between 2 and 8 characters.");
      return;
    }

    setIsSubmitting(true);
    setFormError("");

    try {
      await api.post("/organizations", formData);
      setFormData({ name: "", code: "", address: "" });
      setIsModalOpen(false);
      
      // Clear URL parameter if there was one
      if (searchParams.get("action") === "new") {
        router.replace("/dashboard/organizations");
      }
      
      await fetchOrganizations();
    } catch (err: any) {
      setFormError(err.response?.data?.error || "Failed to create organization.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ name: "", code: "", address: "" });
    setFormError("");
    if (searchParams.get("action") === "new") {
      router.replace("/dashboard/organizations");
    }
  };

  // Filter organizations by search term
  const filteredOrgs = orgs.filter(
    (org) =>
      org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Organizations</h1>
          <p className="mt-1 text-slate-500">
            Create and manage organization divisions, client folders, or business departments.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus:outline-none transition-all cursor-pointer hover:shadow-md shrink-0"
        >
          <Plus className="h-4.5 w-4.5" />
          Create Organization
        </button>
      </div>

      {/* Control bar */}
      <div className="flex rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
        <div className="relative flex-grow max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search by name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-3 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm transition-all"
          />
        </div>
      </div>

      {/* Main List */}
      {loading ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <div className="text-center space-y-2">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
            <p className="text-sm font-medium text-slate-500">Loading organizations...</p>
          </div>
        </div>
      ) : error ? (
        <div className="rounded-xl border border-rose-100 bg-rose-50 p-6 text-slate-900">
          <div className="flex gap-3 items-center">
            <AlertCircle className="h-6 w-6 text-rose-500" />
            <h3 className="text-lg font-bold text-rose-800">Error Loading Data</h3>
          </div>
          <p className="mt-2 text-rose-700 text-sm">{error}</p>
          <button
            onClick={fetchOrganizations}
            className="mt-4 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-semibold transition-colors cursor-pointer"
          >
            Retry
          </button>
        </div>
      ) : filteredOrgs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center bg-white shadow-2xs">
          <Building2 className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-4 text-lg font-bold text-slate-950">No organizations found</h3>
          <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">
            {searchTerm
              ? `No registered organizations match the search "${searchTerm}"`
              : "Register your first organization to start grouping your members and issuing custom ID cards."}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-blue-500 focus:outline-none transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Add Organization
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredOrgs.map((org) => (
            <div
              key={org.id}
              className="flex flex-col justify-between overflow-hidden rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all group"
            >
              <div className="p-6 space-y-4">
                {/* Top header block */}
                <div className="flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-100">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-800 tracking-wider font-mono">
                    {org.code}
                  </span>
                </div>

                {/* Organization Information */}
                <div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-tight">
                    {org.name}
                  </h3>
                  {org.address ? (
                    <p className="mt-2 flex items-start gap-1 text-sm text-slate-500">
                      <MapPin className="h-4 w-4 shrink-0 text-slate-400 mt-0.5" />
                      <span>{org.address}</span>
                    </p>
                  ) : (
                    <p className="mt-2 text-sm text-slate-400 italic">No address provided</p>
                  )}
                </div>
              </div>

              {/* Bottom metadata panel */}
              <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-6 py-4">
                <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                  <Users className="h-4.5 w-4.5 text-blue-600" />
                  <span>{org.memberCount} members</span>
                </div>
                <div className="flex items-center text-xs text-slate-400 font-medium">
                  <Calendar className="mr-1 h-3.5 w-3.5" />
                  <span>{new Date(org.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Organization Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" onClick={closeModal} />

          {/* Modal Container */}
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl border border-slate-200 transition-all animate-in fade-in zoom-in-95 duration-150 text-slate-900">
              {/* Close Button */}
              <button
                onClick={closeModal}
                className="absolute right-4 top-4 rounded-md p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-500 focus:outline-none cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">New Organization</h3>
                  <p className="text-xs text-slate-500">Register a new company or division</p>
                </div>
              </div>

              {formError && (
                <div className="mt-4 flex items-start gap-3 rounded-lg bg-rose-50 p-3.5 border border-rose-100 text-xs text-rose-800">
                  <AlertCircle className="h-4.5 w-4.5 shrink-0 text-rose-500" />
                  <div>{formError}</div>
                </div>
              )}

              <form onSubmit={handleCreateOrg} className="mt-4 space-y-4">
                <div>
                  <label htmlFor="name" className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                    Organization Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Stark Industries"
                    className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="code" className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                    Short Code / Abbreviation
                  </label>
                  <input
                    type="text"
                    id="code"
                    name="code"
                    required
                    maxLength={8}
                    value={formData.code}
                    onChange={handleInputChange}
                    placeholder="e.g. STARK (2-8 chars)"
                    className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-mono uppercase transition-all"
                  />
                  <p className="mt-1 text-[11px] text-slate-500">Used for member ID generation.</p>
                </div>

                <div>
                  <label htmlFor="address" className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                    Location Address
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    rows={2}
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="e.g. Malibu Point, California, CA"
                    className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm transition-all"
                  />
                </div>

                <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-blue-500 focus:outline-none transition-all disabled:bg-blue-400 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>Create</>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
