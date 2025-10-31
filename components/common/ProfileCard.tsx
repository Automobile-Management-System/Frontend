'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useAuth } from '@/app/context/AuthContext';
import { User, Edit3, Save, X, Mail, Phone, MapPin, Calendar, Shield, Briefcase, Car, Image, AlertCircle, Lock } from 'lucide-react';

interface ProfileField {
  id: string;
  label: string;
  value: string;
  type: 'text' | 'email' | 'tel' | 'date' | 'readonly' | 'file' | 'password';
  icon?: React.ReactNode;
  editable?: boolean;
  accept?: string; // For file inputs
  locked?: boolean; // For fields that should be locked (like Google email)
  lockReason?: string; // Reason why field is locked
}

interface ProfileCardProps {
  title: string;
  description: string;
  fields: ProfileField[];
  onSave: (updatedFields: Record<string, string>) => Promise<void>;
  additionalInfo?: React.ReactNode;
  isGoogleUser?: boolean; // Flag to indicate if user logged in with Google
}

export default function ProfileCard({ title, description, fields, onSave, additionalInfo, isGoogleUser = false }: ProfileCardProps) {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedFields, setEditedFields] = useState<Record<string, string>>({});
  const [selectedFiles, setSelectedFiles] = useState<Record<string, File>>({});
  const [selectedProfileImage, setSelectedProfileImage] = useState<File | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Validation functions
  const validateEmail = (email: string): string | null => {
    if (!email) return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) ? null : 'Please enter a valid email address';
  };

  const validatePhoneNumber = (phone: string): string | null => {
    if (!phone) return null;
    // Remove all non-digit characters
    const digitsOnly = phone.replace(/\D/g, '');
    return digitsOnly.length === 10 ? null : 'Phone number must be exactly 10 digits';
  };

  const validatePassword = (password: string): string | null => {
    if (!password) return null; // Password is optional during edit
    if (password.length < 6) {
      return 'Password must be at least 6 characters long';
    }
    return null;
  };

  const validateField = (fieldId: string, value: string, fieldType: string): string | null => {
    if (fieldType === 'email') {
      return validateEmail(value);
    }
    if (fieldType === 'tel' || fieldId === 'phoneNumber') {
      return validatePhoneNumber(value);
    }
    if (fieldType === 'password') {
      return validatePassword(value);
    }
    return null;
  };

  const validateAllFields = (): boolean => {
    const errors: Record<string, string> = {};
    let hasErrors = false;

    fields.forEach(field => {
      // Skip validation for fields that are explicitly not editable or locked
      if (field.editable === false || isFieldLocked(field)) return;

      // Use edited value if present, otherwise use the current stored value
      const valueToValidate = editedFields[field.id] ?? field.value ?? '';
      const error = validateField(field.id, valueToValidate, field.type);
      if (error) {
        errors[field.id] = error;
        hasErrors = true;
      }
    });

    setValidationErrors(errors);
    return !hasErrors;
  };

  // Helper function to check if a field should be locked
  const isFieldLocked = (field: ProfileField): boolean => {
    // If field is explicitly marked as locked
    if (field.locked) return true;
    
    // Lock email field for Google users
    if (isGoogleUser && field.id === 'email') return true;
    
    // Lock password field only for Google users (they can't change password)
    // Non-Google users should be able to edit their password
    if (isGoogleUser && (field.id === 'password' || field.type === 'password')) return true;
    
    return false;
  };

  // Helper function to get lock reason
  const getLockReason = (field: ProfileField): string => {
    if (field.lockReason) return field.lockReason;
    
    if (isGoogleUser && field.id === 'email') {
      return 'Email cannot be changed for Google accounts';
    }
    
    if (isGoogleUser && (field.id === 'password' || field.type === 'password')) {
      return 'Password is managed by Google authentication';
    }
    
    return 'This field cannot be edited';
  };

  const handleEdit = () => {
    setIsEditing(true);
    // Initialize edited fields with current values
    const initialValues: Record<string, string> = {};
    fields.forEach(field => {
      if (field.editable !== false) {
        // For password fields, start with empty value instead of masked value
        if (field.type === 'password') {
          initialValues[field.id] = '';
        } else {
          initialValues[field.id] = field.value;
        }
      }
    });
    setEditedFields(initialValues);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedFields({});
    setSelectedFiles({});
    setSelectedProfileImage(null);
    setValidationErrors({});
  };

  const handleSave = async () => {
    // Validate all fields before saving
    if (!validateAllFields()) {
      return; // Don't save if validation fails
    }
    
    setIsLoading(true);
    try {
      // Build payload including any edited values + files, but skip locked fields
      const payload: Record<string, string> = {};

      console.log('DEBUG: Current editedFields:', editedFields);

      // Start with all fields and take edited value if present, otherwise the current value
      fields.forEach(field => {
        if (isFieldLocked(field)) return; // do not send locked fields
        
        // Special handling for password fields - only include if user actually entered a new password
        if (field.type === 'password') {
          const passwordValue = editedFields[field.id];
          console.log(`DEBUG: Password field ${field.id}, value:`, passwordValue);
          if (passwordValue && passwordValue.trim() !== '') {
            payload[field.id] = passwordValue;
            console.log(`DEBUG: Added password to payload for field ${field.id}`);
          }
        } else {
          const val = editedFields[field.id] ?? field.value;
          if (val !== undefined) payload[field.id] = val;
        }
      });

      console.log('DEBUG: Final payload being sent:', payload);

      // Handle profile image upload (override payload.profilePicture)
      if (selectedProfileImage) {
        const base64 = await convertFileToBase64(selectedProfileImage);
        payload.profilePicture = base64;
      }

      // Handle other file inputs
      for (const [fieldId, file] of Object.entries(selectedFiles)) {
        if (file) {
          const base64 = await convertFileToBase64(file);
          payload[fieldId] = base64;
        }
      }

      await onSave(payload);
      setIsEditing(false);
      setEditedFields({});
      setSelectedFiles({});
      setSelectedProfileImage(null);
      setValidationErrors({});
    } catch (error) {
      console.error('Failed to save profile:', error);
      // You might want to show an error toast here
    } finally {
      setIsLoading(false);
    }
  };

  const handleFieldChange = (fieldId: string, value: string) => {
    setEditedFields(prev => ({
      ...prev,
      [fieldId]: value
    }));
    
    // Validate the field and update validation errors
    const field = fields.find(f => f.id === fieldId);
    if (field) {
      const error = validateField(fieldId, value, field.type);
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        if (error) {
          newErrors[fieldId] = error;
        } else {
          delete newErrors[fieldId];
        }
        return newErrors;
      });
    }
  };

  const handleFileChange = (fieldId: string, file: File | null) => {
    if (file) {
      setSelectedFiles(prev => ({
        ...prev,
        [fieldId]: file
      }));
    } else {
      setSelectedFiles(prev => {
        const newFiles = { ...prev };
        delete newFiles[fieldId];
        return newFiles;
      });
    }
  };

  const handleProfileImageClick = (event?: React.MouseEvent) => {
    console.log('Profile image clicked, isEditing:', isEditing);
    event?.stopPropagation();
    if (isEditing) {
      const fileInput = document.getElementById('profile-image-input') as HTMLInputElement;
      console.log('File input found:', fileInput);
      fileInput?.click();
    }
  };

  const handleProfileImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('File input changed');
    const file = event.target.files?.[0];
    console.log('Selected file:', file);
    if (file) {
      setSelectedProfileImage(file);
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const getFieldValue = (field: ProfileField) => {
    // For password fields, only use edited value when editing (don't show the masked value)
    if (field.type === 'password' && isEditing && field.editable !== false) {
      return editedFields[field.id] ?? '';
    }
    
    return isEditing && field.editable !== false 
      ? editedFields[field.id] ?? field.value 
      : field.value;
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Admin':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Employee':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Customer':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getProfilePicture = () => {
    // If user selected a new image, show preview
    if (selectedProfileImage) {
      return URL.createObjectURL(selectedProfileImage);
    }
    // Find profile picture field
    const profilePictureField = fields.find(field => field.id === 'profilePicture');
    return profilePictureField?.value || null;
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          <p className="text-gray-600 mt-1">{description}</p>
        </div>
        {!isEditing ? (
          <Button onClick={handleEdit} className="flex items-center gap-2">
            <Edit3 className="w-4 h-4" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button onClick={handleCancel} variant="outline" className="flex items-center gap-2">
              <X className="w-4 h-4" />
              Cancel
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button disabled={isLoading} className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Save Profile Changes</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to save these changes to your profile? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleSave}>Save Changes</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>

      {/* Profile Card */}
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
          <div className="flex items-center gap-4">
            <div 
              className={`relative ${isEditing ? 'cursor-pointer' : ''}`}
              onClick={(e) => handleProfileImageClick(e)}
            >
              <Avatar 
                className={`w-16 h-16 border-4 border-white shadow-md ${isEditing ? 'hover:opacity-80 transition-opacity' : ''}`}
              >
                {getProfilePicture() && (
                  <AvatarImage src={getProfilePicture()!} alt="Profile" />
                )}
                <AvatarFallback className="text-lg font-semibold bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                  {user ? getInitials(user.firstName, user.lastName) : 'U'}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <div 
                  className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 hover:opacity-100 transition-opacity pointer-events-none"
                >
                  <Image className="w-6 h-6 text-white" />
                </div>
              )}
            </div>
            <input
              id="profile-image-input"
              type="file"
              accept="image/*"
              onChange={handleProfileImageChange}
              className="hidden"
            />
            <div className="flex-1">
              <CardTitle className="text-2xl">{user ? `${user.firstName} ${user.lastName}` : 'User Profile'}</CardTitle>
              <div className="flex items-center gap-2 mt-2">
                {isEditing && selectedProfileImage && (
                  <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                    New image selected: {selectedProfileImage.name}
                  </div>
                )}
                <Badge className={getRoleColor(user?.role || 'User')}>
                  {user?.role === 'Admin' && <Shield className="w-3 h-3 mr-1" />}
                  {user?.role === 'Employee' && <Briefcase className="w-3 h-3 mr-1" />}
                  {user?.role === 'Customer' && <Car className="w-3 h-3 mr-1" />}
                  {user?.role || 'User'}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <Mail className="w-3 h-3 mr-1" />
                  {user?.email}
                </Badge>
              </div>
                <div className="text-xs text-gray-600 mt-2">
                  Click on your profile picture to change it
                </div>
           
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {fields.filter(field => field.id !== 'profilePicture').map((field) => (
              <div key={field.id} className="space-y-2">
                <Label htmlFor={field.id} className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  {field.icon}
                  {field.label}
                  {isFieldLocked(field) && (
                    <Lock className="w-3 h-3 text-gray-500" />
                  )}
                </Label>
                {isEditing && field.editable !== false && !isFieldLocked(field) ? (
                  field.type === 'file' ? (
                    <div className="space-y-2">
                      <Input
                        id={field.id}
                        type="file"
                        accept={field.accept || 'image/*'}
                        onChange={(e) => handleFileChange(field.id, e.target.files?.[0] || null)}
                        className="w-full"
                      />
                      {selectedFiles[field.id] && (
                        <div className="text-sm text-gray-600">
                          Selected: {selectedFiles[field.id].name}
                        </div>
                      )}
                      {field.value && !selectedFiles[field.id] && (
                        <div className="text-sm text-gray-500">
                          Current: {field.value.includes('data:') ? 'Image uploaded' : field.value}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <Input
                        id={field.id}
                        type={field.type === 'readonly' ? 'text' : field.type}
                        value={getFieldValue(field)}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        className={`w-full ${
                          validationErrors[field.id] 
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                            : ''
                        }`}
                        disabled={field.type === 'readonly'}
                      />
                      {validationErrors[field.id] && (
                        <div className="text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {validationErrors[field.id]}
                        </div>
                      )}
                    </div>
                  )
                ) : isEditing && isFieldLocked(field) ? (
                  // Show locked fields in edit mode with special styling
                  <div className="p-3 bg-red-50 rounded-md border border-red-200 min-h-[40px] flex items-center">
                    <div className="flex items-center gap-2 text-gray-600 w-full">
                      <Lock className="w-4 h-4 text-red-500" />
                      <div className="flex-1">
                        <span className="text-gray-900">
                          {field.type === 'password' ? '••••••••' : field.value || 'Not specified'}
                        </span>
                        <div className="text-xs text-red-600 mt-1">
                          {getLockReason(field)}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-gray-50 rounded-md border min-h-[40px] flex items-center">
                    {isFieldLocked(field) ? (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Lock className="w-4 h-4" />
                        <div className="flex-1">
                          <span className="text-gray-900">
                            {field.type === 'password' ? '••••••••' : (field.value || 'Not specified')}
                          </span>
                          <div className="text-xs text-gray-500 mt-1">
                            {getLockReason(field)}
                          </div>
                        </div>
                      </div>
                    ) : field.type === 'file' && field.value ? (
                      field.value.includes('data:') ? (
                        <div className="flex items-center gap-2">
                          <img 
                            src={field.value} 
                            alt="Profile" 
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <span className="text-gray-900">Profile image uploaded</span>
                        </div>
                      ) : (
                        <span className="text-gray-900">{field.value}</span>
                      )
                    ) : (
                      <span className="text-gray-900">
                        {field.value || 'Not specified'}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Additional Information Section */}
          {additionalInfo && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              {additionalInfo}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}