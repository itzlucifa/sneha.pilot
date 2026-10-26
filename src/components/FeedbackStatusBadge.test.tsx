import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FeedbackStatusBadge } from './FeedbackStatusBadge';

describe('FeedbackStatusBadge Component', () => {
  const STORAGE_KEY = 'sneha_feedback_status_map';

  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('renders with default status "Investigating" and persists changes to localStorage', () => {
    const onStatusChange = vi.fn();

    render(
      <FeedbackStatusBadge
        feedbackId={101}
        testerEmail="tester@example.com"
        rating={5}
        whatWorked="Audio playback and offline caching"
        whatBroke="None observed"
        onStatusChange={onStatusChange}
      />
    );

    // Initial status button displays Investigating
    const statusBtn = screen.getByRole('button', { name: /Triage status: Investigating/i });
    expect(statusBtn).toBeInTheDocument();

    // Click to open dropdown
    fireEvent.click(statusBtn);

    // Select "Bug Confirmed"
    const bugConfirmedBtn = screen.getByRole('menuitem', { name: /Bug Confirmed/i });
    fireEvent.click(bugConfirmedBtn);

    // Callback fired
    expect(onStatusChange).toHaveBeenCalledWith(101, 'Bug Confirmed');

    // Stored in localStorage
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    expect(stored['101']).toBe('Bug Confirmed');

    // UI updated
    expect(screen.getByRole('button', { name: /Triage status: Bug Confirmed/i })).toBeInTheDocument();
  }, 15000);

  it('loads previously stored status from localStorage on initial render', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ '202': 'Fixed in Next Build' }));

    render(
      <FeedbackStatusBadge
        feedbackId={202}
        testerEmail="tester2@example.com"
        rating={4}
        whatWorked="UI responsiveness"
        whatBroke="Navigation gesture glitch"
      />
    );

    expect(
      screen.getByRole('button', { name: /Triage status: Fixed in Next Build/i })
    ).toBeInTheDocument();
  });

  it('renders pre-composed mailto link with encoded feedback details for Reply to Tester button', () => {
    render(
      <FeedbackStatusBadge
        feedbackId={303}
        testerEmail="pixel.tester@domain.com"
        rating={4}
        whatWorked="Edge-to-edge support"
        whatBroke="Audio latency on Bluetooth"
      />
    );

    const replyLink = screen.getByRole('link', { name: /Reply to tester at pixel\.tester@domain\.com/i });
    expect(replyLink).toBeInTheDocument();

    const href = replyLink.getAttribute('href') || '';
    expect(href).toContain('mailto:pixel.tester%40domain.com');
    expect(href).toContain('subject=%5BSNEHA%20Pilot%20Feedback%20%23303%5D');
    expect(href).toContain('Edge-to-edge%20support');
    expect(href).toContain('Audio%20latency%20on%20Bluetooth');
    expect(href).toContain('INVESTIGATING');
  });

  it('renders disabled indicator when testerEmail is not provided', () => {
    render(
      <FeedbackStatusBadge
        feedbackId={404}
        testerEmail={null}
        rating={3}
        whatWorked="Everything"
        whatBroke="Nothing"
      />
    );

    expect(screen.queryByRole('link', { name: /Reply to tester/i })).not.toBeInTheDocument();
    expect(screen.getByText('No Email')).toBeInTheDocument();
  });

  it('allows cycling through all 5 triage statuses', () => {
    const { rerender } = render(
      <FeedbackStatusBadge
        feedbackId={505}
        testerEmail="dev@sneha.internal"
        rating={2}
        whatWorked="Install"
        whatBroke="Crash on launch"
      />
    );

    const statuses = [
      'Investigating',
      'Bug Confirmed',
      'Fixed in Next Build',
      'Feature Planned',
      'Closed / Resolved',
    ] as const;

    statuses.forEach((st) => {
      const btn = screen.getByRole('button', { name: /Triage status:/i });
      fireEvent.click(btn);
      const targetOption = screen.getByRole('menuitem', { name: new RegExp(st, 'i') });
      fireEvent.click(targetOption);

      expect(
        screen.getByRole('button', { name: new RegExp(`Triage status: ${st}`, 'i') })
      ).toBeInTheDocument();

      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      expect(stored['505']).toBe(st);
    });
  });
});
