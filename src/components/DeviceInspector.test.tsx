import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { DeviceInspector } from './DeviceInspector';

describe('DeviceInspector Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders hardware capability cards and pulsing status', async () => {
    render(<DeviceInspector />);

    expect(screen.getByText('Real-Time Device & Hardware Inspector')).toBeInTheDocument();
    expect(screen.getByText('HARDWARE COMPATIBILITY VERIFIED')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/CPU Concurrency/i)).toBeInTheDocument();
      expect(screen.getByText(/System RAM/i)).toBeInTheDocument();
      expect(screen.getByText(/Display & Viewport/i)).toBeInTheDocument();
      expect(screen.getByText(/WebAssembly SIMD/i)).toBeInTheDocument();
    });
  });

  it('triggers onAutoFillSignup callback when button is clicked', async () => {
    const handleAutoFill = vi.fn();
    render(<DeviceInspector onAutoFillSignup={handleAutoFill} />);

    await waitFor(() => {
      expect(screen.getByText(/Auto-Fill My Device in Pilot Signup Form/i)).toBeInTheDocument();
    });

    const autoFillBtn = screen.getByText(/Auto-Fill My Device in Pilot Signup Form/i);
    fireEvent.click(autoFillBtn);

    expect(handleAutoFill).toHaveBeenCalledTimes(1);
    const callArg = handleAutoFill.mock.calls[0][0];
    expect(callArg).toHaveProperty('deviceModel');
    expect(callArg).toHaveProperty('androidVersion');
    expect(await screen.findByText('Auto-Filled Form!')).toBeInTheDocument();
  });

  it('rescans hardware on button click', async () => {
    render(<DeviceInspector />);

    const rescanBtn = screen.getByText(/Re-Inspect/i);
    fireEvent.click(rescanBtn);

    await waitFor(() => {
      expect(screen.getByText('HARDWARE COMPATIBILITY VERIFIED')).toBeInTheDocument();
    });
  });
});
