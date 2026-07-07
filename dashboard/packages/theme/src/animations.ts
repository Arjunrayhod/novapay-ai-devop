export const animations = {
  duration: {
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
    slower: '500ms',
  },
  easing: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',
    linear: 'linear',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
  keyframes: {
    fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
    fadeOut: { from: { opacity: '1' }, to: { opacity: '0' } },
    slideIn: { from: { transform: 'translateY(4px)', opacity: '0' }, to: { transform: 'translateY(0)', opacity: '1' } },
    slideOut: { from: { transform: 'translateY(0)', opacity: '1' }, to: { transform: 'translateY(4px)', opacity: '0' } },
    scaleIn: { from: { transform: 'scale(0.95)', opacity: '0' }, to: { transform: 'scale(1)', opacity: '1' } },
    pulse: { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0.5' } },
    spin: { from: { transform: 'rotate(0deg)' }, to: { transform: 'rotate(360deg)' } },
  },
} as const;
