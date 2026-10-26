import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AdminAnalytics } from './AdminAnalytics';

describe('AdminAnalytics Component', () => {
  const sampleSignups = [
    {
      id: 1,
      name: 'Tester Alice',
      email: 'alice@google.com',
      android_version: 'Android 15 (Vanilla Ice Cream)',
      device_model: 'Google Pixel 9 Pro',
    },
    {
      id: 2,
      name: 'Tester Bob',
      email: 'bob@samsung.com',
      android_version: 'Android 14 (Upside Down Cake)',
      device_model: 'Samsung Galaxy S24 Ultra',
    },
    {
      id: 3,
      name: 'Tester Charlie',
      email: 'charlie@oneplus.com',
      android_version: 'Android 13 (Tiramisu)',
      device_model: 'OnePlus 12',
    },
    {
      id: 4,
      name: 'Tester Dave',
      email: 'dave@xiaomi.com',
      android_version: 'Android 12',
      device_model: 'Xiaomi 14 Pro',
    },
    {
      id: 5,
      name: 'Tester Eve',
      email: 'eve@moto.com',
      android_version: 'Android 11',
      device_model: 'Motorola Edge 50',
    },
  ];

  const sampleFeedback = [
    {
      id: 101,
      rating: 5,
      what_worked: 'Flawless edge to edge, sound playback is smooth',
      what_broke: 'None',
      what_to_add: 'More widgets',
      tester_email: 'alice@google.com',
      tester_device: 'Google Pixel 9 Pro',
    },
    {
      id: 102,
      rating: 4,
      what_worked: 'Fast sync and offline support',
      what_broke: 'Small stutter on rotation',
      what_to_add: 'Tablet dual-pane',
      tester_email: 'bob@samsung.com',
      tester_device: 'Samsung Galaxy S24 Ultra',
    },
    {
      id: 103,
      rating: 3,
      what_worked: 'GPLv3 privacy guarantee',
      what_broke: 'Crash when disconnected during download',
      what_to_add: 'Automatic retry prompt',
      tester_email: 'charlie@oneplus.com',
      tester_device: 'OnePlus 12',
    },
  ];

  it('renders KPI metrics and computes engagement ratio & satisfaction correctly', () => {
    render(<AdminAnalytics signups={sampleSignups} feedback={sampleFeedback} />);

    // 1. Engagement Ratio: 3 feedback / 5 signups = 60.0%
    expect(screen.getByText('60%')).toBeInTheDocument();
    expect(screen.getByText(/3 reviews \/ 5 testers/i)).toBeInTheDocument();

    // 2. Average Rating: (5 + 4 + 3) / 3 = 4.0 ★
    expect(screen.getByText('4.0')).toBeInTheDocument();
    expect(screen.getByText(/CSAT Score: 80%/i)).toBeInTheDocument();

    // 3. Audited test reports: 3 verified reports
    expect(screen.getByText('Audited Test Reports')).toBeInTheDocument();

    // 4. Enrolled fleet: 5 handsets
    expect(screen.getByText('Enrolled Fleet')).toBeInTheDocument();
  });

  it('computes and displays rating breakdown distribution with counts and percentages', () => {
    render(<AdminAnalytics signups={sampleSignups} feedback={sampleFeedback} />);

    expect(screen.getByText('Rating Breakdown Distribution')).toBeInTheDocument();

    // Star badges: 5★, 4★, 3★, 2★, 1★
    expect(screen.getAllByText('5').length).toBeGreaterThan(0);
    expect(screen.getAllByText('4').length).toBeGreaterThan(0);
    expect(screen.getAllByText('3').length).toBeGreaterThan(0);
    expect(screen.getAllByText('2').length).toBeGreaterThan(0);
    expect(screen.getAllByText('1').length).toBeGreaterThan(0);

    // Total audited ratings text
    expect(screen.getByText(/3 Total Ratings Audited/i)).toBeInTheDocument();
  });

  it('computes Android OS Version breakdown chart', () => {
    render(<AdminAnalytics signups={sampleSignups} feedback={sampleFeedback} />);

    expect(screen.getByText('Android OS Version Distribution')).toBeInTheDocument();
    expect(screen.getByText('Android 15')).toBeInTheDocument();
    expect(screen.getByText('Target SDK 35')).toBeInTheDocument();
    expect(screen.getByText('Android 14')).toBeInTheDocument();
    expect(screen.getByText('Android 13')).toBeInTheDocument();
  });

  it('computes Top tested handset models & manufacturers breakdown', () => {
    render(<AdminAnalytics signups={sampleSignups} feedback={sampleFeedback} />);

    expect(screen.getByText('Top Manufacturers')).toBeInTheDocument();
    expect(screen.getByText('Top Tested Handset Models')).toBeInTheDocument();

    expect(screen.getAllByText('Google Pixel').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Samsung Galaxy').length).toBeGreaterThan(0);
    expect(screen.getAllByText('OnePlus').length).toBeGreaterThan(0);
  });

  it('handles empty datasets safely without NaN or crashes', () => {
    render(<AdminAnalytics signups={[]} feedback={[]} />);

    expect(screen.getAllByText('0%').length).toBeGreaterThan(0);
    expect(screen.getByText('5.0')).toBeInTheDocument();
    expect(screen.getByText('0 Total Ratings Audited')).toBeInTheDocument();
  });

  it('allows switching views using filter controls', () => {
    render(<AdminAnalytics signups={sampleSignups} feedback={sampleFeedback} />);

    // Switch to Satisfaction view
    fireEvent.click(screen.getByRole('button', { name: 'Satisfaction' }));
    expect(screen.getByText('Rating Breakdown Distribution')).toBeInTheDocument();
    expect(screen.queryByText('Android OS Version Distribution')).not.toBeInTheDocument();

    // Switch to Android OS view
    fireEvent.click(screen.getByRole('button', { name: 'Android OS' }));
    expect(screen.getByText('Android OS Version Distribution')).toBeInTheDocument();
    expect(screen.queryByText('Rating Breakdown Distribution')).not.toBeInTheDocument();

    // Switch to Hardware OEM view
    fireEvent.click(screen.getByRole('button', { name: 'Hardware OEM' }));
    expect(screen.getByText('Top Manufacturers')).toBeInTheDocument();
    expect(screen.queryByText('Android OS Version Distribution')).not.toBeInTheDocument();

    // Switch back to Overview
    fireEvent.click(screen.getByRole('button', { name: 'Overview' }));
    expect(screen.getByText('Rating Breakdown Distribution')).toBeInTheDocument();
    expect(screen.getByText('Android OS Version Distribution')).toBeInTheDocument();
  });
});
