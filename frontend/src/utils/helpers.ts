import type { RSVPStatus, GuestSide } from '../types';

// Guest Relation type (not exported from types)
type GuestRelation = 'family' | 'friend' | 'colleague' | 'neighbor' | 'other';

// RSVP Status helpers
export const getRSVPStatusColor = (status: RSVPStatus): string => {
  const colors: Record<RSVPStatus, string> = {
    confirmed: 'success',
    pending: 'warning',
    declined: 'error',
    maybe: 'processing',
  };
  return colors[status] || 'default';
};

export const getRSVPStatusLabel = (status: RSVPStatus): string => {
  const labels: Record<RSVPStatus, string> = {
    confirmed: 'Confirmed',
    pending: 'Pending',
    declined: 'Declined',
    maybe: 'Maybe',
  };
  return labels[status] || status;
};

// Guest Side helpers
export const getGuestSideColor = (side: GuestSide): string => {
  const colors: Record<GuestSide, string> = {
    bride: '#E5CEC0',
    groom: '#B7A89A',
    both: '#9A9187',
  };
  return colors[side] || '#D6C7B8';
};

export const getGuestSideLabel = (side: GuestSide): string => {
  const labels: Record<GuestSide, string> = {
    bride: 'Bride',
    groom: 'Groom',
    both: 'Both',
  };
  return labels[side] || side;
};

// Guest Relation helpers
export const getGuestRelationLabel = (relation: GuestRelation): string => {
  const labels: Record<GuestRelation, string> = {
    family: 'Family',
    friend: 'Friend',
    colleague: 'Colleague',
    neighbor: 'Neighbor',
    other: 'Other',
  };
  return labels[relation] || relation;
};

// Date formatting
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Phone number formatting
export const formatPhoneNumber = (phone: string): string => {
  if (!phone) return '';

  // Remove all non-numeric characters except +
  const cleaned = phone.replace(/[^\d+]/g, '');

  // If it starts with a country code
  if (cleaned.startsWith('+')) {
    return cleaned;
  }

  return cleaned;
};

// Download file helper
export const downloadFile = (blob: Blob, filename: string): void => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

// Generate random color
export const generateRandomColor = (): string => {
  const colors = [
    '#B7A89A', '#7B756D', '#9A9187', '#D6C7B8', '#E5CEC0',
    '#EEE8DF', '#B7A89A', '#7B756D', '#9A9187', '#D6C7B8',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

// Truncate text
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
};

// Capitalize first letter
export const capitalizeFirst = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

// Get initials
export const getInitials = (firstName: string, lastName: string): string => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

// Validate email
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s-]{10,}$/;
  return phoneRegex.test(phone);
};

// Calculate percentage
export const calculatePercentage = (part: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((part / total) * 100);
};

// Event type label
export const getEventTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    engagement: 'Engagement',
    henna: 'Henna Night',
    mehndi: 'Mehndi',
    nikah: 'Nikah',
    ceremony: 'Ceremony',
    reception: 'Reception',
    walima: 'Walima',
    sangeet: 'Sangeet',
    other: 'Other',
  };
  return labels[type.toLowerCase()] || capitalizeFirst(type);
};
