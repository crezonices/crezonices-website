import { useState, type FormEvent } from 'react';
import { CheckCircle2, Send } from 'lucide-react';
import { company } from '../../config/site';
import { services } from '../../data/content';
import { submitContactEnquiry } from '../../features/content/contentStore';
import { getApiUrl } from '../../lib/api';

type Mode = 'service' | 'contact';

export function EnquiryForm({ mode }: { mode: Mode }) {
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const service = mode === 'service';

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const formElement = e.currentTarget;

    const name = String(data.get('name') || '').trim();
    const email = String(data.get('email') || '').trim();
    const subject = String(data.get('subject') || '').trim();
    const description = String(data.get('description') || '').trim();
    const budget = String(data.get('budget') || '').trim();
    const honeypot = String(data.get('_hp') || '').trim();

    if (honeypot) {
      // Bot detected, silently succeed
      formElement.reset();
      return;
    }

    const next: Record<string, string> = {};
    if (!name) next.name = 'Please enter your name.';
    if (!/^\S+@\S+\.\S+$/.test(email)) next.email = 'Enter a valid email address.';
    if (!subject) next.subject = service ? 'Please select a service category.' : 'Please enter a subject.';
    if (!description) next.description = 'Please tell us a little about your enquiry.';

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    setStatusMessage(null);

    try {
      // 1. Try server-side email dispatch endpoint
      let backendSuccess = false;
      try {
        const res = await fetch(getApiUrl('/api/email/send'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            email,
            subject: service ? `Service Request: ${subject}` : subject,
            serviceNeeded: subject,
            budgetRange: budget || undefined,
            message: description,
          }),
        });
        if (res.ok) {
          const result = await res.json();
          backendSuccess = true;
          setStatusMessage({
            type: 'success',
            text: result.message || 'Thank you! Your message was transmitted directly to our engineering desk.',
          });
        }
      } catch {
        // Backend API offline or direct browser mode
      }

      // 2. Direct Firestore fallback if backend endpoint was unreachable
      if (!backendSuccess) {
        await submitContactEnquiry({
          name,
          email,
          serviceNeeded: subject,
          budgetRange: budget || undefined,
          message: description,
        });

        setStatusMessage({
          type: 'success',
          text: 'Thank you! Your inquiry has been securely transmitted to the Crezonices engineering desk. We will respond within 24 hours.',
        });
      }

      formElement.reset();
    } catch {
      // Fallback mailto preparation if completely offline
      const body = encodeURIComponent(
        `Name: ${name}\nEmail: ${email}\nService: ${subject}\nBudget: ${budget || 'Not specified'}\n\n${description}`
      );
      window.location.href = `mailto:${company.email}?subject=${encodeURIComponent(
        `Inquiry: ${subject}`
      )}&body=${body}`;
      setStatusMessage({
        type: 'success',
        text: 'Your email draft has been prepared. Review it in your email application and press Send.',
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="enquiry-form" onSubmit={handleSubmit} noValidate>
      {/* Bot honeypot field */}
      <input type="text" name="_hp" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />

      <div className="form-grid">
        <Field label="Full name *" name="name" error={errors.name} placeholder="Your name" />
        <Field label="Email address *" name="email" type="email" error={errors.email} placeholder="you@company.com" />

        {service ? (
          <label>
            Selected Service Category *
            <select name="subject" defaultValue="">
              <option value="" disabled>
                Select a service
              </option>
              {services.map((s) => (
                <option key={s.id} value={s.title}>
                  {s.title}
                </option>
              ))}
            </select>
            {errors.subject && <small className="error-hint">{errors.subject}</small>}
          </label>
        ) : (
          <Field label="Subject *" name="subject" error={errors.subject} placeholder="e.g. Partnership Opportunity" />
        )}

        {service && (
          <Field label="Project Budget (Optional)" name="budget" placeholder="e.g. $5,000 – $15,000" />
        )}
      </div>

      <label>
        {service ? 'Project Requirements & Objectives *' : 'Message Payload *'}
        <textarea
          name="description"
          rows={5}
          placeholder="Please describe your architecture, timeline, and technical objectives..."
        />
        {errors.description && <small className="error-hint">{errors.description}</small>}
      </label>

      <button
        className="button"
        type="submit"
        disabled={submitting}
        aria-label="Prepare email draft / Submit Secure Inquiry"
      >
        <Send size={15} /> {submitting ? 'Transmitting…' : 'Prepare email draft / Submit'}
      </button>

      {statusMessage && (
        <div className={`form-feedback-pill ${statusMessage.type}`}>
          <CheckCircle2 size={16} />
          <span>{statusMessage.text}</span>
        </div>
      )}
    </form>
  );
}

function Field({
  label,
  name,
  type = 'text',
  error,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  error?: string;
  placeholder?: string;
}) {
  return (
    <label>
      {label}
      <input name={name} type={type} placeholder={placeholder} />
      {error && <small className="error-hint">{error}</small>}
    </label>
  );
}
