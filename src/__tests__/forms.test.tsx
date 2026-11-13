import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EnquiryForm } from '../components/common/EnquiryForm';

describe('Enquiry & Contact Form Validation', () => {
  it('renders form fields with accessible labels', () => {
    render(<EnquiryForm mode="contact" />);
    expect(screen.getByLabelText(/Full name/i)).toBeDefined();
    expect(screen.getByLabelText(/Email address/i)).toBeDefined();
    expect(screen.getByLabelText(/Subject/i)).toBeDefined();
    expect(screen.getByLabelText(/Message/i)).toBeDefined();
  });

  it('displays validation errors when submitting empty form', () => {
    render(<EnquiryForm mode="contact" />);
    const submitBtn = screen.getByRole('button', { name: /Prepare email draft/i });

    fireEvent.click(submitBtn);

    expect(screen.getByText(/Please enter your name/i)).toBeDefined();
    expect(screen.getByText(/Enter a valid email address/i)).toBeDefined();
    expect(screen.getByText(/Please enter a subject/i)).toBeDefined();
    expect(screen.getByText(/Please tell us a little about your enquiry/i)).toBeDefined();
  });

  it('validates invalid email syntax', () => {
    render(<EnquiryForm mode="contact" />);

    const nameInput = screen.getByLabelText(/Full name/i);
    const emailInput = screen.getByLabelText(/Email address/i);
    const submitBtn = screen.getByRole('button', { name: /Prepare email draft/i });

    fireEvent.change(nameInput, { target: { value: 'Alex Tech' } });
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.click(submitBtn);

    expect(screen.getByText(/Enter a valid email address/i)).toBeDefined();
  });
});
