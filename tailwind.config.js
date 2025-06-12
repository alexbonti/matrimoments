/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#FEFCF5',
          100: '#FDF8EB',
          200: '#FAF0D1',
          300: '#F6E7B7',
          400: '#F0D688',
          500: '#D4AF37', // Soft gold
          600: '#B8931E',
          700: '#9C7A14',
          800: '#80630F',
          900: '#664F0C',
        },
        rose: {
          50: '#FDF6F3',
          100: '#FBEEE7',
          200: '#F6D5C3',
          300: '#F1BC9F',
          400: '#E7A07B',
          500: '#DCAE96', // Dusty rose
          600: '#C8906C',
          700: '#B47342',
          800: '#915D35',
          900: '#6E4728',
        },
        sage: {
          50: '#F6F7F4',
          100: '#ECEEE9',
          200: '#D6DAD0',
          300: '#C0C6B7',
          400: '#B2AC88', // Sage green
          500: '#9A9771',
          600: '#82825A',
          700: '#6A6D43',
          800: '#52572C',
          900: '#3A4215',
        },
        neutral: {
          50: '#FAFAFA',
          100: '#F8F8F8', // Primary background
          200: '#F0F0F0',
          300: '#E8E8E8',
          400: '#D0D0D0',
          500: '#B8B8B8',
          600: '#808080',
          700: '#606060',
          800: '#404040',
          900: '#333333', // Text color
        }
      },
      fontFamily: {
        'serif': ['Playfair Display', 'Georgia', 'serif'],
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};