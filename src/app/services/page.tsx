"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Navbar } from "../../../components/common/navbar";
import { Footer } from "../../../components/common/footer";

interface ViewServiceDto {
  serviceName: string;
  description: string;
  basePrice: number;
}

interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

const BACKEND_URL = "http://localhost:5001";

export default function ViewServicesPage() {
  const [services, setServices] = React.useState<ViewServiceDto[]>([]);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [pageNumber, setPageNumber] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const pageSize = 12;

  const fetchServices = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams({
        pageNumber: pageNumber.toString(),
        pageSize: pageSize.toString(),
      });
      if (searchTerm.trim()) {
        queryParams.append("search", searchTerm);
      }

      const res = await fetch(`${BACKEND_URL}/api/viewservice?${queryParams.toString()}`);

      if (!res.ok) throw new Error("Failed to fetch services from backend");

      const data: PagedResult<ViewServiceDto> = await res.json();
      setServices(data.items);
      setTotalPages(data.totalPages);
    } catch (err: any) {
      console.error("Error fetching services:", err);
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [pageNumber, searchTerm]);

  React.useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPageNumber(1);
  };

  const handlePrevPage = () => setPageNumber((prev) => Math.max(prev - 1, 1));
  const handleNextPage = () => setPageNumber((prev) => Math.min(prev + 1, totalPages));

  return (
    <div className="min-h-screen">
      <Navbar />

      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto">
          <h1 className="text-4xl lg:text-5xl font-semibold mb-6 animate-slide-up">View Services</h1>

          {/* Search Input */}
          <div className="mb-8 flex gap-2">
            <input
              type="text"
              placeholder="Search services..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="flex-1 border rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button onClick={fetchServices} className="bg-orange-400 hover:bg-orange-300">Search</Button>
          </div>

          {/* Loading / Error */}
          {loading && <p className="animate-fade-in">Loading services...</p>}
          {error && <p className="text-red-500 mb-4 animate-fade-in">{error}</p>}

          {/* Services Grid */}
          {services.length === 0 && !loading ? (
            <p className="animate-fade-in">No services found.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service, idx) => (
                <Card
                  key={idx}
                  className="transition-smooth hover:shadow-lg hover:-translate-y-1 animate-scale-in border-border/50"
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  <CardHeader>
                    <CardTitle>{service.serviceName}</CardTitle>
                    <CardDescription>{service.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="font-semibold">Price: LKR {service.basePrice.toFixed(2)}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          <div className="flex justify-center items-center gap-4 mt-8">
            <Button disabled={pageNumber === 1} onClick={handlePrevPage} className="bg-orange-400 hover:bg-orange-300">
              Previous
            </Button>
            <span>
              Page {pageNumber} of {totalPages}
            </span>
            <Button disabled={pageNumber === totalPages} onClick={handleNextPage} className="bg-orange-400 hover:bg-orange-300">
              Next
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
