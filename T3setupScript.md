# T3 Stack Setup Documentation

This document outlines the setup and configuration of the T3 stack application for the Last Straw Farms market research project.

## What is the T3 Stack?

The T3 Stack is a web development stack created by [create-t3-app](https://create.t3.gg/) that focuses on type safety, developer experience, and modern best practices. It includes:

- [Next.js](https://nextjs.org/) - React framework for building web applications
- [TypeScript](https://www.typescriptlang.org/) - Typed JavaScript for better developer experience
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Prisma](https://www.prisma.io/) - Type-safe ORM for database access

## Installation

The application was created using the following command:

```bash
npm create t3-app@latest .
```

### Configuration Choices

During the installation process, the following options were selected:

1. **Language**: TypeScript
2. **Styling**: Tailwind CSS
3. **tRPC**: No (not included)
4. **Authentication**: None (no authentication provider)
5. **Database ORM**: Prisma
6. **Next.js Mode**: App Router
7. **Database Provider**: SQLite (LibSQL)
8. **Import Alias**: @

## Project Structure

The T3 stack creates a standard Next.js App Router project structure with additional configuration for Prisma and Tailwind CSS:

```
LastStraw/
├── .eslintrc.cjs        # ESLint configuration
├── .gitignore           # Git ignore file
├── next.config.mjs      # Next.js configuration
├── package.json         # Project dependencies
├── postcss.config.cjs   # PostCSS configuration
├── prisma/              # Prisma ORM files
│   └── schema.prisma    # Database schema
├── public/              # Static assets
├── src/                 # Source code
│   ├── app/             # Next.js App Router pages
│   │   ├── layout.tsx   # Root layout
│   │   └── page.tsx     # Home page
│   ├── components/      # React components
│   ├── lib/             # Utility functions
│   └── styles/          # Global styles
├── tailwind.config.ts   # Tailwind CSS configuration
└── tsconfig.json        # TypeScript configuration
```

## Database Setup

The project uses Prisma with SQLite as the database provider. The database schema is defined in `prisma/schema.prisma`.

To initialize the database:

```bash
npm run db:push
```

This command creates the database tables based on the Prisma schema.

## Development

To start the development server:

```bash
npm run dev
```

This will start the Next.js development server at http://localhost:3000.

## Deployment

For production deployment:

```bash
npm run build
npm start
```

## Next Steps

After installation, the following steps were recommended:

1. Push the Prisma schema to the database: `npm run db:push`
2. Start the development server: `npm run dev`
3. Commit the initial files: `git commit -m "initial commit"`

## Notes on Deprecated Packages

During installation, several deprecated package warnings were displayed:

- `inflight@1.0.6`: This module is not supported and leaks memory
- `glob@7.2.3`: Glob versions prior to v9 are no longer supported
- `rimraf@3.0.2`: Rimraf versions prior to v4 are no longer supported
- `@humanwhocodes/config-array@0.13.0`: Use @eslint/config-array instead
- `@humanwhocodes/object-schema@2.0.3`: Use @eslint/object-schema instead
- `eslint@8.57.1`: This version is no longer supported

These are dependencies of dependencies and typically don't require immediate action. They will be updated when the parent packages release new versions.
