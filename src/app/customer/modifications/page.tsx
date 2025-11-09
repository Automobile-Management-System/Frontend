'use client';

import { useState, useEffect } from 'react';
import { ModificationRequest } from '@/types';
import RequestCard from '../../../../components/customer/RequestCard';
import AddRequestModal from '../../../../components/customer/AddRequestModal';

const STATUS_TABS = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'Pending' },
  { label: 'Upcoming', value: 'Upcoming' },
  { label: 'In Progress', value: 'InProgress' },
  { label: 'Completed', value: 'Completed' },
  { label: 'Rejected', value: 'Rejected' },
];

// Map backend AppointmentStatus to readable format
const mapStatus = (status: string): string => {
  switch (status) {
    case 'InProgress':
      return 'In Progress';
    case 'Upcoming':
      return 'Upcoming';
    default:
      return status;
  }
};

export default function ModificationsPage() {
  const [requests, setRequests] = useState<ModificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/customer-modification-requests', {
        credentials: 'include',
      });
      if (!res.ok) throw new Error(`Error: ${res.status}`);
      const data = await res.json();

      // Map backend appointment status into readable form
      const formatted = data.map((r: any) => ({
        ...r,
        requestStatus: mapStatus(r.requestStatus), // AppointmentStatus → requestStatus
        createdDateString: new Date(r.createdDate).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
      }));
      setRequests(formatted);
    } catch (err) {
      console.error('Failed to fetch requests', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const filteredRequests =
    activeStatus === 'all'
      ? requests
      : requests.filter(r => r.requestStatus.replace(' ', '') === activeStatus);

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Modification Requests</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-900 transition"
        >
          + New Request
        </button>
      </div>

      {/* Status Tabs */}
      <div className="flex flex-wrap gap-3 mb-6">
        {STATUS_TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => setActiveStatus(tab.value)}
            className={`px-4 py-2 rounded-full font-medium transition ${
              activeStatus === tab.value
                ? 'bg-blue-900 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Requests */}
      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : filteredRequests.length === 0 ? (
        <p className="text-center text-gray-400">No requests found.</p>
      ) : (
        <div className="grid gap-4">
          {filteredRequests.map(req => (
            <RequestCard key={req.modificationId} request={req} />
          ))}
        </div>
      )}

      <AddRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchRequests}
      />
    </div>
  );
}
