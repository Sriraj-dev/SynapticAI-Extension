/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: "jit",
  darkMode: "class",
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/popup/**/*.{js,ts,jsx,tsx}",
    "./src/contents/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    text:{
      DEFAULT: "var(--text-primary)"
    },
    extend: {
      spacing: {
        'btn': '32px',      // or use '2rem'
        'icon': '16px',     // icon size
        xxs: 8,
        xs: 12,
        sm: 14,
        base: 16,
        lg: 18,
        xl: 20,
        "2xl": 24,
        "3xl": 30,
        chatbotdp: '33px',
        chatbot: '140px'
      },
      fontSize: {
        xs: 12,
        sm: 14,
        base: 16,
        lg: 18,
        xl: 20,
        "2xl": 24,
        "3xl": 30
      },
      fontFamily: {
        sans: ['K2D', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",

        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
          dimmed: "var(--primary-dimmed)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },

        chat:{
          message: "var(--chat-message)",
        },
        alternate:{
          primary: "var(--alternate-primary)",
          secondary: "var(--alternate-secondary)",
        },
        code:{
          block: "var(--code-block)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "var(--muted-foreground)",
        },

        percentage: {
          filler : "var(--percentage-filler)",
        },
        shimmer : "var(--shimmer)",

        text:{
          DEFAULT: "var(--text-primary)",
          primary : "var(--text-primary)",
          secondary : "var(--text-secondary)",
          tertiary : "var(--text-tertiary)",
          editor : "var(--text-editor)",
          link : "var(--text-link)",
        },

        lp:{
          background: "var(--lp-background)",
          primary: "var(--lp-primary)",
          secondary: "var(--lp-secondary)",
          text: {
            primary: "var(--lp-text-primary)",
            secondary: "var(--lp-text-secondary)",
          },
        },

        background: "var(--primary)",
        foreground: "var(--primary-foreground)",

        // destructive: {
        //   DEFAULT: "hsl(var(--destructive))",
        //   foreground: "hsl(var(--destructive-foreground))",
        // },
        
        // accent: {
        //   DEFAULT: "hsl(var(--accent))",
        //   foreground: "hsl(var(--accent-foreground))",
        // },
        // popover: {
        //   DEFAULT: "hsl(var(--popover))",
        //   foreground: "hsl(var(--popover-foreground))",
        // },
        // card: {
        //   DEFAULT: "hsl(var(--card))",
        //   foreground: "hsl(var(--card-foreground))",
        // },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
    corePlugins: {
      preflight: true
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/typography"),
  ],
}