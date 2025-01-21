module.exports = {
  content: ['./public/**/*.{html,js}'], // Adjust to match your file paths
  theme: {
    extend: {},
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: ["light", "dark", "cupcake"], // Add your preferred themes
  },
};