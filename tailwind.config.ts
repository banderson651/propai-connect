import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";
import tailwindcssAnimate from "tailwindcss-animate";

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["Inter", "var(--font-sans)", ...fontFamily.sans],
        playfair: ['Playfair Display', 'serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        sidebar: {
          DEFAULT: "hsl(var(--sidebar))",
          foreground: "hsl(var(--sidebar-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        success: {
          DEFAULT: "#54D62C",
          foreground: "#FFFFFF",
        },
        info: {
          DEFAULT: "#1890FF",
          foreground: "#FFFFFF",
        },
        warning: {
          DEFAULT: "#FFC107",
          foreground: "#FFFFFF",
        },
        error: {
          DEFAULT: "#FF4842",
          foreground: "#FFFFFF",
        },
        // Minimal UI palette inspired colors
        minimal: {
          blue: {
            100: '#D1E9FC',
            200: '#76B0F1',
            400: '#2065D1',
            600: '#103996',
            800: '#061B64',
          },
          grey: {
            100: '#F9FAFB',
            200: '#F4F6F8',
            300: '#DFE3E8',
            400: '#C4CDD5',
            500: '#919EAB',
            600: '#637381',
            700: '#454F5B',
            800: '#212B36',
            900: '#161C24',
          },
          green: {
            100: '#E9FCD4',
            400: '#54D62C',
            600: '#229A16',
            800: '#08660D',
          },
          orange: {
            100: '#FFF7CD',
            400: '#FFC107',
            600: '#B78103',
            800: '#7A4F01',
          },
          red: {
            100: '#FFE7D9',
            400: '#FF4842',
            600: '#B72136',
            800: '#7A0C2E',
          },
          purple: {
            100: '#EBD6FD',
            400: '#9C27B0',
            600: '#6C1D7C',
            800: '#3A0D4E',
          },
        },
      },
      borderRadius: {
        lg: '1rem',
        md: '0.75rem',
        sm: '0.5rem',
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgb(145 158 171 / 8%)',
        'md': '0 4px 8px 0 rgb(145 158 171 / 12%)',
        'lg': '0 8px 16px 0 rgb(145 158 171 / 16%)',
        'xl': '0 16px 32px 0 rgb(145 158 171 / 20%)',
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1.5' }],
        sm: ['0.875rem', { lineHeight: '1.5715' }],
        base: ['1rem', { lineHeight: '1.5' }],
        lg: ['1.125rem', { lineHeight: '1.5' }],
        xl: ['1.25rem', { lineHeight: '1.5' }],
        '2xl': ['1.5rem', { lineHeight: '1.33' }],
        '3xl': ['1.875rem', { lineHeight: '1.33' }],
        '4xl': ['2.25rem', { lineHeight: '1.25' }],
        '5xl': ['3rem', { lineHeight: '1.2' }],
      },
      transitionProperty: {
        'sidebar': 'width, background-color, box-shadow',
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;

export default config;
