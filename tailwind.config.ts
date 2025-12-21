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
        // === RARITY ANIMATIONS ===
        'reveal-common': {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        },
        'reveal-rare': {
          '0%': { transform: 'scale(0.5) rotateY(180deg)', opacity: '0' },
          '60%': { transform: 'scale(1.05) rotateY(0deg)', opacity: '1' },
          '100%': { transform: 'scale(1) rotateY(0deg)', opacity: '1' }
        },
        'reveal-epic': {
          '0%': { transform: 'scale(0) rotate(-45deg)', opacity: '0', filter: 'blur(10px)' },
          '50%': { transform: 'scale(1.15) rotate(5deg)', opacity: '1', filter: 'blur(0)' },
          '70%': { transform: 'scale(0.95) rotate(-2deg)' },
          '100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' }
        },
        'reveal-legendary': {
          '0%': { transform: 'scale(0) rotate(720deg)', opacity: '0', filter: 'brightness(5) blur(20px)' },
          '30%': { transform: 'scale(1.3) rotate(0deg)', opacity: '1', filter: 'brightness(2) blur(0)' },
          '50%': { transform: 'scale(0.9)', filter: 'brightness(1)' },
          '70%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        },
        'epic-ring': {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.6' },
          '50%': { transform: 'scale(1.2)', opacity: '0.2' }
        },
        'legendary-sparkle': {
          '0%, 100%': { opacity: '0', transform: 'scale(0)' },
          '50%': { opacity: '1', transform: 'scale(1)' }
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        },
        'flash-out': {
          '0%': { opacity: '0.8' },
          '100%': { opacity: '0' }
        },
        'shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-4px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(4px)' }
        },
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' }
        },
        'pulse-slow': {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' }
        },
        'particle-explode': {
          '0%': { 
            transform: 'translate(-50%, -50%) scale(1)',
            opacity: '1'
          },
          '100%': { 
            transform: 'translate(calc(-50% + var(--particle-x)), calc(-50% + var(--particle-y))) scale(0)',
            opacity: '0'
          }
        },
        'glow': {
          '0%, 100%': { 
            boxShadow: '0 0 20px rgba(251,191,36,0.5), 0 0 40px rgba(251,191,36,0.3)'
          },
          '50%': { 
            boxShadow: '0 0 40px rgba(251,191,36,0.8), 0 0 80px rgba(251,191,36,0.5)'
          }
			},
				// === CHALLENGE ANIMATIONS ===
				'challenge-badge-appear': {
					'0%': { transform: 'scale(0) rotate(-180deg)', opacity: '0' },
					'60%': { transform: 'scale(1.2) rotate(10deg)', opacity: '1' },
					'100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' }
				},
				'challenge-trophy-pop': {
					'0%': { transform: 'scale(0)', opacity: '0' },
					'60%': { transform: 'scale(1.3)', opacity: '1' },
					'100%': { transform: 'scale(1)', opacity: '1' }
				},
				'challenge-text-slide': {
					'0%': { transform: 'translateY(30px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' }
				},
				'challenge-button-appear': {
					'0%': { transform: 'scale(0.8)', opacity: '0' },
					'100%': { transform: 'scale(1)', opacity: '1' }
				},
				'challenge-sparkle': {
					'0%, 100%': { opacity: '0', transform: 'scale(0)' },
					'50%': { opacity: '1', transform: 'scale(1)' }
				},
				// === SKILL ANIMATIONS ===
				'skill-flash': {
					'0%': { opacity: '0.8' },
					'100%': { opacity: '0' }
				},
				'skill-ring': {
					'0%': { transform: 'scale(0.5)', opacity: '1' },
					'100%': { transform: 'scale(2)', opacity: '0' }
				},
				'skill-icon-appear': {
					'0%': { transform: 'scale(0) rotate(-90deg)', opacity: '0' },
					'60%': { transform: 'scale(1.15) rotate(5deg)', opacity: '1' },
					'100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' }
				},
				'skill-text-appear': {
					'0%': { transform: 'translateY(20px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' }
				},
				'skill-button-appear': {
					'0%': { transform: 'translateY(20px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' }
				},
				// === OATH ANIMATIONS ===
				'oath-scroll-unroll': {
					'0%': { maxHeight: '0', opacity: '0', transform: 'scaleY(0)' },
					'100%': { maxHeight: '400px', opacity: '1', transform: 'scaleY(1)' }
				},
				'oath-seal-stamp': {
					'0%': { transform: 'translateX(-50%) scale(3) rotate(-45deg)', opacity: '0' },
					'60%': { transform: 'translateX(-50%) scale(0.9) rotate(5deg)', opacity: '1' },
					'100%': { transform: 'translateX(-50%) scale(1) rotate(0deg)', opacity: '1' }
				},
				'oath-text-appear': {
					'0%': { transform: 'translateY(20px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' }
				},
				'oath-button-appear': {
					'0%': { transform: 'scale(0.8)', opacity: '0' },
					'100%': { transform: 'scale(1)', opacity: '1' }
				},
				'oath-flame': {
					'0%, 100%': { transform: 'scaleY(1) scaleX(1)', opacity: '0.6' },
					'50%': { transform: 'scaleY(1.2) scaleX(0.9)', opacity: '0.8' }
				},
				'oath-victory-appear': {
					'0%': { transform: 'scale(0) rotate(-180deg)', opacity: '0' },
					'60%': { transform: 'scale(1.2) rotate(10deg)', opacity: '1' },
					'100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' }
				},
				'oath-coin-rain': {
					'0%': { transform: 'translateY(-100vh) rotate(0deg)', opacity: '1' },
					'100%': { transform: 'translateY(100vh) rotate(720deg)', opacity: '0' }
				},
				'oath-text-slide': {
					'0%': { transform: 'translateY(30px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' }
				},
				'oath-defeat-shake': {
					'0%, 100%': { transform: 'translateX(0)' },
					'10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-8px)' },
					'20%, 40%, 60%, 80%': { transform: 'translateX(8px)' }
				},
				'oath-ash-fall': {
					'0%': { transform: 'translateY(-20px) rotate(0deg)', opacity: '0.8' },
					'100%': { transform: 'translateY(100vh) rotate(360deg)', opacity: '0' }
				},
				'oath-defeat-appear': {
					'0%': { transform: 'scale(0.5)', opacity: '0' },
					'100%': { transform: 'scale(1)', opacity: '1' }
				},
				'oath-defeat-text': {
					'0%': { transform: 'translateY(20px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' }
				},
				'oath-crack': {
					'0%': { transform: 'rotate(45deg) scaleX(0)', opacity: '0' },
					'100%': { transform: 'rotate(45deg) scaleX(1)', opacity: '1' }
				},
				// === GUILD ANIMATIONS ===
				'guild-welcome-appear': {
					'0%': { transform: 'translateY(30px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' }
				},
				'guild-button-appear': {
					'0%': { transform: 'scale(0.8)', opacity: '0' },
					'100%': { transform: 'scale(1)', opacity: '1' }
				},
				'guild-ray': {
					'0%': { opacity: '0' },
					'50%': { opacity: '0.4' },
					'100%': { opacity: '0' }
				},
				'guild-banner-wave': {
					'0%, 100%': { transform: 'translateX(-50%) translateY(-8px) rotate(-2deg)' },
					'50%': { transform: 'translateX(-50%) translateY(-8px) rotate(2deg)' }
				},
				'guild-crown-appear': {
					'0%': { transform: 'translateX(-50%) translateY(-20px) scale(0)', opacity: '0' },
					'60%': { transform: 'translateX(-50%) scale(1.3)', opacity: '1' },
					'100%': { transform: 'translateX(-50%) scale(1)', opacity: '1' }
				},
				'guild-creation-text': {
					'0%': { transform: 'translateY(30px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' }
				},
				// === COLLECTION ANIMATIONS ===
				'collection-orbit': {
					'0%': { transform: 'rotate(0deg)' },
					'100%': { transform: 'rotate(360deg)' }
				},
				'collection-ring': {
					'0%': { transform: 'scale(0.8)', opacity: '0.8' },
					'50%': { transform: 'scale(1.2)', opacity: '0.3' },
					'100%': { transform: 'scale(0.8)', opacity: '0.8' }
				},
				'collection-icon-appear': {
					'0%': { transform: 'scale(0) rotate(-180deg)', opacity: '0' },
					'60%': { transform: 'scale(1.15) rotate(10deg)', opacity: '1' },
					'100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' }
				},
				'collection-sparkle': {
					'0%, 100%': { opacity: '0', transform: 'scale(0)' },
					'50%': { opacity: '1', transform: 'scale(1)' }
				},
				'collection-text-appear': {
					'0%': { transform: 'translateY(30px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' }
				},
				'collection-button-appear': {
					'0%': { transform: 'scale(0.8)', opacity: '0' },
					'100%': { transform: 'scale(1)', opacity: '1' }
				},
				// === CHAPTER COMPLETION ANIMATIONS ===
				'chapter-glow': {
					'0%, 100%': { opacity: '0.3', transform: 'scale(1)' },
					'50%': { opacity: '0.6', transform: 'scale(1.1)' }
				},
				'chapter-glow-inner': {
					'0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
					'50%': { opacity: '0.8', transform: 'scale(1.05)' }
				},
				'chapter-spin-in': {
					'0%': { transform: 'scale(0) rotate(-180deg)', opacity: '0' },
					'60%': { transform: 'scale(1.1) rotate(10deg)', opacity: '1' },
					'100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' }
				},
				'chapter-text-bounce': {
					'0%': { transform: 'translateY(30px)', opacity: '0' },
					'60%': { transform: 'translateY(-5px)', opacity: '1' },
					'100%': { transform: 'translateY(0)', opacity: '1' }
				},
				'chapter-button-appear': {
					'0%': { transform: 'scale(0.8)', opacity: '0' },
					'100%': { transform: 'scale(1)', opacity: '1' }
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
        // Rarity animations
        'reveal-common': 'reveal-common 0.3s ease-out forwards',
        'reveal-rare': 'reveal-rare 0.6s ease-out forwards',
        'reveal-epic': 'reveal-epic 0.8s ease-out forwards',
        'reveal-legendary': 'reveal-legendary 1.2s ease-out forwards',
        'epic-ring': 'epic-ring 1.5s ease-in-out infinite',
        'legendary-sparkle': 'legendary-sparkle 1s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'flash-out': 'flash-out 0.3s ease-out forwards',
        'shake': 'shake 0.5s ease-in-out',
        'spin-slow': 'spin-slow 8s linear infinite',
        'pulse-slow': 'pulse-slow 3s ease-in-out infinite',
				'glow': 'glow 2s ease-in-out infinite',
				// Challenge
				'challenge-badge-appear': 'challenge-badge-appear 0.8s ease-out forwards',
				'challenge-trophy-pop': 'challenge-trophy-pop 0.5s ease-out 0.3s forwards',
				'challenge-text-slide': 'challenge-text-slide 0.6s ease-out 0.5s forwards',
				'challenge-button-appear': 'challenge-button-appear 0.4s ease-out 0.8s forwards',
				'challenge-sparkle-1': 'challenge-sparkle 2s ease-in-out infinite',
				'challenge-sparkle-2': 'challenge-sparkle 2s ease-in-out 0.3s infinite',
				'challenge-sparkle-3': 'challenge-sparkle 2s ease-in-out 0.6s infinite',
				// Skill
				'skill-flash': 'skill-flash 0.3s ease-out forwards',
				'skill-ring-1': 'skill-ring 1s ease-out forwards',
				'skill-ring-2': 'skill-ring 1s ease-out 0.1s forwards',
				'skill-ring-3': 'skill-ring 1s ease-out 0.2s forwards',
				'skill-icon-appear': 'skill-icon-appear 0.6s ease-out forwards',
				'skill-text-appear': 'skill-text-appear 0.5s ease-out 0.3s forwards',
				'skill-button-appear': 'skill-button-appear 0.4s ease-out 0.5s forwards',
				// Oath
				'oath-scroll-unroll': 'oath-scroll-unroll 0.8s ease-out forwards',
				'oath-seal-stamp': 'oath-seal-stamp 0.6s ease-out forwards',
				'oath-text-appear': 'oath-text-appear 0.5s ease-out 0.3s forwards',
				'oath-button-appear': 'oath-button-appear 0.4s ease-out 0.5s forwards',
				'oath-flame-1': 'oath-flame 2s ease-in-out infinite',
				'oath-flame-2': 'oath-flame 2s ease-in-out 0.5s infinite',
				'oath-victory-appear': 'oath-victory-appear 0.8s ease-out forwards',
				'oath-coin-rain': 'oath-coin-rain 2s linear forwards',
				'oath-text-slide': 'oath-text-slide 0.6s ease-out 0.4s forwards',
				'oath-defeat-shake': 'oath-defeat-shake 0.6s ease-in-out',
				'oath-ash-fall': 'oath-ash-fall 3s linear forwards',
				'oath-defeat-appear': 'oath-defeat-appear 0.5s ease-out forwards',
				'oath-defeat-text': 'oath-defeat-text 0.5s ease-out 0.3s forwards',
				'oath-crack': 'oath-crack 0.4s ease-out 0.2s forwards',
				// Guild
				'guild-welcome-appear': 'guild-welcome-appear 0.6s ease-out forwards',
				'guild-button-appear': 'guild-button-appear 0.4s ease-out 0.3s forwards',
				'guild-ray': 'guild-ray 3s ease-in-out infinite',
				'guild-banner-wave': 'guild-banner-wave 3s ease-in-out infinite',
				'guild-crown-appear': 'guild-crown-appear 0.6s ease-out forwards',
				'guild-creation-text': 'guild-creation-text 0.6s ease-out 0.3s forwards',
				// Collection
				'collection-orbit': 'collection-orbit 4s linear infinite',
				'collection-ring-1': 'collection-ring 2s ease-in-out infinite',
				'collection-ring-2': 'collection-ring 2s ease-in-out 0.3s infinite',
				'collection-ring-3': 'collection-ring 2s ease-in-out 0.6s infinite',
				'collection-icon-appear': 'collection-icon-appear 0.8s ease-out forwards',
				'collection-sparkle': 'collection-sparkle 1.5s ease-in-out infinite',
				'collection-text-appear': 'collection-text-appear 0.6s ease-out 0.4s forwards',
				'collection-button-appear': 'collection-button-appear 0.4s ease-out 0.6s forwards',
				// Chapter
				'chapter-glow': 'chapter-glow 2s ease-in-out infinite',
				'chapter-glow-inner': 'chapter-glow-inner 2s ease-in-out 0.5s infinite',
				'chapter-spin-in': 'chapter-spin-in 0.8s ease-out forwards',
				'chapter-text-bounce': 'chapter-text-bounce 0.7s ease-out 0.3s forwards',
				'chapter-button-appear': 'chapter-button-appear 0.4s ease-out 0.6s forwards',
			},
			perspective: {
				'1000': '1000px',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
