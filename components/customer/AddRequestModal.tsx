'use client';

import { useState, useEffect } from 'react';
import { Vehicle } from '@/types';
import { api } from '@/services/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddRequestModal({ isOpen, onClose, onSuccess }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [vehicleId, setVehicleId] = useState<number | ''>('');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false);

  // Fetch vehicles for logged-in user
  useEffect(() => {
    if (!isOpen) return;

    const fetchVehicles = async () => {
      setLoadingVehicles(true);
      setUnauthorized(false);
      try {
        const res = await api.getUserVehicles();
        setVehicles(res.data as Vehicle[]);
      } catch (err: any) {
        console.error('Failed to fetch vehicles:', err);
        if (err.response?.status === 401) {
          setUnauthorized(true);
        } else {
          alert('Failed to load vehicles.');
        }
      } finally {
        setLoadingVehicles(false);
      }
    };

    fetchVehicles();
  }, [isOpen]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || vehicleId === '') return;

    setLoading(true);
    try {
      await api.createRequest({ title, description, vehicleId });
      onSuccess();
      onClose();
      setTitle('');
      setDescription('');
      setVehicleId('');
    } catch (err: any) {
      console.error('Failed to create request:', err);
      if (err.response?.status === 401) {
        alert('You are not logged in. Please log in to create a request.');
      } else {
        alert('Failed to create request.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 relative transform transition-all scale-100">
        <h2 className="text-3xl font-semibold mb-6 text-gray-900 text-center">
          New Modification Request
        </h2>
        {unauthorized ? (
          <p className="text-red-500 text-center mb-4">
            You are not logged in. Please log in to see your vehicles.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Title</label>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
                className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={4}
                required
                className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Vehicle</label>
              {loadingVehicles ? (
                <p>Loading vehicles...</p>
              ) : (
                <select
                  value={vehicleId}
                  onChange={e => setVehicleId(Number(e.target.value))}
                  required
                  className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                >
                  <option value="">Choose a vehicle</option>
                  {vehicles.map(v => (
                    <option key={v.vehicleId} value={v.vehicleId}>
                      {v.registrationNumber} ({v.model})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-3 rounded-xl font-medium hover:from-blue-600 hover:to-indigo-600 disabled:opacity-70 transition-all shadow-lg"
              >
                {loading ? 'Creating...' : 'Create Request'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
