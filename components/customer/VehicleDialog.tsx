"use client";

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../src/components/ui/dialog';
import { Button } from '../../src/components/ui/button';
import { Label } from '../../src/components/ui/label';
import { Input } from '../../src/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../src/components/ui/select';

export enum FuelType {
  Petrol = "Petrol",
  Diesel = "Diesel",
  Electric = "Electric",
  Hybrid = "Hybrid"
}

interface VehicleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  initialData?: any; // for edit mode
}

export function VehicleDialog({ open, onOpenChange, onSubmit, initialData }: VehicleDialogProps) {
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [fuelType, setFuelType] = useState<FuelType>(FuelType.Petrol);
  const [chassisNumber, setChassisNumber] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState<number | ''>('');

  useEffect(() => {
    if (initialData) {
      setRegistrationNumber(initialData.registrationNumber || '');
      setFuelType(initialData.fuelType || FuelType.Petrol);
      setChassisNumber(initialData.chassisNumber || '');
      setBrand(initialData.brand || '');
      setModel(initialData.model || '');
      setYear(initialData.year || '');
    } else {
      setRegistrationNumber('');
      setFuelType(FuelType.Petrol);
      setChassisNumber('');
      setBrand('');
      setModel('');
      setYear('');
    }
  }, [initialData, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!registrationNumber || !chassisNumber || !brand || !model || !year) return;

    onSubmit({
      registrationNumber,
      fuelType,
      chassisNumber,
      brand,
      model,
      year,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Vehicle' : 'Add New Vehicle'}</DialogTitle>
          <DialogDescription>
            {initialData ? 'Update vehicle details' : 'Add a new vehicle to your account'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="registrationNumber">Registration Number</Label>
            <Input
              id="registrationNumber"
              placeholder="ABC-1234"
              value={registrationNumber}
              onChange={(e) => setRegistrationNumber(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fuelType">Fuel Type</Label>
            <Select value={fuelType} onValueChange={(val) => setFuelType(val as FuelType)}>
              <SelectTrigger id="fuelType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(FuelType).map((fuel) => (
                  <SelectItem key={fuel} value={fuel}>
                    {fuel}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="chassisNumber">Chassis Number</Label>
            <Input
              id="chassisNumber"
              placeholder="CHS123456789"
              value={chassisNumber}
              onChange={(e) => setChassisNumber(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="brand">Brand</Label>
            <Input
              id="brand"
              placeholder="Toyota"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="model">Model</Label>
            <Input
              id="model"
              placeholder="Corolla"
              value={model}
              onChange={(e) => setModel(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="year">Year</Label>
            <Input
              id="year"
              type="number"
              placeholder="2023"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-orange-400 text-white hover:bg-orange-300">
              {initialData ? 'Update Vehicle' : 'Add Vehicle'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
