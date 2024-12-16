/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./*.html",       // Busca clases en todos los HTML en la raíz
    "./*.js",         // Busca clases en los archivos JavaScript
  ],
  theme: {
    extend: {},
  },
  plugins: [require('@tailwindcss/line-clamp')],
};
