/* eslint-disable-next-line global-require */

module.exports = {
  future: {
    removeDeprecatedGapUtilities: true,
    purgeLayersByDefault: true,
  },
  theme: {
    extend: {
      colors: {
        theme: {
          orange: '#933a16',
          bodyBg: '#26303d',
          gelsWhite: '#e1dede',
          gelsBlue: '#7285a5',
        },
      },
    },
  },
  purge: [
    './**/*.{js,jsx}',
  ],
  variants: {},
  plugins: [
    require('@tailwindcss/custom-forms'),
    require('tailwind-scrollbar'),
  ],
};
