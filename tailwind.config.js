module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1a1a1a',    // Almost black for text
          light: '#2d2d2d',      // Lighter black for hover
        },
        secondary: {
          DEFAULT: '#ffffff',    // White
          dark: '#f5f5f5',      // Light gray for backgrounds
        },
        accent: {
          DEFAULT: '#ffab00',    // Gold
          dark: '#ff9100',       // Darker gold for hover
        },
        dark: {
          primary: '#ffffff',    // White text for dark mode
          secondary: '#121212',  // Dark background
          surface: '#1e1e1e',   // Slightly lighter dark for cards
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}