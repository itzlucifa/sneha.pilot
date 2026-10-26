import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { ChecksumValidator } from './ChecksumValidator';

describe('ChecksumValidator Component', () => {
  const defaultHash = 'c7a409f9e160ef5212384918e90e768393e5066db293bb859c253456860d5e1b';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with default expected hash and awaiting state', () => {
    render(<ChecksumValidator expectedHash={defaultHash} fileName="sneha-v1.0.2-release.apk" />);

    expect(screen.getByText('Cryptographic Checksum Validator')).toBeInTheDocument();
    expect(screen.getByText(/STATUS: AWAITING APK SELECTION/i)).toBeInTheDocument();
    expect(screen.getByText(/Target: sneha-v1.0.2-release.apk/i)).toBeInTheDocument();
  });

  it('simulates official build verification and displays verified badge', async () => {
    render(<ChecksumValidator expectedHash={defaultHash} />);

    const officialBtn = screen.getByText('Simulate Official Build');
    fireEvent.click(officialBtn);

    await waitFor(() => {
      expect(screen.getByText('VERIFIED OFFICIAL SNEHA BUILD')).toBeInTheDocument();
    });

    expect(screen.getByText('MATCH 100%')).toBeInTheDocument();
    expect(screen.getByText('sneha-v1.0.2-release.apk')).toBeInTheDocument();
  });

  it('simulates tampered build and displays mismatch alert badge', async () => {
    render(<ChecksumValidator expectedHash={defaultHash} />);

    const tamperedBtn = screen.getByText('Simulate Tampered Build');
    fireEvent.click(tamperedBtn);

    await waitFor(() => {
      expect(screen.getByText('CHECKSUM MISMATCH - POTENTIAL TAMPERING')).toBeInTheDocument();
    });

    expect(screen.getByText('CORRUPTED')).toBeInTheDocument();
  });

  it('copies expected and computed hash to clipboard', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock
      }
    });

    render(<ChecksumValidator expectedHash={defaultHash} />);

    // Copy expected hash
    const copyExpectedBtn = screen.getByText('COPY');
    fireEvent.click(copyExpectedBtn);
    expect(writeTextMock).toHaveBeenCalledWith(defaultHash);
    expect(await screen.findByText('COPIED')).toBeInTheDocument();
  });

  it('allows configuring a custom expected hash', () => {
    render(<ChecksumValidator expectedHash={defaultHash} />);

    const customHashToggle = screen.getByText('Custom Hash');
    fireEvent.click(customHashToggle);

    expect(screen.getByText('Set Custom Expected SHA-256 Hash:')).toBeInTheDocument();
  });
});
