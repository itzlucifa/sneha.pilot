import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { SideloadWizard } from './SideloadWizard';

describe('SideloadWizard Component', () => {
  it('renders with default Android 14 & 15 tabs and step cards', () => {
    render(<SideloadWizard />);

    expect(screen.getByText('Interactive Android Sideload Wizard')).toBeInTheDocument();
    expect(screen.getByText('Android 14 & 15')).toBeInTheDocument();
    expect(screen.getByText('Android 12 & 13')).toBeInTheDocument();
    expect(screen.getByText('Android 8.0 - 11')).toBeInTheDocument();
    expect(screen.getByText('Download Official SNEHA APK Build')).toBeInTheDocument();
  });

  it('allows switching Android OS version tabs', () => {
    render(<SideloadWizard />);

    const android12Tab = screen.getByText('Android 12 & 13');
    fireEvent.click(android12Tab);

    expect(screen.getByText('Grant "Allow From This Source" Permission')).toBeInTheDocument();
  });

  it('allows switching OEM manufacturer tabs', () => {
    render(<SideloadWizard />);

    const samsungTab = screen.getByText('Samsung Galaxy (One UI)');
    fireEvent.click(samsungTab);

    expect(screen.getByText(/Enable "Install Unknown Apps" for One UI/i)).toBeInTheDocument();
    expect(screen.getByText(/Samsung One UI 6 & 7 "Auto Blocker" Warning/i)).toBeInTheDocument();
  });

  it('tracks progress when completing steps', () => {
    render(<SideloadWizard />);

    expect(screen.getByText('0/4 COMPLETED (0%)')).toBeInTheDocument();

    const markDoneBtns = screen.getAllByText('Mark Done');
    fireEvent.click(markDoneBtns[0]);

    expect(screen.getByText('1/4 COMPLETED (25%)')).toBeInTheDocument();
  });

  it('filters troubleshooting guides with search query', () => {
    render(<SideloadWizard />);

    const searchInput = screen.getByPlaceholderText(/Filter errors/i);
    fireEvent.change(searchInput, { target: { value: 'Auto Blocker' } });

    expect(screen.getByText(/Samsung Auto Blocker Prevents Sideloading/i)).toBeInTheDocument();
    expect(screen.queryByText(/Xiaomi \/ Poco 10-Second Risk/i)).not.toBeInTheDocument();
  });
});
