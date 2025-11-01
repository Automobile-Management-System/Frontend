// src/components/customer/RequestCard.tsx
import { ModificationRequest } from '@/types';

interface Props {
  request: ModificationRequest;
}

const STATUS_COLORS: Record<ModificationRequest['requestStatus'], string> = {
  Pending: 'bg-yellow-100 text-yellow-800',
  'In Progress': 'bg-blue-100 text-blue-800',
  Completed: 'bg-green-100 text-green-800',
  Rejected: 'bg-red-100 text-red-800',
};

export default function RequestCard({ request }: Props) {
  const statusColor = STATUS_COLORS[request.requestStatus];

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
          <span className="font-medium">Vehicle:</span>
          <span>{request.vehicle?.model || `ID: ${request.vehicleId}`}</span>
        </div>
        <div>{request.createdDateString}</div>
      </div>
    </div>
  );
}
