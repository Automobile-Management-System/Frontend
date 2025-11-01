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

// Map UI labels to backend slot indices (0,1,3,4)
const timeSlots = [
  { index: 0, value: "08:00-10:00", label: "8:00 AM - 10:00 AM" },
  { index: 1, value: "10:00-12:00", label: "10:00 AM - 12:00 PM" },
  { index: 3, value: "13:00-15:00", label: "1:00 PM - 3:00 PM" },
  { index: 4, value: "15:00-17:00", label: "3:00 PM - 5:00 PM" },
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
  const [selectedVehicle, setSelectedVehicle] = useState(""); // stores vehicle ID as string
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
      // Map selected time slot to backend slot index (can be 0,1,3,4)
      const slotDef = timeSlots.find(
        (slot) => `${slot.index}` === selectedTimeSlot
      );
      const slotIndex = slotDef?.index;
      if (slotIndex === undefined) {
        setError("Invalid time slot selected");
        return;
      }

      // Selected value is the vehicle ID
      const finalVehicleId = parseInt(selectedVehicle, 10);
      if (isNaN(finalVehicleId)) {
        setError("Please select a valid vehicle.");
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
      const availabilitySlot = availability.find((a) => a.slot === slot.index);
      return (
        Boolean(availabilitySlot?.available) &&
        (availabilitySlot?.count || 0) > 0
      );
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
              {services.length === 0 ? (
                <div className="text-sm text-gray-500">
                  No services available at the moment.
                </div>
              ) : (
                services.map((service) => (
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
                        <span className="font-medium">
                          ${service.basePrice}
                        </span>
                      </div>
                      <div className="text-gray-500 text-xs">
                        {service.description}
                      </div>
                    </label>
                  </div>
                ))
              )}
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
            {(() => {
              const availableSlots = getAvailableSlots();
              return (
                <Select
                  value={selectedTimeSlot}
                  onValueChange={setSelectedTimeSlot}
                  disabled={availableSlots.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        availableSlots.length === 0
                          ? "No available time slots"
                          : "Choose a time slot"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSlots.length === 0 ? (
                      <SelectItem disabled value="no-slots">
                        No available time slots
                      </SelectItem>
                    ) : (
                      availableSlots.map((slot) => (
                        <SelectItem key={slot.index} value={`${slot.index}`}>
                          {slot.label}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              );
            })()}
          </div>

          {/* Vehicle Selection (by ID) */}
          <div>
            <Label>Select Vehicle</Label>
            {(() => {
              if (vehicles.length === 0) {
                return (
                  <div className="text-sm text-gray-500 p-3 border rounded-md">
                    No vehicles found. Please add a vehicle first in your
                    dashboard.
                  </div>
                );
              }
              const vehiclesWithId = vehicles.filter(
                (v) =>
                  v.vehicleId ||
                  v.id ||
                  v.VehicleId ||
                  v.ID ||
                  v.vehicleID ||
                  v.Id ||
                  v.customerVehicleId
              );
              if (vehiclesWithId.length === 0) {
                return (
                  <div className="text-sm text-yellow-700 p-3 border rounded-md bg-yellow-50 border-yellow-200">
                    We found your vehicles but couldn’t resolve their IDs for
                    booking. Please refresh or contact support.
                  </div>
                );
              }
              return (
                <Select
                  value={selectedVehicle}
                  onValueChange={setSelectedVehicle}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose your vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehiclesWithId.map((vehicle, index) => {
                      const plate =
                        vehicle.registrationNumber ||
                        vehicle.licensePlate ||
                        "N/A";
                      const possibleId =
                        vehicle.vehicleId ||
                        vehicle.id ||
                        vehicle.VehicleId ||
                        vehicle.ID ||
                        vehicle.vehicleID ||
                        vehicle.Id ||
                        vehicle.customerVehicleId;
                      const stableKey = String(possibleId ?? plate ?? index);
                      return (
                        <SelectItem key={stableKey} value={`${possibleId}`}>
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
              );
            })()}
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
