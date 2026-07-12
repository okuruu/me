import type { Config } from 'tailwindcss';
import daisyui from 'daisyui';

export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			fontFamily: {
				display: ['"Space Grotesk"', 'sans-serif'],
				body: ['"DM Sans"', 'sans-serif']
			}
		}
	},
	plugins: [daisyui],
	daisyui: {
		themes: [
			{
				portfolio: {
					primary: '#3D2920',
					'primary-content': '#F9F5F1',
					secondary: '#E9DFD5',
					'secondary-content': '#5A4238',
					accent: '#D8704A',
					'accent-content': '#ffffff',
					neutral: '#3D2920',
					'base-100': '#F9F5F1',
					'base-200': '#F5EFE8',
					'base-300': '#E9DFD5',
					'base-content': '#3D2920',
					'--rounded-box': '0.5rem',
					'--rounded-btn': '0.5rem',
					'--rounded-badge': '9999px'
				}
			},
			{
				'portfolio-dark': {
					primary: '#E9DFD5',
					'primary-content': '#3D2920',
					secondary: '#2D2720',
					'secondary-content': '#E9DFD5',
					accent: '#D8704A',
					'accent-content': '#ffffff',
					neutral: '#1A1714',
					'base-100': '#1A1714',
					'base-200': '#211E1A',
					'base-300': '#2D2720',
					'base-content': '#F5EDE0',
					'--rounded-box': '0.5rem',
					'--rounded-btn': '0.5rem',
					'--rounded-badge': '9999px'
				}
			},
			{
				ud84: {
					primary: '#009ef7', 'primary-content': '#ffffff',
					secondary: '#7239ea', 'secondary-content': '#ffffff',
					accent: '#009ef7', 'accent-content': '#ffffff',
					neutral: '#181c32', 'neutral-content': '#ffffff',
					'base-100': '#ffffff',
					'base-200': '#f5f8fa',
					'base-300': '#eff2f5',
					'base-content': '#181c32',
					info: '#7239ea', 'info-content': '#ffffff',
					success: '#15803d', 'success-content': '#ffffff',
					warning: '#a16207', 'warning-content': '#ffffff',
					error: '#f1416c', 'error-content': '#ffffff',
					'--rounded-box': '0.625rem',
					'--rounded-btn': '0.475rem',
					'--rounded-badge': '0.475rem'
				}
			}
		],
		darkTheme: 'portfolio-dark',
		base: true,
		styled: true,
		utils: true,
		logs: false
	}
} satisfies Config;
