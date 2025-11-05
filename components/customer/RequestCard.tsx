import { ModificationRequest } from '@/types';

interface Props {
  request: ModificationRequest;
}

const STATUS_STYLES: Record<string, string> = {
  Pending: 'bg-yellow-50 text-yellow-800',
  Upcoming: 'bg-cyan-50 text-cyan-800',
  'In Progress': 'bg-blue-50 text-blue-800',
  Completed: 'bg-green-50 text-green-800',
  Rejected: 'bg-red-50 text-red-800',
};

export default function RequestCard({ request }: Props) {
  const isPending = request.requestStatus === 'Pending';
  const displayAmount = request.displayAmount;

  return (
    <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-6 hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{request.title}</h3>
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[request.requestStatus] || 'bg-gray-100 text-gray-800'} uppercase tracking-wide`}
        >
          {request.requestStatus}
        </span>
      </div>

      {/* Description */}
      <p className="text-gray-600 text-sm mb-5 line-clamp-3">{request.description}</p>

      {/* Divider */}
      <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
        {/* Vehicle */}
        <div className="flex flex-col">
          <span className="text-gray-500 text-xs">Vehicle</span>
          <span className="text-gray-800 font-medium">{request.vehicleRegistrationNumber || 'N/A'}</span>
        </div>

        {/* Date & Amount */}
        <div className="flex flex-col items-end gap-1">
          <span className="text-gray-400 text-xs">{request.createdDateString}</span>
          <span
            className={`text-sm px-2 py-1 rounded-lg font-semibold ${
              isPending ? 'italic text-gray-400 bg-gray-50' : 'text-green-700 bg-green-100'
            }`}
          >
            {displayAmount}
          </span>
        </div>
      </div>
    </div>
  );
}
