import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
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
      colors: {
        base: '#0F0F0F',
        card: '#121418',
        aquaTop: '#dff1ff',
        aquaMid: '#8fc6ff',
        aquaDeep: '#2a76ff',
        plate: '#0b0e13',
        cta: '#FF6A00',
        alert: '#FFE302',
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: {
          DEFAULT: "hsl(var(--background))",
          soft: "hsl(var(--background-soft))",
        },
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        success: "hsl(var(--success))",
        alert: {
          DEFAULT: "hsl(var(--alert))",
          foreground: "hsl(var(--alert-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        aqua: {
          titlebar: {
            light: '#edf2ff',
            dark: '#c8d8ff',
          },
          chrome: '#e6ecf9',
          stripe: '#f6f8ff',
          blue: '#3b82f6',
          blueDark: '#2563eb',
          border: '#aab4d0',
          bevel: '#ffffff',
          shadow: 'rgba(0,0,0,0.18)',
        },
      },
      fontFamily: {
        sans: ['Lucida Grande', 'Geneva', 'Verdana', 'sans-serif'],
        mono: ['Monaco', 'Courier New', 'monospace'],
        righteous: ['Righteous', 'cursive', 'sans-serif'],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        aqua: '18px',
      },
      dropShadow: {
        aqua: '0 12px 28px rgba(42,118,255,.35)',
      },
      boxShadow: {
        'skeu-raised-sm': 'var(--shadow-raised-sm)',
        'skeu-raised': 'var(--shadow-raised)',
        'skeu-raised-lg': 'var(--shadow-raised-lg)',
        'skeu-inset': 'var(--shadow-inset)',
        'skeu-pressed': 'var(--shadow-pressed)',
        aqua: '0 10px 24px rgba(0,0,0,.18)',
        'aqua-inner': 'inset 0 1px 0 rgba(255,255,255,.9), inset 0 -1px 0 rgba(0,0,0,.08)',
      },
      backgroundImage: {
        'gradient-surface': 'var(--gradient-surface)',
        'gradient-gold': 'var(--gradient-gold)',
        aquaGloss: 'linear-gradient(180deg,#dff1ff 0%,#8fc6ff 45%,#2a76ff 100%)',
        plateGloss: 'linear-gradient(180deg,rgba(255,255,255,.08),rgba(0,0,0,.14))',
        pinstripe: 'repeating-linear-gradient(0deg,rgba(255,255,255,.06) 0,rgba(255,255,255,.06) 1px,transparent 1px,transparent 4px)',
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
