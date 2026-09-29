/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './index.html',
        './work/**/*.html',
        './projects/**/*.html',
        './articles/**/*.html',
        './js/**/*.js',
    ],
    safelist: [
        { pattern: /bg-(indigo|violet|cyan|green|blue|red|amber|slate|purple|orange|yellow|pink|teal|emerald)-(50|100|200)/ },
        { pattern: /text-(indigo|violet|cyan|green|blue|red|amber|slate|purple|orange|yellow|pink|teal|emerald)-(600|700|800)/ },
        { pattern: /border-(indigo|violet|cyan|green|blue|red|amber|slate|purple|orange|yellow|pink|teal|emerald)-(100|200)/ },
    ],
    theme: {
        extend: {
            fontFamily: {
                sans:  ['Inter', 'sans-serif'],
                serif: ['Lora', 'Georgia', 'serif'],
                display: ['DM Serif Display', 'serif'],
            },
        },
    },
    plugins: [],
};
