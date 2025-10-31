'use client';

import { useState, useEffect } from 'react';
import { ModificationRequest, Vehicle } from '@/types';
import { api } from '@/services/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
  onSuccess: () => void;
}

export default function AddRequestModal({ isOpen, onClose, userId, onSuccess }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [vehicleId, setVehicleId] = useState<number | ''>('');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch user vehicles when modal opens
  useEffect(() => {
    if (!isOpen) return; // only run when modal is open

    const fetchVehicles = async () => {
      if (!userId) return; // safety check
      try {
        const res = await api.getUserVehicles(userId);
        // TypeScript cast, assuming API returns correct Vehicle[]
        setVehicles(res.data as Vehicle[]);
      } catch (err) {
        console.error('Failed to load vehicles:', err);
        alert('Failed to load vehicles');
      }
    };

    fetchVehicles();
  }, [isOpen, userId]); // stable dependency array

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || vehicleId === '') return;

    setLoading(true);
    try {
      await api.createRequest({
        title,
        description,
        vehicleId,
        userId,
      });
      onSuccess();
      onClose();
      setTitle('');
      setDescription('');
      setVehicleId('');
    } catch (err) {
      console.error('Failed to create request:', err);
      alert('Failed to create request');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-5">New Modification Request</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project Title</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Kitchen Renovation"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe the modifications needed..."
              required
            />
          </div>

          {/* Vehicle Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Vehicle</label>
            <select
              value={vehicleId}
              onChange={e => setVehicleId(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Choose a vehicle</option>
              {vehicles.map(v => (
                <option key={v.vehicleId} value={v.vehicleId}>
                  {v.registrationNumber} ({v.model})
                </option>
              ))}
            </select>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed transition"
            >
              {loading ? 'Creating...' : 'Create Request'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-200 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
