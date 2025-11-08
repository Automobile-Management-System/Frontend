import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EmployeeTimeLogDTO } from '@/types/employeeTimeLog';
import { formatApiDate } from '@/lib/apiUtils';

interface Props {
  timeLogs: EmployeeTimeLogDTO[];
}

export default function ServicesTable({ timeLogs }: Props) {
  // Aggregate services
  const map = new Map<string, { count: number; lastUsed: string | null; customers: Set<string> }>();

  timeLogs.forEach((log) => {
    const date = log.endDateTime || log.startDateTime;
    
    // FIX 1: Use 'completedServices' and optional chaining '?.'.
    // FIX 2: Add type 'string' to parameter 's'.
    log.completedServices?.forEach((s: string) => {
      const existing = map.get(s) || { count: 0, lastUsed: null, customers: new Set<string>() };
      existing.count += 1;
      existing.customers.add(log.customerName);
      if (!existing.lastUsed || new Date(date) > new Date(existing.lastUsed)) {
        existing.lastUsed = date;
      }
      map.set(s, existing);
    });
  });

  const rows = Array.from(map.entries()).sort((a, b) => b[1].count - a[1].count);

  if (rows.length === 0) {
    return (
      <div className="p-6">
        <p className="text-gray-600">No services found in the selected time logs.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[200px]">Service</TableHead>
            <TableHead className="min-w-[90px]">Count</TableHead>
            <TableHead className="min-w-[160px]">Last Used</TableHead>
            <TableHead className="min-w-[240px]">Sample Customers</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map(([service, info]) => (
            <TableRow key={service} className="hover:bg-gray-50">
              <TableCell className="font-medium">{service}</TableCell>
              <TableCell>{info.count}</TableCell>
              <TableCell>{info.lastUsed ? formatApiDate(info.lastUsed) : '-'}</TableCell>
              <TableCell>
                {Array.from(info.customers).slice(0, 3).join(', ')}
                {info.customers.size > 3 && ` +${info.customers.size - 3} more`}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}