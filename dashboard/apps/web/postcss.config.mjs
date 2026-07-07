export default {
  plugins: {
    'postcss-import': {
      filter: (url) => url !== 'tailwindcss',
    },
    '@tailwindcss/postcss': {},
  },
};
