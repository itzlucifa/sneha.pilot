import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { QRCodeModal } from './QRCodeModal';

describe('QRCodeModal Component', () => {
  const defaultUrl = 'https://sneha.app/download/sneha-v1.0.2-release.apk';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(
      <QRCodeModal isOpen={false} onClose={() => {}} url={defaultUrl} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders modal dialog with custom title and scannable SVG when isOpen is true', () => {
    render(
      <QRCodeModal
        isOpen={true}
        onClose={() => {}}
        url={defaultUrl}
        title="DIRECT DOWNLOAD SCANNER"
      />
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('DIRECT DOWNLOAD SCANNER')).toBeInTheDocument();
    expect(screen.getByLabelText(/Scannable QR Code/i)).toBeInTheDocument();
    expect(screen.getByText('● SCAN TARGET')).toBeInTheDocument();
  });

  it('renders phone scanning instructions and url pill', () => {
    render(<QRCodeModal isOpen={true} onClose={() => {}} url={defaultUrl} />);

    expect(screen.getByText(/How to Scan from your Phone:/i)).toBeInTheDocument();
    expect(screen.getByText(defaultUrl)).toBeInTheDocument();
  });

  it('copies link to clipboard and shows feedback', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock
      }
    });

    render(<QRCodeModal isOpen={true} onClose={() => {}} url={defaultUrl} />);

    const copyBtn = screen.getByText('Copy');
    fireEvent.click(copyBtn);

    expect(writeTextMock).toHaveBeenCalledWith(defaultUrl);
    expect(await screen.findByText('Copied!')).toBeInTheDocument();
  });

  it('invokes onClose when clicking close button or backdrop', () => {
    const handleClose = vi.fn();
    render(<QRCodeModal isOpen={true} onClose={handleClose} url={defaultUrl} />);

    const closeBtn = screen.getByLabelText('Close QR Code Modal');
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);

    // Click backdrop
    const backdrop = screen.getByRole('dialog');
    fireEvent.click(backdrop);
    expect(handleClose).toHaveBeenCalledTimes(2);
  });

  it('closes on Escape key press', () => {
    const handleClose = vi.fn();
    render(<QRCodeModal isOpen={true} onClose={handleClose} url={defaultUrl} />);

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
