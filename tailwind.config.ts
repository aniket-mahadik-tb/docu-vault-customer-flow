
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: '#1361a2', // Updated Bharti AXA primary blue
					light: '#3073b4',
					dark: '#0e4c7d',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: '#ED1C24', // Bharti AXA red accent
					light: '#FF3D44',
					dark: '#C81018',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				accent: {
					DEFAULT: '#FF8200', // Bharti AXA orange accent
					light: '#FFA033',
					dark: '#E67400',
					foreground: 'hsl(var(--accent-foreground))'
				},
				destructive: {
					DEFAULT: '#E60000', // Bharti AXA error red
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))', // White background for sidebar
					foreground: 'hsl(var(--sidebar-foreground))', // Dark text for sidebar
					primary: 'hsl(var(--sidebar-primary))', // Blue for active items
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))', // White text for active items
					accent: 'hsl(var(--sidebar-accent))', // Light gray hover state
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))', // Dark text for hover state
					border: 'hsl(var(--sidebar-border))', // Light border
					ring: 'hsl(var(--sidebar-ring))' // Blue ring
				},
				bharti: {
					blue: '#1361a2', // Updated Bharti AXA primary blue
					blueLight: '#3073b4', // Updated light blue variant
					blueDark: '#0e4c7d', // Updated dark blue variant
					red: '#ED1C24',
					redLight: '#FF3D44',
					redDark: '#C81018',
					orange: '#FF8200',
					orangeLight: '#FFA033',
					orangeDark: '#E67400',
					success: '#008A00',
					warning: '#FFB400',
					error: '#E60000',
					info: '#0078D7',
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'fade-in': {
					'0%': {
						opacity: '0',
						transform: 'translateY(10px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
