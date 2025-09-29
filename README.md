# Contact Form App

This is a Next.js application that provides a contact form with the following fields:
- Name (text, required)
- Serial Number (text, required)
- State (text, required)
- Picture 1 (image file, required)
- Picture 2 (image file, required)
- Picture 3 (image file, required)

The form submits data to the API endpoint `http://press.fayadev.net/api/contact/new-message/19` using the field IDs as keys.

## Getting Started

First, install dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the form.

## Features

- Client-side form validation
- File upload for images
- Submission to external API
- Responsive design with Tailwind CSS
- TypeScript support

## Technologies Used

- Next.js 15
- React
- TypeScript
- Tailwind CSS
- ESLint
