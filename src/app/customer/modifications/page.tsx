"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle } from "lucide-react";
import { api } from "@/services/api";
import { useAuth } from "../../context/AuthContext";
import { ModificationCard } from "../../../../components/customer/ModificationCard";
import AddRequestModal from "../../../../components/customer/AddRequestModal";

interface LocalUser {
  id?: number;
  email: string;
  firstName: string;
  lastName: string;
  role: "Admin" | "Employee" | "Customer";
}

export interface ModificationRequest {
  modificationId: number;
  title: string;
  description: string;
  vehicleId: number;
  appointmentId: number;
  createdDateString?: string;
  createdTimeString?: string;
  requestStatus: "Pending" | "InProgress" | "Completed";
  appointmentSummary?: string;
  progress?: number; // optional progress like in appointments
}

export default function Modifications() {
  const { user: authUser, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const user = authUser as unknown as LocalUser;

  const [requests, setRequests] = useState<ModificationRequest[]>([]);
  const [activeTab, setActiveTab] = useState<"Pending" | "InProgress" | "Completed">("Pending");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [authLoading, user, router]);

  const fetchRequests = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const res = await api.getUserRequests(user.id);
      const dataArray: ModificationRequest[] = Array.isArray(res.data) ? res.data : [];
      setRequests(dataArray);
    } catch (err) {
      console.error("Failed to load requests", err);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) fetchRequests();
  }, [user]);

  const filteredRequests = requests.filter(
    (r) => r.requestStatus.toLowerCase() === activeTab.toLowerCase()
  );

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Loading session...</p>
      </div>
    );
  }

  if (!user) return null;

  const statusColors: Record<string, string> = {
    Pending: "bg-yellow-100 text-yellow-800",
    InProgress: "bg-blue-100 text-blue-800",
    Completed: "bg-green-100 text-green-800",
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <h1 className="text-2xl font-bold text-gray-900">Modification Requests</h1>
            <p className="text-gray-500">Track your service modification projects</p>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Tabs & Add button */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              {(["Pending", "InProgress", "Completed"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2 rounded-md text-sm font-medium transition ${
                    activeTab === tab
                      ? "bg-white text-blue-700 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {tab === "InProgress" ? "In Progress" : tab}
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2"
            >
              <PlusCircle size={20} />
              New Request
            </button>
          </div>

          {/* Requests */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl shadow p-6 border border-gray-100 animate-pulse"
                >
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              ))}
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border">
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-20 h-20 mx-auto mb-4"></div>
              <p className="text-gray-500">
                No {activeTab === "InProgress" ? "In Progress" : activeTab.toLowerCase()} requests
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRequests.map((request) => (
                <div
                  key={request.modificationId}
                  className="bg-white border border-gray-200 rounded-xl shadow-sm p-6"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">{request.title}</h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        statusColors[request.requestStatus]
                      }`}
                    >
                      {request.requestStatus === "InProgress" ? "In Progress" : request.requestStatus}
                    </span>
                  </div>

                  <p className="text-gray-600 mb-4 text-sm">{request.description}</p>

                  {request.progress !== undefined && (
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Progress</span>
                        <span className="text-sm font-medium text-gray-900">
                          {request.progress}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${request.progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 mt-2">
                    <button className="flex-1 text-sm px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                      Edit
                    </button>
                    <button className="flex-1 text-sm px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                      Cancel
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      <AddRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userId={user.id ?? 0}
        onSuccess={fetchRequests}
      />
    </>
  );
}
