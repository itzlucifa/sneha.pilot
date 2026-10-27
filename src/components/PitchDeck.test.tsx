/**
 * @license
 * Tests for PitchDeck Component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { PitchDeck } from './PitchDeck';

describe('PitchDeck Component', () => {
  it('renders with default Slide 01 and presentation controls', () => {
    const handleNavigate = vi.fn();
    render(<PitchDeck onNavigateTab={handleNavigate} />);

    // Header badges and deck controls
    expect(screen.getByText(/PITCH DECK/i)).toBeInTheDocument();
    expect(screen.getByText(/SLIDE 01 \/ 10/i)).toBeInTheDocument();
    expect(screen.getByText(/05:00/i)).toBeInTheDocument(); // Default 5m pitch timer

    // Slide 01 title & content
    expect(screen.getByText(/The On-Device AI Revolution/i)).toBeInTheDocument();
    expect(screen.getByText(/₹0 Server Bills/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /100% Private/i })).toBeInTheDocument();
  });

  it('navigates through slides using Next and Prev buttons', () => {
    const handleNavigate = vi.fn();
    render(<PitchDeck onNavigateTab={handleNavigate} />);

    const nextBtn = screen.getByRole('button', { name: /Next Slide/i });
    const prevBtn = screen.getByRole('button', { name: /Previous Slide/i });

    // Prev button initially disabled on slide 0
    expect(prevBtn).toBeDisabled();

    // Advance to Slide 02
    fireEvent.click(nextBtn);
    expect(screen.getByText(/SLIDE 02 \/ 10/i)).toBeInTheDocument();
    expect(screen.getByText(/Why Cloud AI is Broken Today/i)).toBeInTheDocument();
    expect(screen.getByText(/Burning Cash on Servers/i)).toBeInTheDocument();
    expect(prevBtn).not.toBeDisabled();

    // Advance to Slide 03
    fireEvent.click(nextBtn);
    expect(screen.getByText(/SLIDE 03 \/ 10/i)).toBeInTheDocument();
    expect(screen.getByText(/SNEHA: True Edge Intelligence/i)).toBeInTheDocument();

    // Go back to Slide 02
    fireEvent.click(prevBtn);
    expect(screen.getByText(/SLIDE 02 \/ 10/i)).toBeInTheDocument();
  });

  it('allows jumping directly to a slide using slide pills', () => {
    const handleNavigate = vi.fn();
    render(<PitchDeck onNavigateTab={handleNavigate} />);

    // Jump to Slide 07 (Business Model / Unit Economics)
    const slide07Btn = screen.getByText('07');
    fireEvent.click(slide07Btn);

    expect(screen.getByText(/SLIDE 07 \/ 10/i)).toBeInTheDocument();
    expect(screen.getByText(/90%\+ Pure Profit Margins/i)).toBeInTheDocument();
    expect(screen.getByText(/Interactive Profit Simulator:/i)).toBeInTheDocument();
  });

  it('updates financial calculations dynamically when adjusting the simulator slider', () => {
    const handleNavigate = vi.fn();
    render(<PitchDeck onNavigateTab={handleNavigate} />);

    // Jump to Slide 07
    fireEvent.click(screen.getByText('07'));

    const slider = screen.getByRole('slider');
    expect(slider).toBeInTheDocument();

    // Default 50,000 users
    expect(screen.getByText(/(50,000|50,000) Users/i)).toBeInTheDocument();

    // Slide to 100,000 users
    fireEvent.change(slider, { target: { value: '100000' } });
    expect(screen.getByText(/(100,000|1,00,000) Users/i)).toBeInTheDocument();
  });

  it('switches to Executive Investor Memo view and renders continuous sections and slide-specific Q&A', () => {
    const handleNavigate = vi.fn();
    render(<PitchDeck onNavigateTab={handleNavigate} />);

    const memoBtn = screen.getByRole('button', { name: /Memo/i });
    fireEvent.click(memoBtn);

    // Masthead in Memo mode
    expect(screen.getByText(/INVESTMENT MEMORANDUM \/\/ CONFIDENTIAL/i)).toBeInTheDocument();
    expect(screen.getByText(/SNEHA: The On-Device AI Investment Memo/i)).toBeInTheDocument();
    expect(screen.getByText(/Panel Objection Defense \/\/ Section 01:/i)).toBeInTheDocument();
  });

  it('updates Judge Q&A Defense items dynamically for each slide', () => {
    const handleNavigate = vi.fn();
    render(<PitchDeck onNavigateTab={handleNavigate} />);

    // Slide 01 Q&A Defense is rendered by default
    expect(screen.getByText(/Slide 01 Judge Defense · VISION & MISSION/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Is an on-device AI companion really a venture-scale business, or just a small phone utility app\?/i)
    ).toBeInTheDocument();
    // Default 0 index is auto-expanded
    expect(
      screen.getByText(/This is the biggest architectural shift in mobile software since apps moved to the cloud/i)
    ).toBeInTheDocument();

    // Advance to Slide 02
    const nextBtn = screen.getByRole('button', { name: /Next Slide/i });
    fireEvent.click(nextBtn);

    // Slide 02 Q&A Defense updates dynamically
    expect(screen.getByText(/Slide 02 Judge Defense · THE BIG PROBLEM/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Don’t giants like Microsoft and Google have infinite cash to subsidize cloud server costs forever\?/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/No company can subsidize negative margins indefinitely at mass scale/i)
    ).toBeInTheDocument();

    // Jump to Slide 03 (Architecture)
    fireEvent.click(screen.getByText('03'));
    expect(screen.getByText(/Slide 03 Judge Defense · HOW SNEHA WORKS/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Can a cheap ₹10,000 phone with 4GB RAM really run an AI without lagging or overheating\?/i)
    ).toBeInTheDocument();
  });

  it('triggers onNavigateTab when deep link buttons are clicked', () => {
    const handleNavigate = vi.fn();
    render(<PitchDeck onNavigateTab={handleNavigate} />);

    // Jump to Slide 05 (Live Proof)
    fireEvent.click(screen.getByText('05'));

    const apkHubBtn = screen.getByRole('button', { name: /APK Download Hub →/i });
    fireEvent.click(apkHubBtn);
    expect(handleNavigate).toHaveBeenCalledWith('download');

    const auditBtn = screen.getByRole('button', { name: /Code Audit Table →/i });
    fireEvent.click(auditBtn);
    expect(handleNavigate).toHaveBeenCalledWith('audit');
  });
});
