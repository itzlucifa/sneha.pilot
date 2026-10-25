import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import App, { ErrorBoundary, CopyableBadge } from './App';

describe('SNEHA Pilot Distribution App', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('renders the pilot site header and hero section', () => {
    render(<App />);
    expect(screen.getByText('SNEHA.4U')).toBeInTheDocument();
    expect(screen.getAllByText(/com\.sneha\.app/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/THE AI WHICH ACTUALLY CARES/i)).toBeInTheDocument();
  });

  describe('Tab Switching', () => {
    it('switches to In-App Feedback tab and displays feedback form', async () => {
      render(<App />);
      const hamburger = screen.getByLabelText('Toggle menu');
      fireEvent.click(hamburger);

      const feedbackBtn = screen.getByText('2. App-Side Feedback');
      fireEvent.click(feedbackBtn);

      expect(screen.getByText('Tester')).toBeInTheDocument();
      expect(screen.getByText(/Reviews & Bugs/i)).toBeInTheDocument();
      expect(screen.getByText(/Overall Rating \(1 to 5\) \*/i)).toBeInTheDocument();
    });

    it('switches to Download APK tab and displays download cards and sideload uploader', async () => {
      render(<App />);
      const hamburger = screen.getByLabelText('Toggle menu');
      fireEvent.click(hamburger);

      const downloadBtn = screen.getByText('6. Download APK');
      fireEvent.click(downloadBtn);

      expect(screen.getByText('sneha-pilot-1.0.1.apk')).toBeInTheDocument();
      expect(screen.getByText('sneha-pilot-1.0.0.apk')).toBeInTheDocument();
      expect(screen.getByText(/Tester Sideload \/ Custom APK Upload Flow/i)).toBeInTheDocument();
    });

    it('switches to FAQ tab and toggles FAQ accordions', async () => {
      render(<App />);
      const hamburger = screen.getByLabelText('Toggle menu');
      fireEvent.click(hamburger);

      const faqBtn = screen.getByText('8. FAQ');
      fireEvent.click(faqBtn);

      // Verify FAQ questions are present
      const q1 = screen.getByText(/Q1\. What is SNEHA\?/i);
      expect(q1).toBeInTheDocument();

      // Initially answer is collapsed
      expect(screen.queryByText(/privacy-first, on-device AI companion/i)).not.toBeInTheDocument();

      // Click to expand
      fireEvent.click(q1);
      expect(screen.getByText(/privacy-first, on-device AI companion/i)).toBeInTheDocument();

      // Click again to collapse
      fireEvent.click(q1);
      expect(screen.queryByText(/privacy-first, on-device AI companion/i)).not.toBeInTheDocument();
    });

    it('toggles FAQ accordion using keyboard Enter and Space keys', async () => {
      render(<App />);
      const hamburger = screen.getByLabelText('Toggle menu');
      fireEvent.click(hamburger);
      fireEvent.click(screen.getByText('8. FAQ'));

      const q2 = screen.getByText(/Q2\. Does SNEHA collect my data\?/i);
      fireEvent.keyDown(q2.parentElement!, { key: 'Enter', code: 'Enter' });
      expect(screen.getByText(/Conversations, intent history, and automation preferences stay inside/i)).toBeInTheDocument();

      fireEvent.keyDown(q2.parentElement!, { key: ' ', code: 'Space' });
      expect(screen.queryByText(/Conversations, intent history, and automation preferences stay inside/i)).not.toBeInTheDocument();
    });
  });

  describe('Form Validation and Fallback Queue', () => {
    it('validates signup form fields before submission', async () => {
      render(<App />);

      const form = screen.getByPlaceholderText('e.g. Alex Sharma').closest('form')!;
      fireEvent.submit(form);

      expect(screen.getByText(/Please enter your full name \(at least 2 characters\)\./i)).toBeInTheDocument();
    });

    it('validates email format in signup form', async () => {
      render(<App />);

      const nameInput = screen.getByPlaceholderText('e.g. Alex Sharma');
      const emailInput = screen.getByPlaceholderText('name@example.com');
      const deviceInput = screen.getByPlaceholderText('e.g. Pixel 7, Galaxy S21');
      const form = nameInput.closest('form')!;

      fireEvent.change(nameInput, { target: { value: 'Alex Sharma' } });
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      fireEvent.change(deviceInput, { target: { value: 'Pixel 7' } });

      fireEvent.submit(form);

      expect(screen.getByText(/Please enter a valid email address/i)).toBeInTheDocument();
    });

    it('queues signup in localStorage when Supabase is unconfigured', async () => {
      render(<App />);

      const nameInput = screen.getByPlaceholderText('e.g. Alex Sharma');
      const emailInput = screen.getByPlaceholderText('name@example.com');
      const deviceInput = screen.getByPlaceholderText('e.g. Pixel 7, Galaxy S21');
      const form = nameInput.closest('form')!;

      fireEvent.change(nameInput, { target: { value: 'Tester Person' } });
      fireEvent.change(emailInput, { target: { value: 'tester@example.com' } });
      fireEvent.change(deviceInput, { target: { value: 'Samsung S22' } });

      fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.getByText(/Thank you! Your pilot sign-up has been recorded/i)).toBeInTheDocument();
      });
    });

    it('validates in-app feedback fields', async () => {
      render(<App />);
      fireEvent.click(screen.getByLabelText('Toggle menu'));
      fireEvent.click(screen.getByText('2. App-Side Feedback'));

      const whatWorkedInput = screen.getByPlaceholderText(/Prompt intent processing was instantaneous/i);
      const form = whatWorkedInput.closest('form')!;
      fireEvent.submit(form);

      expect(screen.getByText(/Please describe what worked well/i)).toBeInTheDocument();
    });
  });

  describe('Screenshot Lightbox Modal and Keyboard Trapping', () => {
    it('opens lightbox on screenshot click and closes on Close button', async () => {
      render(<App />);

      const screenshot1 = screen.getByAltText(/Screen 01: Features Dashboard/i);
      fireEvent.click(screenshot1);

      // Lightbox should now be visible
      const closeBtn = screen.getByText(/✕ Close/i);
      expect(closeBtn).toBeInTheDocument();

      // Click close button
      fireEvent.click(closeBtn);
      expect(screen.queryByText(/✕ Close/i)).not.toBeInTheDocument();
    });

    it('closes lightbox modal on Escape key press', async () => {
      render(<App />);

      const screenshot2 = screen.getByAltText(/Screen 02: Home Dashboard/i);
      fireEvent.click(screenshot2);

      expect(screen.getByText(/✕ Close/i)).toBeInTheDocument();

      fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
      expect(screen.queryByText(/✕ Close/i)).not.toBeInTheDocument();
    });
  });

  describe('Hamburger Menu Outside Click and Keyboard', () => {
    it('closes hamburger menu when Escape is pressed', () => {
      render(<App />);
      const hamburger = screen.getByLabelText('Toggle menu');
      fireEvent.click(hamburger);

      expect(screen.getByText('1. Pilot Site')).toBeInTheDocument();

      fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
      expect(screen.queryByText('1. Pilot Site')).not.toBeInTheDocument();
    });

    it('closes hamburger menu when clicking outside', () => {
      render(<App />);
      const hamburger = screen.getByLabelText('Toggle menu');
      fireEvent.click(hamburger);
      expect(screen.getByText('1. Pilot Site')).toBeInTheDocument();

      // Click outside on the body
      fireEvent.mouseDown(document.body);
      expect(screen.queryByText('1. Pilot Site')).not.toBeInTheDocument();
    });
  });

  describe('Live Viewport Sync Indicator', () => {
    it('shows active viewport and updates when switched', () => {
      render(<App />);
      expect(screen.getByText(/Active Viewport:/i)).toBeInTheDocument();
      expect(screen.getByText('DESKTOP')).toBeInTheDocument();

      const phoneBtn = screen.getAllByText('mobile')[0];
      fireEvent.click(phoneBtn);

      expect(screen.getByText('MOBILE')).toBeInTheDocument();
    });
  });

  describe('Copy to Clipboard Badge', () => {
    it('copies text and provides visual feedback', async () => {
      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      Object.assign(navigator, {
        clipboard: {
          writeText: writeTextMock,
        },
      });

      render(<CopyableBadge text="com.sneha.app" />);
      const copyBtn = screen.getByTitle('Click to copy: com.sneha.app');
      fireEvent.click(copyBtn);

      expect(writeTextMock).toHaveBeenCalledWith('com.sneha.app');
      expect(await screen.findByText('Copied!')).toBeInTheDocument();
    });
  });

  describe('Dark Mode Toggle', () => {
    it('toggles dark mode class on document element', () => {
      render(<App />);
      const darkModeToggle = screen.getByLabelText('Toggle dark mode');

      fireEvent.click(darkModeToggle);
      expect(document.documentElement.classList.contains('dark')).toBe(true);

      fireEvent.click(darkModeToggle);
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });
  });

  describe('Error Boundary', () => {
    it('renders fallback UI when a component throws', () => {
      const ThrowingComponent = () => {
        throw new Error('Test crash');
      };

      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <ErrorBoundary>
          <ThrowingComponent />
        </ErrorBoundary>
      );

      expect(screen.getByText(/SOMETHING WENT WRONG/i)).toBeInTheDocument();
      expect(screen.getByText(/Try Again ↻/i)).toBeInTheDocument();

      spy.mockRestore();
    });
  });
});
