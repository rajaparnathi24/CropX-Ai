/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    darkMode: 'class',
    theme: {
        container: {
            center: true,
            padding: '1rem',
        },
        extend: {
            colors: {
                background: 'var(--background)',
                foreground: 'var(--foreground)',
                primary: {
                    DEFAULT: 'var(--primary)',
                    foreground: 'var(--primary-foreground)',
                    light: 'var(--primary-light)',
                    container: 'var(--primary-container)',
                    dark: 'var(--primary-dark)',
                },
                secondary: {
                    DEFAULT: 'var(--secondary)',
                    foreground: 'var(--secondary-foreground)',
                },
                accent: {
                    DEFAULT: 'var(--accent)',
                    foreground: 'var(--accent-foreground)',
                },
                muted: {
                    DEFAULT: 'var(--muted)',
                    foreground: 'var(--muted-foreground)',
                },
                card: {
                    DEFAULT: 'var(--card)',
                    foreground: 'var(--card-foreground)',
                },
                border: 'var(--border)',
                input: 'var(--input)',
                ring: 'var(--ring)',
                severity: {
                    low: 'var(--severity-low)',
                    'low-bg': 'var(--severity-low-bg)',
                    medium: 'var(--severity-medium)',
                    'medium-bg': 'var(--severity-medium-bg)',
                    high: 'var(--severity-high)',
                    'high-bg': 'var(--severity-high-bg)',
                    critical: 'var(--severity-critical)',
                    'critical-bg': 'var(--severity-critical-bg)',
                },
            },
            borderRadius: {
                DEFAULT: 'var(--radius)',
                xl: 'calc(var(--radius) + 4px)',
                '2xl': 'calc(var(--radius) + 8px)',
                '3xl': 'calc(var(--radius) + 16px)',
                full: '9999px',
            },
            fontFamily: {
                sans: ['var(--font-dm-sans)', 'DM Sans', 'sans-serif'],
                mono: ['IBM Plex Mono', 'monospace'],
            },
            animation: {
                'fade-in-up': 'fadeInUp 0.4s ease-out forwards',
                'scan-pulse': 'scanPulse 2s ease-in-out infinite',
                'spin-slow': 'spin 3s linear infinite',
            },
        },
    },
    plugins: [require('@tailwindcss/typography')],
};