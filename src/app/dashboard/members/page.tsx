"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import {
  Users,
  Search,
  Plus,
  X,
  Loader2,
  AlertCircle,
  Mail,
  Phone,
  Building,
  Briefcase,
  Edit2,
  Trash2,
  Eye,
  Filter,
  CheckCircle,
  AlertTriangle
} from "lucide-react";

interface Organization {
  id: string;
  name: string;
  code: string;
}

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

export default function MembersPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Core list states
  const [members, setMembers] = useState<Member[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Search and Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrg, setSelectedOrg] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  // Modals management
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    organizationId: "",
    status: "active" as "active" | "inactive" | "pending",
    avatar: "",
  });
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete modal states
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);
  const [isDeleteSubmitting, setIsDeleteSubmitting] = useState(false);

  // Sync modal trigger from URL
  useEffect(() => {
    if (searchParams.get("action") === "new") {
      setIsFormModalOpen(true);
      setEditingMember(null);
    }
  }, [searchParams]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [membersRes, orgsRes] = await Promise.all([
        api.get("/members"),
        api.get("/organizations"),
      ]);
      
      setMembers(membersRes.data);
      setOrganizations(orgsRes.data);
    } catch (err: any) {
      setError("Failed to fetch dashboard data. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formError) setFormError("");
  };

  // Trigger Add Modal
  const openAddModal = () => {
    setEditingMember(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      role: "",
      organizationId: organizations[0]?.id || "",
      status: "active",
      avatar: "",
    });
    setFormError("");
    setIsFormModalOpen(true);
  };

  // Trigger Edit Modal
  const openEditModal = (member: Member) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      email: member.email,
      phone: member.phone,
      role: member.role,
      organizationId: member.organizationId,
      status: member.status,
      avatar: member.avatar,
    });
    setFormError("");
    setIsFormModalOpen(true);
  };

  // Close Form Modal
  const closeFormModal = () => {
    setIsFormModalOpen(false);
    setEditingMember(null);
    setFormError("");
    if (searchParams.get("action") === "new") {
      router.replace("/dashboard/members");
    }
  };

  // Form Submit (Add/Edit)
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { name, email, role, organizationId } = formData;

    if (!name || !email || !role || !organizationId) {
      setFormError("Name, Email, Role, and Organization are required fields.");
      return;
    }

    setIsSubmitting(true);
    setFormError("");

    try {
      if (editingMember) {
        // Edit flow
        await api.put(`/members/${editingMember.id}`, formData);
      } else {
        // Create flow
        await api.post("/members", formData);
      }
      
      closeFormModal();
      await loadData();
    } catch (err: any) {
      setFormError(err.response?.data?.error || "An error occurred during submission.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete flow
  const handleDeleteMember = async () => {
    if (!memberToDelete) return;
    setIsDeleteSubmitting(true);
    try {
      await api.delete(`/members/${memberToDelete.id}`);
      setMemberToDelete(null);
      await loadData();
    } catch (err: any) {
      alert("Failed to delete member.");
    } finally {
      setIsDeleteSubmitting(false);
    }
  };

  // Filtered members list computation
  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.role.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesOrg = selectedOrg ? m.organizationId === selectedOrg : true;
    const matchesStatus = selectedStatus ? m.status === selectedStatus : true;

    return matchesSearch && matchesOrg && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Members</h1>
          <p className="mt-1 text-slate-500">
            Search members, view dynamic profiles, customize roles, and export visual ID badges.
          </p>
        </div>
        <button
          onClick={openAddModal}
          disabled={organizations.length === 0}
          className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus:outline-none transition-all cursor-pointer hover:shadow-md shrink-0 disabled:bg-slate-300 disabled:cursor-not-allowed"
        >
          <Plus className="h-4.5 w-4.5" />
          Add Member
        </button>
      </div>

      {/* Control & Filters bar */}
      <div className="flex flex-col lg:flex-row gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
        {/* Search */}
        <div className="relative flex-grow max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search by name, email, role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-3 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <Filter className="h-4 w-4" />
            <span className="font-semibold text-slate-600">Filters:</span>
          </div>

          {/* Org Select */}
          <select
            value={selectedOrg}
            onChange={(e) => setSelectedOrg(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
          >
            <option value="">All Organizations</option>
            {organizations.map((org) => (
              <option key={org.id} value={org.id}>
                {org.name}
              </option>
            ))}
          </select>

          {/* Status Select */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="inactive">Inactive</option>
          </select>

          {(selectedOrg || selectedStatus || searchTerm) && (
            <button
              onClick={() => {
                setSelectedOrg("");
                setSelectedStatus("");
                setSearchTerm("");
              }}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Main List Table */}
      {loading ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <div className="text-center space-y-2">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
            <p className="text-sm font-medium text-slate-500">Loading members...</p>
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
            onClick={loadData}
            className="mt-4 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-semibold transition-colors cursor-pointer"
          >
            Retry
          </button>
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center bg-white shadow-2xs">
          <Users className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-4 text-lg font-bold text-slate-950">No members found</h3>
          <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">
            {searchTerm || selectedOrg || selectedStatus
              ? "No registered members fit your active search queries or filters."
              : "Register your first member profile to start issuing digital badges and PDFs."}
          </p>
          {!searchTerm && !selectedOrg && !selectedStatus && (
            <button
              onClick={openAddModal}
              disabled={organizations.length === 0}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-blue-500 focus:outline-none transition-all cursor-pointer disabled:bg-slate-300 disabled:cursor-not-allowed"
            >
              <Plus className="h-4 w-4" />
              Add Member
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-2xs">
          <table className="min-w-full divide-y divide-slate-200 text-left text-slate-900">
            <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th scope="col" className="px-6 py-4">
                  Member
                </th>
                <th scope="col" className="px-6 py-4">
                  Organization
                </th>
                <th scope="col" className="px-6 py-4">
                  Role
                </th>
                <th scope="col" className="px-6 py-4">
                  Status
                </th>
                <th scope="col" className="relative px-6 py-4">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white text-sm">
              {filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-slate-50/50 transition-colors">
                  {/* Photo & Name */}
                  <td className="whitespace-nowrap px-6 py-4.5">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 overflow-hidden rounded-full border border-slate-200 bg-slate-50">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={member.avatar} alt={member.name} className="h-full w-full object-cover" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{member.name}</div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                          <Mail className="h-3 w-3 shrink-0" />
                          <span>{member.email}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Organization */}
                  <td className="whitespace-nowrap px-6 py-4.5">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                      <Building className="h-4 w-4 text-slate-400" />
                      <span>{member.organizationName}</span>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="whitespace-nowrap px-6 py-4.5 text-slate-500 font-medium">
                    <div className="flex items-center gap-1.5">
                      <Briefcase className="h-4 w-4 text-slate-400" />
                      <span>{member.role}</span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="whitespace-nowrap px-6 py-4.5">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        member.status === "active"
                          ? "bg-emerald-50 text-emerald-700"
                          : member.status === "pending"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {member.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="whitespace-nowrap px-6 py-4.5 text-right font-medium">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/dashboard/members/${member.id}`}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-all cursor-pointer"
                        title="View profile & Badge"
                      >
                        <Eye className="h-4.5 w-4.5" />
                      </Link>
                      <button
                        onClick={() => openEditModal(member)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-all cursor-pointer"
                        title="Edit member"
                      >
                        <Edit2 className="h-4.5 w-4.5" />
                      </button>
                      <button
                        onClick={() => setMemberToDelete(member)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all cursor-pointer"
                        title="Delete member"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Member Modal Dialog */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" onClick={closeFormModal} />

          {/* Modal Container */}
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl border border-slate-200 transition-all animate-in fade-in zoom-in-95 duration-150 text-slate-900">
              {/* Close button */}
              <button
                onClick={closeFormModal}
                className="absolute right-4 top-4 rounded-md p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-500 focus:outline-none cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {editingMember ? "Edit Member Profile" : "Register New Member"}
                  </h3>
                  <p className="text-xs text-slate-500">Provide user credentials and organization tags</p>
                </div>
              </div>

              {formError && (
                <div className="mt-4 flex items-start gap-3 rounded-lg bg-rose-50 p-3.5 border border-rose-100 text-xs text-rose-800">
                  <AlertCircle className="h-4.5 w-4.5 shrink-0 text-rose-500" />
                  <div>{formError}</div>
                </div>
              )}

              <form onSubmit={handleFormSubmit} className="mt-4 space-y-4">
                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Tony Stark"
                    className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm transition-all"
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                    Email address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="e.g. tony@stark.com"
                    className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm transition-all"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="e.g. +1 (555) 019-2831"
                    className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Role */}
                  <div>
                    <label htmlFor="role" className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                      Job Role / Position
                    </label>
                    <input
                      type="text"
                      id="role"
                      name="role"
                      required
                      value={formData.role}
                      onChange={handleInputChange}
                      placeholder="e.g. CEO"
                      className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm transition-all"
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label htmlFor="status" className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                      Account Status
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm transition-all"
                    >
                      <option value="active">Active</option>
                      <option value="pending">Pending</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                {/* Organization Select */}
                <div>
                  <label htmlFor="organizationId" className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                    Assigned Organization
                  </label>
                  <select
                    id="organizationId"
                    name="organizationId"
                    required
                    value={formData.organizationId}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm transition-all"
                  >
                    {organizations.map((org) => (
                      <option key={org.id} value={org.id}>
                        {org.name} ({org.code})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Avatar URL (Optional) */}
                <div>
                  <label htmlFor="avatar" className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                    Avatar Image URL (Optional)
                  </label>
                  <input
                    type="url"
                    id="avatar"
                    name="avatar"
                    value={formData.avatar}
                    onChange={handleInputChange}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm transition-all"
                  />
                  <p className="mt-1 text-[10px] text-slate-500">Leaves empty to assign a placeholder photo.</p>
                </div>

                <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4">
                  <button
                    type="button"
                    onClick={closeFormModal}
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
                        Saving...
                      </>
                    ) : (
                      <>Save changes</>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal Dialog */}
      {memberToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" onClick={() => setMemberToDelete(null)} />

          {/* Modal Container */}
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-sm transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl border border-slate-200 transition-all text-slate-900">
              <div className="flex flex-col items-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-slate-950">Remove Member?</h3>
                <p className="mt-2 text-sm text-slate-500">
                  Are you sure you want to delete <span className="font-bold text-slate-800">{memberToDelete.name}</span>?
                  This action is permanent and will invalidate their issued ID card.
                </p>
              </div>

              <div className="mt-6 flex gap-3 justify-center border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setMemberToDelete(null)}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
                >
                  No, Keep
                </button>
                <button
                  type="button"
                  onClick={handleDeleteMember}
                  disabled={isDeleteSubmitting}
                  className="flex items-center justify-center gap-1.5 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-rose-700 transition-all disabled:bg-rose-400 cursor-pointer"
                >
                  {isDeleteSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>Yes, Delete</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
