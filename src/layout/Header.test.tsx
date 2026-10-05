import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { Header } from './Header';
import * as useAuthModule from '../features/auth/hooks/useAuth';

vi.mock('../features/auth/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

describe('Header Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders navigation links with correct href attributes when logged in', () => {
    vi.mocked(useAuthModule.useAuth).mockReturnValue({
      id: '1',
      email: 'test@example.com',
      name: 'Test Musician',
    });

    const onTabChange = vi.fn();
    render(
      <Header
        activeTab="library"
        onTabChange={onTabChange}
        theme="light"
        onToggleTheme={vi.fn()}
      />
    );

    const libraryLink = screen.getByRole('link', { name: 'Library' });
    const practiceLink = screen.getByRole('link', { name: 'Practice' });
    const statsLink = screen.getByRole('link', { name: 'Stats' });

    expect(libraryLink).toHaveAttribute('href', '/library');
    expect(practiceLink).toHaveAttribute('href', '/practice');
    expect(statsLink).toHaveAttribute('href', '/stats');

    fireEvent.click(practiceLink);
    expect(onTabChange).toHaveBeenCalledWith('practice');

    fireEvent.click(statsLink);
    expect(onTabChange).toHaveBeenCalledWith('stats');
  });

  it('toggles theme when theme button is clicked', () => {
    vi.mocked(useAuthModule.useAuth).mockReturnValue(null);
    const onToggleTheme = vi.fn();

    render(
      <Header
        activeTab="library"
        onTabChange={vi.fn()}
        theme="light"
        onToggleTheme={onToggleTheme}
      />
    );

    const themeButton = screen.getByTitle('Switch to Dark Mode');
    fireEvent.click(themeButton);
    expect(onToggleTheme).toHaveBeenCalledTimes(1);
  });
});
