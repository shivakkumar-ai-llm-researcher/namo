import { AuthError, PostgrestError } from '@supabase/supabase-js';

export const getErrorMessage = (error: unknown): string => {
  if (!error) return 'An unknown error occurred';
  
  if (error instanceof AuthError) {
    switch (error.message) {
      case 'Invalid login credentials':
        return 'Invalid email or password. Please try again.';
      case 'Email not confirmed':
        return 'Please confirm your email address before logging in.';
      case 'User not found':
        return 'No account found with this email.';
      case 'Too many requests':
        return 'Too many attempts. Please wait a few minutes and try again.';
      default:
        return error.message;
    }
  }

  if (typeof error === 'object' && error !== null && 'code' in error) {
    const pgError = error as PostgrestError;
    switch (pgError.code) {
      case '23505':
        return 'A record with this ID already exists.';
      case '23503':
        return 'Cannot delete: this record is referenced by other data.';
      case '42501':
        return 'You do not have permission to perform this action.';
      case 'PGRST116':
        return 'Record not found.';
      default:
        return pgError.message || 'A database error occurred.';
    }
  }

  if (error instanceof Error) {
    if (error.message.includes('network') || error.message.includes('fetch')) {
      return 'Network error. Please check your internet connection.';
    }
    if (error.message.includes('timeout')) {
      return 'Request timed out. Please try again.';
    }
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
};

export const isNetworkError = (error: unknown): boolean => {
  if (error instanceof Error) {
    return error.message.includes('network') ||
           error.message.includes('fetch') ||
           error.message.includes('Failed to fetch');
  }
  return false;
};
