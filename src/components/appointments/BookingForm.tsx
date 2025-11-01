"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { appointmentAPI } from "@/services/appointmentAPI";
import {
  Service,
  Vehicle,
  TimeSlot,
  CreateAppointmentDto,
} from "@/types/appointments";
import { handleApiError } from "@/lib/apiUtils";

interface BookingFormProps {
  isOpen: boolean;
  onCloseAction: () => void;
  onSuccessAction: () => void;
}

const timeSlots = [
  { value: "08:00-10:00", label: "8:00 AM - 10:00 AM" },
  { value: "10:00-12:00", label: "10:00 AM - 12:00 PM" },
  { value: "13:00-15:00", label: "1:00 PM - 3:00 PM" },
  { value: "15:00-17:00", label: "3:00 PM - 5:00 PM" },
];

export const BookingForm: React.FC<BookingFormProps> = ({
  isOpen,
  onCloseAction,
  onSuccessAction,
}) => {
  const [services, setServices] = useState<Service[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [availability, setAvailability] = useState<TimeSlot[]>([]);
  const [selectedServices, setSelectedServices] = useState<number[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      loadInitialData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedDate) {
      loadAvailability();
    }
  }, [selectedDate]);

  const loadInitialData = async () => {
    try {
      const [servicesData, vehiclesData] = await Promise.all([
        appointmentAPI.getServices(),
        appointmentAPI.getVehicles(),
      ]);
      console.log("Services loaded:", servicesData);
      console.log("Vehicles loaded:", vehiclesData);
      console.log("Vehicle count:", vehiclesData.length);
      if (vehiclesData.length > 0) {
        console.log("First vehicle keys:", Object.keys(vehiclesData[0]));
        console.log("First vehicle:", vehiclesData[0]);
      }
      setServices(servicesData);
      setVehicles(vehiclesData);
    } catch (err) {
      console.error("Error loading initial data:", err);
      setError(handleApiError(err));
    }
  };

  const loadAvailability = async () => {
    try {
      const availabilityData = await appointmentAPI.getAvailability(
        selectedDate
      );
      setAvailability(availabilityData);
    } catch (err) {
      setError(handleApiError(err));
    }
  };

  const handleServiceToggle = (serviceId: number) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !selectedDate ||
      !selectedTimeSlot ||
      !selectedVehicle ||
      selectedServices.length === 0
    ) {
      setError("Please fill in all fields and select at least one service");
      return;
    }

    if (vehicles.length === 0) {
      setError("Please add a vehicle first before booking an appointment");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Map selected time slot to backend slot index (0-based)
      const slotIndex = timeSlots.findIndex(
        (slot) => slot.value === selectedTimeSlot
      );
      if (slotIndex === -1) {
        setError("Invalid time slot selected");
        return;
      }

      // Find the selected vehicle's ID
      const selectedVehicleObj = vehicles.find((v) => {
        const plate = v.registrationNumber || v.licensePlate || "N/A";
        return plate === selectedVehicle;
      });

      if (!selectedVehicleObj) {
        setError("Selected vehicle not found. Please refresh and try again.");
        return;
      }

      // Try to get the vehicle ID from various possible field names
      const vehicleId =
        selectedVehicleObj.vehicleId ||
        selectedVehicleObj.id ||
        selectedVehicleObj.VehicleId ||
        selectedVehicleObj.ID ||
        selectedVehicleObj.vehicleID ||
        selectedVehicleObj.Id ||
        selectedVehicleObj.customerVehicleId;

      if (!vehicleId) {
        console.error("Vehicle ID not found for vehicle:", selectedVehicleObj);
        console.error(
          "All vehicle properties:",
          Object.keys(selectedVehicleObj)
        );
        console.error("All vehicle values:", Object.values(selectedVehicleObj));
        setError(
          `Vehicle ID not found. Available properties: ${Object.keys(
            selectedVehicleObj
          ).join(", ")}`
        );
        return;
      }

      // Ensure vehicleId is a number if it's a string number
      const finalVehicleId =
        typeof vehicleId === "string" ? parseInt(vehicleId, 10) : vehicleId;

      if (isNaN(finalVehicleId)) {
        setError(`Invalid vehicle ID format: ${vehicleId}`);
        return;
      }

      const dto: CreateAppointmentDto = {
        appointmentDateTime: selectedDate, // date only; backend computes time from slotsTime
        slotsTime: slotIndex,
        serviceIds: selectedServices,
        vehicleId: finalVehicleId,
      };

      console.log("Submitting appointment:", dto);
      console.log("Selected vehicle ID:", finalVehicleId);
      console.log("Selected vehicle object:", selectedVehicleObj);
      console.log("Available vehicles:", vehicles);

      await appointmentAPI.createAppointment(dto);
      onSuccessAction();
      onCloseAction();
      resetForm();
    } catch (err) {
      console.error("Appointment creation error:", err);
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedServices([]);
    setSelectedDate("");
    setSelectedTimeSlot("");
    setSelectedVehicle("");
    setError("");
  };

  const getTotalPrice = () => {
    return selectedServices.reduce((total, serviceId) => {
      const service = services.find((s) => s.serviceId === serviceId);
      return total + (service?.basePrice || 0);
    }, 0);
  };

  const getAvailableSlots = () => {
    return timeSlots.filter((slot) => {
      const availabilitySlot = availability.find((a) => a.slot === slot.value);
      return availabilitySlot?.available && availabilitySlot.count > 0;
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onCloseAction}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Book New Appointment</DialogTitle>
          <DialogDescription>
            Select services, date, time slot, and vehicle for your appointment.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Services Selection */}
          <div>
            <Label className="text-base font-medium">Select Services</Label>
            <div className="mt-2 space-y-2 max-h-40 overflow-y-auto border rounded-md p-3">
              {services.map((service) => (
                <div
                  key={service.serviceId}
                  className="flex items-center space-x-2"
                >
                  <Checkbox
                    id={`service-${service.serviceId}`}
                    checked={selectedServices.includes(service.serviceId)}
                    onCheckedChange={() =>
                      handleServiceToggle(service.serviceId)
                    }
                  />
                  <label
                    htmlFor={`service-${service.serviceId}`}
                    className="flex-1 text-sm cursor-pointer"
                  >
                    <div className="flex justify-between">
                      <span>{service.serviceName}</span>
                      <span className="font-medium">${service.basePrice}</span>
                    </div>
                    <div className="text-gray-500 text-xs">
                      {service.description}
                    </div>
                  </label>
                </div>
              ))}
            </div>
            {selectedServices.length > 0 && (
              <div className="mt-2 text-sm font-medium">
                Total: ${getTotalPrice().toFixed(2)}
              </div>
            )}
          </div>

          {/* Date Selection */}
          <div>
            <Label htmlFor="date">Select Date</Label>
            <Input
              id="date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              required
            />
          </div>

          {/* Time Slot Selection */}
          <div>
            <Label>Select Time Slot</Label>
            <Select
              value={selectedTimeSlot}
              onValueChange={setSelectedTimeSlot}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a time slot" />
              </SelectTrigger>
              <SelectContent>
                {getAvailableSlots().map((slot) => (
                  <SelectItem key={slot.value} value={slot.value}>
                    {slot.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Vehicle Selection */}
          <div>
            <Label>Select Vehicle</Label>
            {vehicles.length === 0 ? (
              <div className="text-sm text-gray-500 p-3 border rounded-md">
                No vehicles found. Please add a vehicle first in your dashboard.
              </div>
            ) : (
              <Select
                value={selectedVehicle}
                onValueChange={setSelectedVehicle}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose your vehicle" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map((vehicle, index) => {
                    const plate =
                      vehicle.registrationNumber ||
                      vehicle.licensePlate ||
                      "N/A";
                    // Try to find any ID-like field
                    const possibleId =
                      vehicle.vehicleId ||
                      vehicle.id ||
                      vehicle.VehicleId ||
                      vehicle.ID ||
                      vehicle.vehicleID ||
                      vehicle.Id ||
                      vehicle.customerVehicleId;

                    console.log(
                      "Vehicle mapping - Plate:",
                      plate,
                      "ID:",
                      possibleId,
                      "Full object:",
                      vehicle
                    );

                    // Use the plate as value but store the ID for reference
                    return (
                      <SelectItem key={index} value={plate}>
                        {vehicle.make || vehicle.brand || "Unknown"}{" "}
                        {vehicle.model} ({plate})
                        {possibleId && (
                          <span className="text-xs text-gray-500">
                            {" "}
                            - ID: {possibleId}
                          </span>
                        )}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCloseAction}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                loading ||
                vehicles.length === 0 ||
                selectedServices.length === 0
              }
              className="flex-1 bg-[#1e3a5f] hover:bg-[#1e3a5f]/90"
            >
              {loading ? "Booking..." : "Book Appointment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
