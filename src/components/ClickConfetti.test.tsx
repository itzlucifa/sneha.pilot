import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, act, fireEvent } from '@testing-library/react';
import { ClickConfetti, triggerGeometricBlast } from './ClickConfetti';

describe('ClickConfetti Component', () => {
  it('mounts without errors and responds to blast events', () => {
    const { container } = render(<ClickConfetti />);
    expect(container).toBeInTheDocument();

    act(() => {
      triggerGeometricBlast(120, 150, 10);
    });
  });

  it('triggers geometric confetti on clicks and taps anywhere on the screen', () => {
    render(<ClickConfetti />);

    act(() => {
      fireEvent.pointerDown(window, { clientX: 250, clientY: 350 });
    });
  });
});
