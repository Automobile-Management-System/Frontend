export const formatCurrency = (amount: number | undefined): string => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '$0';
  }
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(1)}k`;
  }
  return `$${amount.toFixed(0)}`;
};

export const formatPercentage = (value: number | undefined): string => {
  if (value === undefined || value === null || isNaN(value)) {
    return '0.0%';
  }
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
};

export const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  
  const minutes = Math.floor(diffInMs / (1000 * 60));
  const hours = Math.floor(diffInMs / (1000 * 60 * 60));
  const days = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (minutes < 60) {
    return `${minutes} minutes ago`;
  } else if (hours < 24) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
};

export const getAlertIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'warning':
      return '⚠️';
    case 'info':
      return 'ℹ️';
    case 'success':
      return '✅';
    default:
      return '📋';
  }
};

export const getAlertStyles = (type: string) => {
  switch (type.toLowerCase()) {
    case 'warning':
      return {
        bg: 'bg-yellow-50 border-yellow-200',
        text: 'text-yellow-600',
        icon: 'text-yellow-600'
      };
    case 'info':
      return {
        bg: 'bg-blue-50 border-blue-200',
        text: 'text-blue-600',
        icon: 'text-blue-600'
      };
    case 'success':
      return {
        bg: 'bg-green-50 border-green-200',
        text: 'text-green-600',
        icon: 'text-green-600'
      };
    default:
      return {
        bg: 'bg-gray-50 border-gray-200',
        text: 'text-gray-600',
        icon: 'text-gray-600'
      };
  }
};