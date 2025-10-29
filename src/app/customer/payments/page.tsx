"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  CheckCircle2,
  Download,
  CreditCard,
  Calendar,
  AlertTriangle,
  Loader2,
} from "lucide-react";
// No need to import Stripe.js, we are doing a full redirect

// 1. Define a TypeScript type that MATCHES your new .NET InvoiceDto
interface InvoiceDto {
  appointmentId: number;
  invoiceNumber: string;
  serviceName: string;
  status: "paid" | "pending";
  amount: number;
  date: string;
  dueDate?: string;
  paymentMethod?: string;
  invoiceLink?: string;
}

// 2. Helper function to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

// 3. Helper function to format dates
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  });
};

const PaymentsPage = () => {
  // 4. Set up states for data, loading, and errors
  const [invoices, setInvoices] = useState<InvoiceDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false); // State for payment redirect
  const [error, setError] = useState<string | null>(null);

  // 5. Fetch data from your .NET API
  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await fetch("http://localhost:5001/api/payments", {
          // Send cookies (like the JWT token) with the request
          credentials: "include", 
        });

        if (response.status === 401) {
          // Handle unauthorized, e.g., redirect to login
          throw new Error("Unauthorized: Please log in.");
        }
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.statusText}`);
        }

        const data: InvoiceDto[] = await response.json();
        setInvoices(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvoices();
  }, []); // The empty array [] means this runs once

  // 6. Calculate summary stats (existing code)
  const summaryStats = useMemo(() => {
    // ... (your existing summaryStats logic is fine) ...
    const totalPaid = invoices
      .filter((inv) => inv.status === "paid")
      .reduce((sum, inv) => sum + inv.amount, 0);

    const pendingAmount = invoices
      .filter((inv) => inv.status === "pending")
      .reduce((sum, inv) => sum + inv.amount, 0);

    return [
      {
        title: "Total Paid",
        amount: formatCurrency(totalPaid),
        subtitle: "All time",
        icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
      },
      {
        title: "Pending Payments",
        amount: formatCurrency(pendingAmount),
        subtitle: "Due soon",
        icon: <Clock className="h-5 w-5 text-yellow-500" />,
      },
    ];
  }, [invoices]);

  // --- NEW: Handle "Pay Now" click ---
  const handlePayNow = async (appointmentId: number) => {
    setIsRedirecting(true);
    setError(null);

    try {
      const response = await fetch(
        "http://localhost:5001/api/payments/create-checkout-session",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ appointmentId }),
          // Send cookies (JWT token) to authorize this request
          credentials: "include", 
        }
      );

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Failed to create payment session.");
      }

      const { url } = await response.json();
      
      // Redirect the user to the Stripe Checkout page
      window.location.href = url;

    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred during payment initiation.");
      }
      setIsRedirecting(false);
    }
  };

  // 7. Render loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#1e3a5f]" />
        <span className="ml-2 text-gray-600">Loading payments...</span>
      </div>
    );
  }

  // 8. Render error state
  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-64 bg-red-50 border border-red-200 rounded-lg p-6">
        <AlertTriangle className="h-8 w-8 text-red-500" />
        <h3 className="text-lg font-semibold text-red-700 mt-2">
          {error}
        </h3>
        <p className="text-sm text-gray-500 mt-2">
          Please try refreshing the page.
        </p>
      </div>
    );
  }

  // 9. Render the page with data
  return (
    <div className="max-w-5xl mx-auto">
      {/* ... (your existing header and summary cards are fine) ... */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Payments & Billing
        </h1>
        <p className="text-gray-600">Manage your payments and invoices</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {summaryStats.map((stat) => (
          <div
            key={stat.title}
            className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {stat.title}
                </p>
                <p className="text-xs text-gray-500">{stat.subtitle}</p>
              </div>
              {stat.icon}
            </div>
            <p className="text-3xl font-bold text-gray-900">{stat.amount}</p>
          </div>
        ))}
      </div>

      {/* Invoices List (dynamic) */}
      <div className="space-y-4">
        {invoices.length > 0 ? (
          invoices.map((invoice) => (
            <div
              key={invoice.appointmentId}
              className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm"
            >
              {/* ... (existing invoice header is fine) ... */}
              <div className="flex flex-col md:flex-row justify-between md:items-start mb-4">
                <div className="flex items-center gap-3 mb-4 md:mb-0">
                  {invoice.status === "paid" ? (
                    <CheckCircle2 className="h-7 w-7 text-green-500 flex-shrink-0" />
                  ) : (
                    <Clock className="h-7 w-7 text-yellow-500 flex-shrink-0" />
                  )}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {invoice.invoiceNumber}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {invoice.serviceName}
                    </p>
                  </div>
                </div>
                <Badge
                  className={
                    invoice.status === "paid"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }
                >
                  {invoice.status}
                </Badge>
              </div>


              <div className="border-t border-gray-100 pt-4">
                <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
                  {/* ... (existing details section is fine) ... */}
                  <div className="space-y-3">
                    <p className="text-3xl font-bold text-gray-900">
                      {formatCurrency(invoice.amount)}
                    </p>
                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>Date: {formatDate(invoice.date)}</span>
                      </div>

                      {invoice.status === "pending" && invoice.dueDate && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-red-500" />
                          <span className="font-medium">
                            Due Date: {formatDate(invoice.dueDate)}
                          </span>
                        </div>
                      )}

                      {invoice.status === "paid" && invoice.paymentMethod && (
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          <span>Payment Method: {invoice.paymentMethod}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* --- MODIFIED BUTTONS --- */}
                  <div className="flex gap-2 flex-shrink-0">
                    {invoice.status === "pending" && (
                      <Button
                        className="bg-[#1e3a5f] hover:bg-[#1e3a5f]/90"
                        onClick={() => handlePayNow(invoice.appointmentId)}
                        disabled={isRedirecting} // Disable button while redirecting
                      >
                        {isRedirecting ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : null}
                        Pay Now
                      </Button>
                    )}
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Download Invoice
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 p-10 bg-white border border-gray-200 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold">No invoices found</h3>
            <p>Your payment history will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentsPage;