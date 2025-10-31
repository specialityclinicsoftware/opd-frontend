// Centralized Blue Theme
export const theme = {
  colors: {
    // Primary Blues
    primary: {
      navy: '#1e3a8a',      // Navy blue for sidebar
      main: '#3b82f6',      // Main blue
      light: '#60a5fa',     // Light blue
      lighter: '#93c5fd',   // Lighter blue
      lightest: '#dbeafe',  // Lightest blue (backgrounds)
      dark: '#1e40af',      // Dark blue
      darker: '#1e3a8a',    // Darker blue
    },

    // Neutrals (gray scale for text and borders)
    neutral: {
      white: '#ffffff',
      gray50: '#f8fafc',
      gray100: '#f1f5f9',
      gray200: '#e2e8f0',
      gray300: '#cbd5e1',
      gray400: '#94a3b8',
      gray500: '#64748b',
      gray600: '#475569',
      gray700: '#334155',
      gray800: '#1e293b',
      gray900: '#0f172a',
      black: '#000000',
    },

    // Semantic colors (using blue tones)
    semantic: {
      success: '#3b82f6',      // Blue for success
      successLight: '#dbeafe',
      error: '#3b82f6',        // Blue for errors (less alarming)
      errorLight: '#dbeafe',
      warning: '#60a5fa',      // Light blue for warnings
      warningLight: '#eff6ff',
      info: '#3b82f6',
      infoLight: '#eff6ff',
    },

    // UI Elements
    ui: {
      background: '#f8fafc',
      backgroundAlt: '#f1f5f9',
      border: '#e2e8f0',
      borderLight: '#f1f5f9',
      text: '#1e293b',
      textLight: '#64748b',
      textMuted: '#94a3b8',
      overlay: 'rgba(15, 23, 42, 0.5)',
    },
  },

  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  },

  // Border radius
  radius: {
    sm: '4px',
    md: '6px',
    lg: '8px',
    xl: '12px',
    full: '9999px',
  },

  // Spacing
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    xxl: '32px',
  },
};

// Helper function to get colors
export const getColor = (path: string): string => {
  const keys = path.split('.');
  let value: any = theme.colors;

  for (const key of keys) {
    value = value[key];
    if (!value) return theme.colors.primary.main;
  }

  return value;
};

export default theme;
