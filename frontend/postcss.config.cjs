const tailwindcss = require('tailwindcss');
module.exports = {
  plugins: [
    require('@tailwindcss/postcss')({
      tailwindcss: tailwindcss,
    }),
    require('autoprefixer'),
  ],
};