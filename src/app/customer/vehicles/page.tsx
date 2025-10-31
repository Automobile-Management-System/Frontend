"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Car, Edit2, Trash2, PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { VehicleDialog } from "../../../../components/customer/VehicleDialog";

const API_BASE = "http://localhost:5001/api/CustomerVehicle";

interface Vehicle {
  vehicleId: number;
  registrationNumber: string;
  chassisNumber: string;
  brand: string;
  model: string;
  year: number;
  fuelType: string;
}

export default function VehicleManagementPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch vehicles
  const fetchVehicles = async () => {
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/my-vehicles`, { credentials: "include" });

      if (res.status === 401) {
        setError("User not logged in. Please login to view vehicles.");
        return;
      }

      if (!res.ok) throw new Error("Failed to fetch vehicles.");

      const data = await res.json();
      setVehicles(data || []);
    } catch (err) {
      console.error("Error fetching vehicles:", err);
      setError("An unexpected error occurred while fetching vehicles.");
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  // Add or update vehicle
  const handleSaveVehicle = async (vehicleData: any) => {
    try {
      const isEdit = !!selectedVehicle;
      const url = isEdit
        ? `${API_BASE}/${selectedVehicle?.vehicleId}`
        : `${API_BASE}`;
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(vehicleData),
      });

      if (res.status === 401) {
        toast.error("You must be logged in to manage vehicles.");
        return;
      }

      if (res.ok) {
        toast.success(isEdit ? "Vehicle updated successfully!" : "Vehicle added successfully!");
        setIsDialogOpen(false);
        setSelectedVehicle(null);
        fetchVehicles();
      } else {
        const text = await res.text();
        const err = text ? JSON.parse(text) : { message: "Unknown error" };
        toast.error(err.message || "Failed to save vehicle.");
      }
    } catch (err) {
      console.error("Save vehicle error:", err);
      toast.error("Failed to save vehicle. Please try again later.");
    }
  };

  // Delete vehicle
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this vehicle?")) return;

    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.status === 401) {
        toast.error("Unauthorized access.");
        return;
      }

      if (res.ok) {
        toast.success("Vehicle deleted successfully!");
        fetchVehicles();
      } else {
        const text = await res.text();
        const err = text ? JSON.parse(text) : { message: "Unknown error" };
        toast.error(err.message || "Failed to delete vehicle.");
      }
    } catch (err) {
      console.error("Delete vehicle error:", err);
      toast.error("Failed to delete vehicle.");
    }
  };

  const handleOpenDialog = (vehicle?: Vehicle) => {
    setSelectedVehicle(vehicle || null);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-8 mx-5 my-5">
      {error && (
        <div className="p-4 bg-red-100 text-red-800 rounded-md">{error}</div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">My Vehicles</h2>
          <p className="text-muted-foreground mt-1">
            Manage your registered vehicles here
          </p>
        </div>
        <Button
          onClick={() => handleOpenDialog()}
          className="ml-4 bg-orange-400 text-white hover:bg-orange-300"
          size="sm"
        >
        + Add Vehicle
        </Button>
      </div>

      {/* Vehicle Dialog */}
      <VehicleDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleSaveVehicle}
        initialData={selectedVehicle || undefined}
      />

      {/* Vehicle List */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehicles.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="p-6 text-center text-muted-foreground">
              No vehicles found. Add your first vehicle to get started.
            </CardContent>
          </Card>
        ) : (
          vehicles.map((vehicle) => (
            <Card
              key={vehicle.vehicleId}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-lg bg-orange-50 flex items-center justify-center">
                    <Car className="h-5 w-5 text-orange-600" />
                  </div>
                  <CardTitle className="text-base font-medium">
                    {vehicle.brand} {vehicle.model}
                  </CardTitle>
                </div>
                <Badge variant="secondary" className="bg-gray-100">
                  {vehicle.year}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-gray-800">
                    Reg. No:
                  </span>{" "}
                  {vehicle.registrationNumber}
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-gray-800">
                    Chassis:
                  </span>{" "}
                  {vehicle.chassisNumber}
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-gray-800">
                    Fuel:
                  </span>{" "}
                  {vehicle.fuelType}
                </p>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenDialog(vehicle)}
                  >
                    <Edit2 className="h-4 w-4 mr-1" /> Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(vehicle.vehicleId)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
