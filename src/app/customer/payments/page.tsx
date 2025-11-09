"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
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
  ExternalLink,
} from "lucide-react";
import { useSearchParams } from "next/navigation";

// 1. Define a TypeScript type
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
  return new Intl.NumberFormat("si-LK", {
    style: "currency",
    currency: "LKR",
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

// Wrapper component for Suspense
export default function PaymentsPageWrapper() {
  return (
    <Suspense fallback={<PageLoader message="Loading page..." />}>
      <PaymentsPage />
    </Suspense>
  );
}

// Loader component
function PageLoader({ message }: { message: string }) {
  return (
    <div className="flex justify-center items-center h-64">
      <Loader2 className="h-8 w-8 animate-spin text-[#1e3a5f]" />
      <span className="ml-2 text-gray-600">{message}</span>
    </div>
  );
}

// Main Page Component
const PaymentsPage = () => {
  // 4. Set up states
  const [invoices, setInvoices] = useState<InvoiceDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [checkoutData, setCheckoutData] = useState<{ id: number; url: string } | null>(null);
  
  const searchParams = useSearchParams();
  const paymentStatus = searchParams.get("status");
  const [isVerifying, setIsVerifying] = useState(paymentStatus === "success");
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);


  // 5. Fetch data from your .NET API
  useEffect(() => {
    // Helper function for fetching
    const fetchInvoices = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/payments", {
          credentials: "include",
        });
        if (!response.ok) {
           // Try to get more specific error from backend if possible
          let errorText = `Failed to fetch: ${response.statusText}`;
          try {
            const errorJson = await response.json();
            if(errorJson.message) errorText += ` - ${errorJson.message}`;
          } catch {} // Ignore if response is not JSON
          throw new Error(errorText);
        }
        const data: InvoiceDto[] = await response.json();
        setInvoices(data);
        return data; // Return data for the verification logic
      } catch (err) {
        if (err instanceof Error) {
          setPageError(err.message);
        } else {
          setPageError("An unknown error occurred while fetching invoices.");
        }
        return []; // Return empty on error
      }
    };

    // Helper function to delay
    const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    // Robust verification logic
    const verifyPayment = async () => {
      setIsVerifying(true);
      let data = await fetchInvoices();
      // Find *any* paid invoice to confirm webhook ran
      let paidInvoiceFound = data.some(inv => inv.status === "paid"); 
      
      // Retry up to 3 times (total ~6 seconds)
      for (let i = 0; i < 3 && !paidInvoiceFound; i++) {
        await wait(2000); // Wait 2 seconds
        console.log(`Retrying fetch (${i + 1}/3)...`); // Log retry attempts
        data = await fetchInvoices();
        paidInvoiceFound = data.some(inv => inv.status === "paid");
      }
      
      setIsLoading(false);
      setIsVerifying(false);
      if (paidInvoiceFound) {
        console.log("Verification successful: Found paid invoice.");
        setShowSuccessBanner(true);
      } else {
         console.warn("Verification potentially failed: No paid invoice found after retries.");
      }
    };

    if (paymentStatus === "success") {
      console.log("Payment success detected, starting verification...");
      verifyPayment();
    } else {
      console.log("No payment status detected, fetching invoices normally.");
      fetchInvoices().finally(() => setIsLoading(false));
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on initial load

  // 6. Calculate summary stats
  const summaryStats = useMemo(() => {
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

  // Handle "Pay Now" click (Step 1 of 2)
  const handleGetCheckoutUrl = async (appointmentId: number) => {
    console.log("handleGetCheckoutUrl called for ID:", appointmentId);
    setLoadingId(appointmentId); 
    setPaymentError(null);
    setCheckoutData(null); 

    try {
      const response = await fetch(
        "http://localhost:5000/api/payments/create-checkout-session",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ appointmentId }),
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Failed to create payment session.");
      }

      const { url } = await response.json();
      console.log("Fetch successful, setting checkoutData for ID:", appointmentId);
      setCheckoutData({ id: appointmentId, url: url });

    } catch (err) {
      console.error("Error fetching checkout URL for ID:", appointmentId, err);
      if (err instanceof Error) {
        setPaymentError(err.message);
      } else {
        setPaymentError("An unknown error occurred during payment initiation.");
      }
    } finally {
      console.log("Setting loadingId back to null from ID:", appointmentId);
      setLoadingId(null); 
    }
  };

  // 7. Render loading state
  if (isLoading || isVerifying) {
    return (
      <PageLoader 
        message={isVerifying ? "Verifying payment, please wait..." : "Loading payments..."} 
      />
    );
  }

  // 8. Render critical page error state
  if (pageError) {
    return (
      <div className="flex flex-col justify-center items-center h-64 bg-red-50 border border-red-200 rounded-lg p-6">
        <AlertTriangle className="h-8 w-8 text-red-500" />
        <h3 className="text-lg font-semibold text-red-700 mt-2">
          {pageError}
        </h3>
        <p className="text-sm text-gray-500 mt-2">
          Please try refreshing the page or contact support if the problem persists.
        </p>
      </div>
    );
  }

  // 9. Render the page with data
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Payments & Billing
        </h1>
        <p className="text-gray-600">Manage your payments and invoices</p>
      </div>
      
      {paymentError && (
        <div className="flex items-center gap-3 mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <AlertTriangle className="h-6 w-6 text-red-500 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-semibold text-red-700">
              Payment Error
            </h3>
            <p className="text-sm text-red-600">{paymentError}</p>
          </div>
        </div>
      )}

      {showSuccessBanner && (
        <div className="flex items-center gap-3 mb-4 bg-green-50 border border-green-200 rounded-lg p-4">
          <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-semibold text-green-700">
              Payment Successful!
            </h3>
            <p className="text-sm text-green-600">Your invoice has been updated.</p>
          </div>
        </div>
      )}

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
                {/* Badge shows status */}
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

                  <div className="flex gap-2 flex-shrink-0">
                    
                    {/* --- 1. SHOW "PAY NOW" IF PENDING --- */}
                    {invoice.status === "pending" && (
                      <>
                        {checkoutData?.id === invoice.appointmentId ? (
                          <Button 
                            className="bg-green-600 hover:bg-green-700"
                            asChild
                          >
                            <a href={checkoutData.url}>
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Confirm & Proceed to Pay
                            </a>
                          </Button>
                        ) : (
                          <Button
                            className="bg-[#1e3a5f] hover:bg-[#1e3a5f]/90"
                            onClick={() => handleGetCheckoutUrl(invoice.appointmentId)}
                            disabled={loadingId !== null} 
                          >
                            {loadingId === invoice.appointmentId ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : null}
                            Pay Now
                          </Button>
                        )}
                      </>
                    )}

                    {/* --- 2. SHOW "DOWNLOAD" IF PAID --- */}
                    {invoice.status === "paid" && invoice.invoiceLink && (
                      <Button variant="outline" asChild>
                        <a
                          href={invoice.invoiceLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          download={`${invoice.invoiceNumber}.pdf`}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download Receipt
                        </a>
                      </Button>
                    )}
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