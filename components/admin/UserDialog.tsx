// "use client";

// import React, { useState, useEffect } from 'react';
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
// } from '../../src/components/ui/dialog';
// import { Button } from '../../src/components/ui/button';
// import { Label } from '../../src/components/ui/label';
// import { Input } from '../../src/components/ui/input';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../src/components/ui/select';

// interface UserDialogProps {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   onSubmit: (data: any) => void;
//   initialData?: any;
// }

// export function UserDialog({
//   open,
//   onOpenChange,
//   onSubmit,
//   initialData,
// }: UserDialogProps) {
//   const [firstName, setFirstName] = useState('');
//   const [lastName, setLastName] = useState('');
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [phoneNumber, setPhoneNumber] = useState('');
//   const [address, setAddress] = useState('');
//   const [status, setStatus] = useState('active');

//   useEffect(() => {
//     if (initialData) {
//       // Edit mode: prefill editable fields
//       setFirstName(initialData.firstName || '');
//       setLastName(initialData.lastName || '');
//       setPhoneNumber(initialData.phoneNumber || '');
//       setAddress(initialData.address || '');
//       setStatus(initialData.status || 'active');
//     } else {
//       // Create mode: blank fields
//       setFirstName('');
//       setLastName('');
//       setEmail('');
//       setPassword('');
//       setPhoneNumber('');
//       setAddress('');
//       setStatus('active');
//     }
//   }, [initialData, open]);

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!firstName || !lastName) return;

//     if (initialData) {
//       // Edit mode: submit only editable fields
//       onSubmit({
//         firstName,
//         lastName,
//         phoneNumber,
//         address,
//         status,
//       });
//     } else {
//       // Create mode: submit full data
//       if (!email || !password) return;
//       onSubmit({
//         firstName,
//         lastName,
//         email,
//         password,
//         phoneNumber,
//         address,
//         role: 'employee', // always employee
//       });
//     }
//   };

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="sm:max-w-[500px]">
//         <DialogHeader>
//           <DialogTitle>{initialData ? 'Edit User' : 'Add New User'}</DialogTitle>
//           <DialogDescription>
//             {initialData ? 'Update user details' : 'Create a new employee account'}
//           </DialogDescription>
//         </DialogHeader>

//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div className="space-y-2">
//             <Label htmlFor="firstName">First Name</Label>
//             <Input
//               id="firstName"
//               placeholder="John"
//               value={firstName}
//               onChange={(e) => setFirstName(e.target.value)}
//             />
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="lastName">Last Name</Label>
//             <Input
//               id="lastName"
//               placeholder="Doe"
//               value={lastName}
//               onChange={(e) => setLastName(e.target.value)}
//             />
//           </div>

//           {initialData ? (
//             <>
//               <div className="space-y-2">
//                 <Label htmlFor="phoneNumber">Phone Number</Label>
//                 <Input
//                   id="phoneNumber"
//                   placeholder="1234567890"
//                   value={phoneNumber}
//                   onChange={(e) => setPhoneNumber(e.target.value)}
//                 />
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="address">Address</Label>
//                 <Input
//                   id="address"
//                   placeholder="123 Main Street"
//                   value={address}
//                   onChange={(e) => setAddress(e.target.value)}
//                 />
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="status">Status</Label>
//                 <Select value={status} onValueChange={setStatus}>
//                   <SelectTrigger id="status">
//                     <SelectValue />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="active">Active</SelectItem>
//                     <SelectItem value="inactive">Inactive</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>
//             </>
//           ) : (
//             <>
//               {/* Create mode fields */}
//               <div className="space-y-2">
//                 <Label htmlFor="email">Email</Label>
//                 <Input
//                   id="email"
//                   type="email"
//                   placeholder="john@example.com"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                 />
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="password">Password</Label>
//                 <Input
//                   id="password"
//                   type="password"
//                   placeholder="********"
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                 />
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="phoneNumber">Phone Number</Label>
//                 <Input
//                   id="phoneNumber"
//                   placeholder="1234567890"
//                   value={phoneNumber}
//                   onChange={(e) => setPhoneNumber(e.target.value)}
//                 />
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="address">Address</Label>
//                 <Input
//                   id="address"
//                   placeholder="123 Main Street"
//                   value={address}
//                   onChange={(e) => setAddress(e.target.value)}
//                 />
//               </div>
//             </>
//           )}

//           <div className="flex justify-end gap-2 pt-4">
//             <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
//               Cancel
//             </Button>
//             <Button type="submit" className='bg-orange-400 text-white hover:bg-orange-300'>{initialData ? 'Update User' : 'Create User'}</Button>
//           </div>
//         </form>
//       </DialogContent>
//     </Dialog>
//   );
// }

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../src/components/ui/select';

interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  initialData?: any;
}

/* ---------- Helper: validate a single run ---------- */
const validate = (
  data: {
    firstName: string;
    lastName: string;
    email?: string;
    password?: string;
    phoneNumber: string;
    address: string;
  },
  isEdit: boolean
) => {
  const e: Record<string, string> = {};

  if (!data.firstName.trim()) e.firstName = 'First name is required';
  if (!data.lastName.trim()) e.lastName = 'Last name is required';
  if (!data.phoneNumber.trim()) e.phoneNumber = 'Phone number is required';
  else if (!/^\d{10}$/.test(data.phoneNumber))
    e.phoneNumber = 'Phone number must be exactly 10 digits';
  if (!data.address.trim()) e.address = 'Address is required';

  if (!isEdit) {
    if (!data.email?.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email!))
      e.email = 'Invalid email address';

    if (!data.password) e.password = 'Password is required';
    else if (data.password.length < 6)
      e.password = 'Password must be at least 6 characters';
  }

  return e;
};

export function UserDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
}: UserDialogProps) {
  const isEdit = !!initialData;

  // Form fields 
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  // Errors (only after submit) 
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState(false); // true after first submit attempt

  // Reset / pre-fill when dialog opens 
  useEffect(() => {
    if (initialData) {
      setFirstName(initialData.firstName ?? '');
      setLastName(initialData.lastName ?? '');
      setPhoneNumber(initialData.phoneNumber ?? '');
      setAddress(initialData.address ?? '');
      setStatus(initialData.status ?? 'active');
    } else {
      setFirstName('');
      setLastName('');
      setEmail('');
      setPassword('');
      setPhoneNumber('');
      setAddress('');
      setStatus('active');
    }
    // reset validation state
    setErrors({});
    setTouched(false);
  }, [initialData, open]);

  // Submit 
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload = isEdit
      ? { firstName, lastName, phoneNumber, address }
      : { firstName, lastName, email, password, phoneNumber, address };

    const validationErrors = validate(payload as any, isEdit);
    setErrors(validationErrors);
    setTouched(true);

    if (Object.keys(validationErrors).length > 0) return; // stop if invalid

    // Success 
    if (isEdit) {
      onSubmit({ firstName, lastName, phoneNumber, address, status });
    } else {
      onSubmit({
        firstName,
        lastName,
        email,
        password,
        phoneNumber,
        address,
        role: 'employee',
      });
    }
  };

  //  Phone input (maximum 10 digits)
  const handlePhoneChange = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 10);
    setPhoneNumber(digits);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit User' : 'Add New User'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update user details' : 'Create a new employee account'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* First Name */}
          <div className="space-y-1">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              placeholder="John"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className={touched && errors.firstName ? 'border-red-500' : ''}
            />
            {touched && errors.firstName && (
              <p className="text-sm text-red-600">{errors.firstName}</p>
            )}
          </div>

          {/* Last Name */}
          <div className="space-y-1">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              placeholder="Doe"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className={touched && errors.lastName ? 'border-red-500' : ''}
            />
            {touched && errors.lastName && (
              <p className="text-sm text-red-600">{errors.lastName}</p>
            )}
          </div>

          {/* EDIT MODE FIELDS */}
          {isEdit ? (
            <>
              {/* Phone */}
              <div className="space-y-1">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  placeholder="1234567890"
                  value={phoneNumber}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  className={touched && errors.phoneNumber ? 'border-red-500' : ''}
                />
                {touched && errors.phoneNumber && (
                  <p className="text-sm text-red-600">{errors.phoneNumber}</p>
                )}
              </div>

              {/* Address */}
              <div className="space-y-1">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  placeholder="123 Main Street"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className={touched && errors.address ? 'border-red-500' : ''}
                />
                {touched && errors.address && (
                  <p className="text-sm text-red-600">{errors.address}</p>
                )}
              </div>

              {/* Status */}
              <div className="space-y-1">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={status}
                  onValueChange={(v) => setStatus(v as 'active' | 'inactive')}
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          ) : (
            <>
              {/* CREATE MODE FIELDS */}
              {/* Email */}
              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={touched && errors.email ? 'border-red-500' : ''}
                />
                {touched && errors.email && (
                  <p className="text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={touched && errors.password ? 'border-red-500' : ''}
                />
                {touched && errors.password && (
                  <p className="text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  placeholder="1234567890"
                  value={phoneNumber}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  className={touched && errors.phoneNumber ? 'border-red-500' : ''}
                />
                {touched && errors.phoneNumber && (
                  <p className="text-sm text-red-600">{errors.phoneNumber}</p>
                )}
              </div>

              {/* Address */}
              <div className="space-y-1">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  placeholder="123 Main Street"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className={touched && errors.address ? 'border-red-500' : ''}
                />
                {touched && errors.address && (
                  <p className="text-sm text-red-600">{errors.address}</p>
                )}
              </div>
            </>
          )}

          {/*  Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-orange-400 text-white hover:bg-orange-300"
            >
              {isEdit ? 'Update User' : 'Create User'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}