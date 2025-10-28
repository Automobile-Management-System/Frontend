"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { PlusCircle } from "lucide-react";
import axios from "axios";

// DTO interface
interface ModificationRequest {
  modificationId: number;
  title: string;
  description: string;
  vehicleId: number;
  appointmentId: number;
  createdDateString: string;
  createdTimeString: string;
  requestStatus: string;
  appointmentSummary: string;
}

export default function Modifications() {
  const [requests, setRequests] = useState<ModificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [vehicleId, setVehicleId] = useState<number | "">("");
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState<'Upcoming' | 'InProgress' | 'Completed'>('InProgress');

  const fetchRequests = async () => {
    try {
      const res = await axios.get<ModificationRequest[]>(
        "https://localhost:7230/api/modification-requests"
      );
      setRequests(res.data);
    } catch (error) {
      console.error("Error fetching modification requests:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post("https://localhost:7230/api/modification-requests", {
        title,
        description,
        vehicleId,
        appointmentId: 1, // replace with selected appointment ID
      });
      setTitle("");
      setDescription("");
      setVehicleId("");
      setModalOpen(false);
      fetchRequests(); // refresh list after adding
      alert("Modification request submitted!");
    } catch (error) {
      console.error("Error adding modification request:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen px-8 py-8 ">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">
            Modification Requests
          </h1>
          <p className="text-gray-500">Track your service modification projects</p>
        </div>
        <Button
          className="flex items-center gap-2 bg-[#1e3a5f] hover:bg-[#1e3a5f]/90"
          onClick={() => setModalOpen(true)}
        >
          <PlusCircle size={20} />
          New Request
        </Button>
      </div>

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">New Modification Request</h2>
          <p className="text-gray-500 mb-6">Submit a request for service modifications or custom work.</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Enter project title"
              label="Project Title"
            />
            <Input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              placeholder="Describe your modification"
              label="Description"
            />
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Vehicle</label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                value={vehicleId}
                onChange={e => setVehicleId(Number(e.target.value))}
                required
              >
                <option value="" disabled>Select vehicle</option>
                <option value={1}>Vehicle 1</option>
                <option value={2}>Vehicle 2</option>
                <option value={3}>Vehicle 3</option>
              </select>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-[#1e3a5f] hover:bg-[#1e3a5f]/90" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Filter Buttons */}
      <div className="flex gap-4 mb-6">
        <Button
          className={`px-6 py-2 rounded-full font-semibold shadow-sm transition-all border border-gray-200 ${filter === 'Upcoming' ? 'bg-[#1e3a5f] text-white' : 'bg-white text-[#1e3a5f] hover:bg-[#1e3a5f]/10'}`}
          onClick={() => setFilter('Upcoming')}
        >
          Upcoming
        </Button>
        <Button
          className={`px-6 py-2 rounded-full font-semibold shadow-sm transition-all border border-gray-200 ${filter === 'InProgress' ? 'bg-[#1e3a5f] text-white' : 'bg-white text-[#1e3a5f] hover:bg-[#1e3a5f]/10'}`}
          onClick={() => setFilter('InProgress')}
        >
          In Progress
        </Button>
        <Button
          className={`px-6 py-2 rounded-full font-semibold shadow-sm transition-all border border-gray-200 ${filter === 'Completed' ? 'bg-[#1e3a5f] text-white' : 'bg-white text-[#1e3a5f] hover:bg-[#1e3a5f]/10'}`}
          onClick={() => setFilter('Completed')}
        >
          Completed
        </Button>
      </div>

      {/* Modification Cards */}
      {loading ? (
        <p className="text-gray-600">Loading requests...</p>
      ) : requests.length === 0 ? (
        <p className="text-gray-600">No modification requests found.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests
            .filter((mod) => {
              if (filter === 'Upcoming') return mod.requestStatus === 'Pending';
              if (filter === 'InProgress') return mod.requestStatus === 'InProgress';
              if (filter === 'Completed') return mod.requestStatus === 'Completed';
              return true;
            })
            .map((mod) => (
              <div
                key={mod.modificationId}
                className="bg-blue-50 rounded-2xl shadow p-6 border border-gray-100 hover:shadow-md transition"
              >
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-bold text-gray-800">{mod.title}</h3>
                  <span
                    className={`px-2 py-1 text-sm rounded-full font-medium ${
                      mod.requestStatus === "Pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : mod.requestStatus === "InProgress"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {mod.requestStatus}
                  </span>
                </div>
                <p className="text-blue-600 mt-2">{mod.description}</p>
                <p className="text-sm text-gray-400 mt-3">{mod.appointmentSummary}</p>
                <p className="text-sm text-gray-400 mt-1">Vehicle ID: {mod.vehicleId}</p>
                <p className="text-sm text-gray-400 mt-1">
                  Created: {mod.createdDateString} ⏰ {mod.createdTimeString}
                </p>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
