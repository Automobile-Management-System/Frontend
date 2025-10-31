'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Download, RefreshCw } from 'lucide-react';

// API URL (centralized for easy changes)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

interface ReportDownloadButtonProps {
  /** The API endpoint to fetch the report from (e.g., "/admin/payments/report") */
  endpoint: string;
  /** The default file name for the download (e.g., "payments-report.pdf") */
  fileName: string;
  /** The text to display on the button */
  buttonLabel: string;
  /** Optional additional class names for styling */
  className?: string;
  /** * Optional query parameters to send with the request.
   * --- FIX: Allow undefined values ---
   */
  params?: Record<string, string | number | undefined>;
}

export default function ReportDownloadButton({
  endpoint,
  fileName,
  buttonLabel,
  className,
  params,
}: ReportDownloadButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);

    // --- FIX: Correctly build URLSearchParams, filtering out undefined ---
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        // This is the important check:
        // Only append the parameter if it's not undefined or null.
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }

    const queryString = searchParams.toString();
    const fetchUrl = `${API_BASE_URL}${endpoint}${queryString ? `?${queryString}` : ''}`;
    // --- END FIX ---

    const promise = fetch(fetchUrl)
      .then(async (response) => {
        if (!response.ok) {
          // Try to parse the JSON error from the backend
          const errorJson = await response.json().catch(() => null);
          if (errorJson && errorJson.title) {
            throw new Error(errorJson.title);
          }
          // Fallback for non-JSON errors
          const errorText = await response.text();
          throw new Error(errorText || 'Failed to generate report.');
        }
        return response.blob();
      })
      .then((blob) => {
        // Create a URL for the blob
        const url = window.URL.createObjectURL(blob);
        // Create a temporary link element to trigger the download
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        a.remove();
        window.URL.revokeObjectURL(url);
      });

    toast.promise(promise, {
      loading: 'Generating report...',
      success: `${fileName} downloaded successfully!`,
      error: (err: Error) => `Report Error: ${err.message}`,
      finally: () => setIsDownloading(false),
    });
  };

  return (
    <Button
      onClick={handleDownload}
      disabled={isDownloading}
      className={className}
    >
      {isDownloading ? (
        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Download className="h-4 w-4 mr-2" />
      )}
      {buttonLabel}
    </Button>
  );
}