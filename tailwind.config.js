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
          DEFAULT: '#8a5d00',    // Accessible gold-brown for text and fills
          dark: '#6f4a00',       // Darker hover shade
        },
        dark: {
          primary: '#ffffff',    // White text for dark mode
          secondary: '#121212',  // Dark background
          surface: '#1e1e1e',   // Slightly lighter dark for cards
        }
      },
      fontFamily: {
        sans: ['Manrope', 'sans-serif'],
      },
    },
  },
  plugins: [],
}