/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html', // (루트에 index.html이 있으면 포함)
    './src/**/*.{js,jsx,ts,tsx}', // src 폴더 내부의 모든 JS/TS/JSX/TSX 파일 포함
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
