'use client';

import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Vehicle } from '@/types';
import { api } from '@/services/api';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'; // your alert import

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ToastProps {
  message: string;
  type: 'success' | 'error';
}

export default function AddRequestModal({ isOpen, onClose, onSuccess }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [vehicleId, setVehicleId] = useState<number | ''>('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false);
  const [toast, setToast] = useState<ToastProps | null>(null);

  // Hide toast automatically after 3s
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (!isOpen) return;

    const fetchVehicles = async () => {
      setLoadingVehicles(true);
      setUnauthorized(false);
      try {
        const res = await api.getUserVehicles();
        setVehicles(res.data as Vehicle[]);
      } catch (err: any) {
        console.error(err);
        setToast({ message: 'Failed to load vehicles.', type: 'error' });
      } finally {
        setLoadingVehicles(false);
      }
    };

    fetchVehicles();
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !description || vehicleId === '' || !selectedDate) {
      setToast({ message: 'Please fill all fields including date.', type: 'error' });
      return;
    }

    setLoading(true);
    setToast(null);

    try {
      await api.createRequest({
        title,
        description,
        vehicleId: Number(vehicleId),
        requestDate: selectedDate.toISOString(),
      });

      setToast({ message: 'Request created successfully!', type: 'success' });

      setTitle('');
      setDescription('');
      setVehicleId('');
      setSelectedDate(null);

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      setToast({ message: 'Failed to create request.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Toast popup using Alert */}
      {toast && (
        <div className="fixed top-5 right-5 z-50">
          <Alert variant={toast.type === 'error' ? 'destructive' : 'default'}>
            <AlertTitle>{toast.type === 'error' ? 'Error' : 'Success'}</AlertTitle>
            <AlertDescription>{toast.message}</AlertDescription>
          </Alert>
        </div>
      )}

      <div className="fixed inset-0 flex items-center justify-center z-40 p-4">
        <div className="absolute inset-0 backdrop-blur-sm" onClick={onClose}></div>
        <div className="relative bg-white shadow-2xl rounded-2xl max-w-lg w-full p-8">
          <h2 className="text-3xl font-semibold mb-6 text-gray-900 text-center">
            New Modification Request
          </h2>

          {unauthorized ? (
            <p className="text-red-500 text-center mb-4">
              You are not logged in. Please log in to see your vehicles.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Title</label>
                <input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                  className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Description</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={4}
                  required
                  className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                />
              </div>

              {/* Vehicle */}
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

              {/* Date picker */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Select Date</label>
                <DatePicker
                  selected={selectedDate}
                  onChange={date => setSelectedDate(date)}
                  dateFormat="yyyy-MM-dd"
                  placeholderText="Select a request date"
                  className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                  minDate={new Date()}
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-blue-900 to-indigo-900 text-white py-3 rounded-xl font-medium hover:from-blue-900 hover:to-indigo-900 disabled:opacity-70 transition-all shadow-lg"
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
    </>
  );
}
