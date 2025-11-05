import { ModificationRequest } from '@/types';

interface Props {
  request: ModificationRequest;
}

const STATUS_COLORS: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Upcoming: 'bg-cyan-100 text-cyan-800',
  'In Progress': 'bg-blue-100 text-blue-800',
  Completed: 'bg-green-100 text-green-800',
  Rejected: 'bg-red-100 text-red-800',
};

export default function RequestCard({ request }: Props) {
  const statusColor = STATUS_COLORS[request.requestStatus] || 'bg-gray-100 text-gray-800';

  const isPending = request.requestStatus === 'Pending';
  const displayAmount = request.displayAmount;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-gray-900">{request.title}</h3>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}>
          {request.requestStatus}
        </span>
      </div>

      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{request.description}</p>

      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center gap-1">
          <span className="font-medium">Vehicle Reg. No:</span>
          <span>{request.vehicleRegistrationNumber || 'N/A'}</span>
        </div>

        <div className="flex flex-col items-end">
          <span>{request.createdDateString}</span>
          <span className={`text-sm ${isPending ? 'italic text-gray-400' : 'text-gray-700 font-medium'}`}>
            {displayAmount}
          </span>
        </div>
      </div>
    </div>
  );
}
