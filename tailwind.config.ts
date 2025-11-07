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
			padding: '1rem',
			screens: {
				'xs': '475px',
				'sm': '640px',
				'md': '768px',
				'lg': '1024px',
				'xl': '1280px',
				'2xl': '1400px'
			}
		},
		screens: {
			'xs': '475px',
			'sm': '640px',
			'md': '768px',
			'lg': '1024px',
			'xl': '1280px',
			'2xl': '1536px',
		},
		extend: {
			fontFamily: {
				sans: ['Inter', 'system-ui', 'sans-serif'],
				serif: ['Crimson Pro', 'EB Garamond', 'serif'],
        display: ['Playfair Display', 'serif'],
        cursive: ['Dancing Script', 'cursive'],
        medieval: ['Cormorant Garamond', 'serif'],
        luxury: ['Playfair Display', 'serif'],
        nature: ['Crimson Pro', 'serif'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
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
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				forest: {
					50: 'hsl(150, 40%, 95%)',
					100: 'hsl(150, 45%, 88%)',
					200: 'hsl(150, 50%, 75%)',
					300: 'hsl(150, 55%, 60%)',
					400: 'hsl(150, 60%, 45%)',
					500: 'hsl(150, 65%, 35%)',
					600: 'hsl(150, 70%, 25%)',
					700: 'hsl(150, 75%, 18%)',
					800: 'hsl(150, 80%, 12%)',
					900: 'hsl(150, 85%, 8%)',
				},
				wood: {
					50: 'hsl(30, 60%, 95%)',
					100: 'hsl(30, 55%, 88%)',
					200: 'hsl(30, 50%, 80%)',
					300: 'hsl(30, 45%, 70%)',
					400: 'hsl(30, 40%, 58%)',
					500: 'hsl(30, 35%, 45%)',
					600: 'hsl(30, 30%, 35%)',
					700: 'hsl(30, 28%, 25%)',
					800: 'hsl(30, 25%, 18%)',
					900: 'hsl(30, 22%, 12%)',
				},
        stone: {
					50: 'hsl(25, 20%, 95%)',
					100: 'hsl(25, 18%, 88%)',
					200: 'hsl(25, 15%, 80%)',
					300: 'hsl(25, 12%, 70%)',
					400: 'hsl(25, 10%, 58%)',
					500: 'hsl(25, 8%, 45%)',
					600: 'hsl(25, 6%, 35%)',
					700: 'hsl(25, 5%, 25%)',
					800: 'hsl(25, 4%, 18%)',
					900: 'hsl(25, 3%, 12%)',
				},
        gold: {
          50: 'hsl(45, 90%, 95%)',
          100: 'hsl(45, 85%, 88%)',
          200: 'hsl(45, 80%, 78%)',
          300: 'hsl(45, 75%, 68%)',
          400: 'hsl(45, 70%, 58%)',
          500: 'hsl(45, 65%, 48%)',
          600: 'hsl(45, 60%, 38%)',
          700: 'hsl(45, 55%, 28%)',
          800: 'hsl(45, 50%, 20%)',
          900: 'hsl(45, 45%, 15%)',
        }
			},
			spacing: {
				'safe-top': 'env(safe-area-inset-top)',
				'safe-bottom': 'env(safe-area-inset-bottom)',
				'safe-left': 'env(safe-area-inset-left)',
				'safe-right': 'env(safe-area-inset-right)',
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
        'fade-in-down': {
          '0%': {
            opacity: '0',
            transform: 'translateY(-20px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)'
          },
        },
        'fade-in': {
          '0%': {
            opacity: '0',
          },
          '100%': {
            opacity: '1',
          },
        },
        sway: {
          '0%, 100%': { transform: 'rotate(-2deg) translateX(-4%)' },
          '50%': { transform: 'rotate(2deg) translateX(4%)' },
        },
        'gentle-float': {
          '0%, 100%': {
            transform: 'translateY(0px) rotate(0deg)'
          },
          '50%': {
            transform: 'translateY(-10px) rotate(1deg)'
          },
        },
        'leaf-dance': {
          '0%, 100%': {
            transform: 'translateY(0px) rotate(0deg)'
          },
          '33%': {
            transform: 'translateY(-8px) rotate(2deg)'
          },
          '66%': {
            transform: 'translateY(-4px) rotate(-1deg)'
          },
        },
        'golden-shimmer': {
          '0%': {
            transform: 'translateX(-100%)'
          },
          '100%': {
            transform: 'translateX(100%)'
          },
        },
        'nature-breathe': {
          '0%, 100%': {
            transform: 'scale(1)'
          },
          '50%': {
            transform: 'scale(1.02)'
          },
        },
        'vine-grow': {
          '0%': {
            transform: 'scaleY(0)',
            transformOrigin: 'bottom'
          },
          '100%': {
            transform: 'scaleY(1)',
            transformOrigin: 'bottom'
          },
        },
        'pulse-neon': {
          '0%, 100%': { 
            opacity: '1',
            boxShadow: '0 0 30px rgba(6,182,212,0.5)'
          },
          '50%': { 
            opacity: '0.8',
            boxShadow: '0 0 50px rgba(6,182,212,0.7)'
          }
        },
        'dust-settle': {
          '0%': { 
            opacity: '0.3',
            transform: 'translateY(-5px)'
          },
          '100%': { 
            opacity: '0',
            transform: 'translateY(5px)'
          }
        },
        'shadow-move': {
          '0%, 100%': { 
            boxShadow: '10px 10px 30px rgba(30,30,30,0.6)'
          },
          '50%': { 
            boxShadow: '-10px -10px 30px rgba(30,30,30,0.6)'
          }
        },
        'sinister-pulse': {
          '0%, 100%': { 
            boxShadow: '0 0 20px rgba(127,29,29,0.3)'
          },
          '50%': { 
            boxShadow: '0 0 40px rgba(127,29,29,0.6)'
          }
        },
        'map-wave': {
          '0%, 100%': { 
            transform: 'perspective(500px) rotateX(0deg)'
          },
          '50%': { 
            transform: 'perspective(500px) rotateX(2deg)'
          }
        },
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in-down': 'fade-in-down 0.8s ease-out',
        'fade-in': 'fade-in 1s ease-out',
        'sway': 'sway 18s ease-in-out infinite alternate',
        'mystical-pulse': 'mystical-pulse 2s ease-in-out infinite',
        'gentle-float': 'gentle-float 4s ease-in-out infinite',
        'leaf-dance': 'leaf-dance 6s ease-in-out infinite',
        'golden-shimmer': 'golden-shimmer 3s ease-in-out infinite',
        'nature-breathe': 'nature-breathe 5s ease-in-out infinite',
        'vine-grow': 'vine-grow 1s ease-out forwards',
			},
			perspective: {
				'1000': '1000px',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
