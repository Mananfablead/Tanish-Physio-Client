/**
 * Example Form Component with CSRF Protection
 * 
 * This demonstrates how to properly implement CSRF protection
 * in your React forms when making POST, PUT, or DELETE requests.
 */

import React, { useState } from 'react';
import { useCsrf } from '@/context/CsrfContext';
import api from '@/lib/api';

interface FormData {
  name: string;
  email: string;
  message: string;
}

/**
 * Example 1: Using the useCsrf hook with automatic token management
 * The API interceptor will automatically include the CSRF token
 */
export const ContactFormWithCsrf: React.FC = () => {
  const { csrfToken, isLoading, error } = useCsrf();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // The CSRF token is automatically included in the request headers
      // by the axios interceptor in api.ts
      const response = await api.post('/contact-message', formData);
      
      console.log('Message sent:', response.data);
      alert('Message sent successfully!');
      
      // Reset form
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return <div>Loading security token...</div>;
  }

  if (error) {
    return <div>Error loading security token: {error.message}</div>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="name">Name:</label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div>
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
      </div>

      <div>
        <label htmlFor="message">Message:</label>
        <textarea
          id="message"
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          required
        />
      </div>

      <button type="submit" disabled={submitting || !csrfToken}>
        {submitting ? 'Sending...' : 'Send Message'}
      </button>

      {!csrfToken && (
        <p style={{ color: 'red' }}>
          Security token not available. Please refresh the page.
        </p>
      )}
    </form>
  );
};

/**
 * Example 2: Manual CSRF token handling for file uploads
 * When using FormData, you may need to manually append the CSRF token
 */
export const FileUploadFormWithCsrf: React.FC = () => {
  const { getToken } = useCsrf();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) return;

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // Manually append CSRF token to FormData
      const csrfToken = getToken();
      if (csrfToken) {
        formData.append('_csrf', csrfToken);
      }

      // Note: Don't set Content-Type header manually
      // Browser will automatically set it with boundary
      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          // The CSRF token is also included via the interceptor
          // but we're adding it to FormData as well for compatibility
        },
      });

      console.log('File uploaded:', response.data);
      alert('File uploaded successfully!');
      setFile(null);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleFileUpload}>
      <div>
        <label htmlFor="file">Select File:</label>
        <input
          type="file"
          id="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          required
        />
      </div>

      <button type="submit" disabled={uploading}>
        {uploading ? 'Uploading...' : 'Upload File'}
      </button>
    </form>
  );
};

/**
 * Example 3: Using CSRF utilities directly (alternative approach)
 */
export const BookingFormWithManualCsrf: React.FC = () => {
  const [bookingData, setBookingData] = useState({
    serviceId: '',
    date: '',
    time: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Option 1: Use the utility function to get headers
      // import { getCsrfHeaders } from '@/utils/csrf';
      // const headers = getCsrfHeaders();
      
      // Option 2: The API interceptor handles it automatically (recommended)
      const response = await api.post('/bookings', bookingData);

      console.log('Booking created:', response.data);
      alert('Booking created successfully!');
      setBookingData({ serviceId: '', date: '', time: '', notes: '' });
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Failed to create booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="service">Service:</label>
        <select
          id="service"
          value={bookingData.serviceId}
          onChange={(e) => setBookingData({ ...bookingData, serviceId: e.target.value })}
          required
        >
          <option value="">Select a service</option>
          <option value="1">Consultation</option>
          <option value="2">Therapy Session</option>
          <option value="3">Follow-up</option>
        </select>
      </div>

      <div>
        <label htmlFor="date">Date:</label>
        <input
          type="date"
          id="date"
          value={bookingData.date}
          onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
          required
        />
      </div>

      <div>
        <label htmlFor="time">Time:</label>
        <input
          type="time"
          id="time"
          value={bookingData.time}
          onChange={(e) => setBookingData({ ...bookingData, time: e.target.value })}
          required
        />
      </div>

      <div>
        <label htmlFor="notes">Notes:</label>
        <textarea
          id="notes"
          value={bookingData.notes}
          onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
        />
      </div>

      <button type="submit" disabled={submitting}>
        {submitting ? 'Creating Booking...' : 'Create Booking'}
      </button>
    </form>
  );
};

export default ContactFormWithCsrf;
