/**
 * Tailwind config — MyTODO design tokens.
 * Encodes the approved design system: 靛蓝主色 #4f46e5, spacing scale,
 * radii (sm/md/lg), type scale (xs–xl) and semantic colors.
 * All feature components MUST reference these tokens rather than ad-hoc values.
 */
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand — 靛蓝
        brand: {
          DEFAULT: '#4f46e5',
          fg: '#ffffff',
          hover: '#4338ca',
          soft: '#eef2ff',
        },
        // Semantic
        success: '#059669',
        warning: '#d97706',
        danger: '#e11d48',
      },
      // Spacing tokens: 4 / 8 / 12 / 16 / 24 / 32 (rem-based scale = Tailwind default 1..8)
      spacing: {
        token1: '4px',
        token2: '8px',
        token3: '12px',
        token4: '16px',
        token6: '24px',
        token8: '32px',
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '16px',
      },
      fontSize: {
        xs: ['12px', { lineHeight: '16px' }],
        sm: ['14px', { lineHeight: '20px' }],
        base: ['16px', { lineHeight: '24px' }],
        lg: ['18px', { lineHeight: '28px' }],
        xl: ['24px', { lineHeight: '32px' }],
      },
      boxShadow: {
        card: '0 1px 2px rgba(15, 23, 42, 0.06), 0 1px 3px rgba(15, 23, 42, 0.08)',
      },
    },
  },
  plugins: [],
};
