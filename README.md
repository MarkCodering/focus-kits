# Focus Kits

A modern Next.js template with shadcn/ui components for building beautiful applications.

## Features

- ⚡ **Next.js 15** with App Router
- 🎨 **Tailwind CSS v4** for styling
- 🧩 **shadcn/ui** components pre-configured
- 📱 **TypeScript** for type safety
- 🎯 **ESLint** for code quality
- 🚀 **Turbopack** for fast development builds

## Getting Started

First, install the dependencies:

```bash
npm install
# or
yarn install
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `src/app/page.tsx`. The page auto-updates as you edit the file.

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles with shadcn/ui variables
│   ├── layout.tsx         # Root layout
│   └── page.tsx          # Home page
├── components/
│   └── ui/               # shadcn/ui components
│       └── button.tsx    # Button component
└── lib/
    └── utils.ts          # Utility functions

components.json           # shadcn/ui configuration
```

## Adding More Components

To add more shadcn/ui components, you can manually create them in the `src/components/ui/` directory following the shadcn/ui patterns, or use the shadcn CLI if network connectivity allows:

```bash
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add input
```

## Styling

This project uses Tailwind CSS v4 with CSS variables for theming. The color scheme and component styling follow the shadcn/ui design system with support for light and dark modes.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [shadcn/ui Documentation](https://ui.shadcn.com) - learn about shadcn/ui components.
- [Tailwind CSS Documentation](https://tailwindcss.com/docs) - learn about Tailwind CSS.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
