import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { ThemeProvider, useTheme } from '../contexts/ThemeContext';

function TestComponent() {
  const { theme, toggleTheme } = useTheme();
  return (
    <div>
      <span data-testid="current-theme">{theme}</span>
      <button data-testid="toggle-btn" onClick={toggleTheme}>
        Toggle
      </button>
    </div>
  );
}

describe('Theme Management', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.dataset.theme = '';
  });

  it('defaults to light theme when no saved preference exists', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    const themeSpan = screen.getByTestId('current-theme');
    expect(themeSpan.textContent).toBe('light');
    expect(document.documentElement.dataset.theme).toBe('light');
  });

  it('toggles seamlessly between light and dark themes', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    const toggleButton = screen.getByTestId('toggle-btn');
    const themeSpan = screen.getByTestId('current-theme');

    expect(themeSpan.textContent).toBe('light');

    act(() => {
      toggleButton.click();
    });

    expect(themeSpan.textContent).toBe('dark');
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(localStorage.getItem('crezonices-theme')).toBe('dark');

    act(() => {
      toggleButton.click();
    });

    expect(themeSpan.textContent).toBe('light');
    expect(document.documentElement.dataset.theme).toBe('light');
    expect(localStorage.getItem('crezonices-theme')).toBe('light');
  });
});
