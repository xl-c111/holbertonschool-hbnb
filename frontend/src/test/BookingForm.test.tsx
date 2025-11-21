import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { BookingForm } from '../components/booking-form';
import { AuthProvider } from '../contexts/AuthContext';

const mockBookingDetails = {
  property: {
    id: 'test-property-id',
    name: 'Luxury Villa',
    location: 'Malibu, CA',
    price: 500,
    image: '/test-image.jpg',
    rating: 4.8,
    reviews: 120,
  },
  checkInDate: '2025-12-20',
  checkOutDate: '2025-12-25',
  guests: 2,
  pricePerNight: 500,
};

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <AuthProvider>{children}</AuthProvider>
  </BrowserRouter>
);

describe('BookingForm', () => {
  it('renders booking form with property details', () => {
    render(<BookingForm bookingDetails={mockBookingDetails} />, { wrapper });

    expect(screen.getByText('Confirm and Pay')).toBeInTheDocument();
    expect(screen.getByText('Luxury Villa')).toBeInTheDocument();
    expect(screen.getByText('Malibu, CA')).toBeInTheDocument();
  });

  it('calculates nights correctly', () => {
    render(<BookingForm bookingDetails={mockBookingDetails} />, { wrapper });

    // Check for "5 nights" in the price breakdown
    expect(screen.getByText(/5 night/i)).toBeInTheDocument();
  });

  it('displays price breakdown', () => {
    render(<BookingForm bookingDetails={mockBookingDetails} />, { wrapper });

    expect(screen.getByText('Price Details')).toBeInTheDocument();
    expect(screen.getByText('Cleaning fee')).toBeInTheDocument();
    expect(screen.getByText('Service fee')).toBeInTheDocument();
    expect(screen.getByText('Total')).toBeInTheDocument();
  });

  it('shows cancellation policy when check-in date exists', () => {
    render(<BookingForm bookingDetails={mockBookingDetails} />, { wrapper });

    expect(screen.getByText('Cancellation Policy')).toBeInTheDocument();
    expect(screen.getByText(/Free cancellation until/i)).toBeInTheDocument();
  });

  it('renders empty state when no property provided', () => {
    render(<BookingForm bookingDetails={{}} />, { wrapper });

    expect(screen.getByText('Select a property to continue')).toBeInTheDocument();
    expect(screen.getByText('Select dates from the property page.')).toBeInTheDocument();
  });
});
