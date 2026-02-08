# Contributing to Business Management Hub

Thank you for your interest in contributing to Business Management Hub! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive criticism
- Welcome diverse perspectives
- Report inappropriate behavior to project maintainers

## Getting Started

### Prerequisites
- Node.js v18 or higher
- MySQL (via XAMPP or standalone installation)
- Git

### Setup Development Environment

1. **Fork the Repository**
   ```bash
   # Click "Fork" on GitHub
   ```

2. **Clone Your Fork**
   ```bash
   git clone https://github.com/YOUR-USERNAME/business-management-hub.git
   cd business-management-hub
   ```

3. **Add Upstream Remote**
   ```bash
   git remote add upstream https://github.com/ORIGINAL-OWNER/business-management-hub.git
   ```

4. **Install Dependencies**
   ```bash
   npm install
   ```

5. **Setup Database**
   ```bash
   # Start XAMPP/MySQL
   # Run the schema file
   mysql -u root -p < database/schema.sql
   ```

6. **Configure Environment**
   ```bash
   # Copy example to local
   cp .env.example .env.local
   
   # Update .env.local with your settings
   # Especially: JWT_SECRET, DB_PASSWORD
   ```

7. **Start Development Server**
   ```bash
   npm run dev
   # App runs on http://localhost:3000
   ```

## Development Workflow

### Create a Feature Branch
```bash
git checkout -b feature/your-feature-name
# or for bug fixes
git checkout -b fix/bug-description
```

### Make Your Changes
- Write clean, readable code
- Follow the existing code style
- Add comments for complex logic
- Keep commits focused and logical

### Testing
```bash
# Run linter
npm run lint

# Build the project
npm run build

# Test manually in dev server
npm run dev
```

### Commit Guidelines

```bash
# Good commit messages
git commit -m "feat: add role-based permission system"
git commit -m "fix: resolve edit permissions modal issue"
git commit -m "docs: update README with permission guide"
git commit -m "refactor: simplify permission logic"

# Format: type(scope): description
# Types: feat, fix, docs, refactor, perf, style, test, chore
```

### Push and Create Pull Request
```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub with:
- Clear title describing the change
- Description of what changed and why
- Reference any related issues (#123)
- Screenshots/demos if applicable (for UI changes)

## Code Style Guidelines

### TypeScript/React
- Use TypeScript for type safety
- Import statements at the top
- Alphabetize imports (React first, third-party, then local)
- Use functional components
- Use hooks (useState, useEffect, etc.)

```typescript
'use client'; // For client components

import { useState, useEffect } from 'react';
import { getSomeData } from '@/lib/utils';
import SomeComponent from '@/components/SomeComponent';

export default function MyComponent() {
  const [state, setState] = useState('');

  useEffect(() => {
    // Effects
  }, []);

  return <div>Component</div>;
}
```

### CSS/Tailwind
- Use Tailwind classes for styling
- Keep components responsive (mobile-first)
- Use semantic HTML

### Database
- Write efficient SQL queries
- Add proper indexes for frequently queried columns
- Use prepared statements to prevent SQL injection
- Document database schema changes

### Security
- Never commit secrets or .env files
- Hash passwords using bcrypt
- Validate all user inputs
- Use prepared statements for queries
- Implement proper error handling (don't leak sensitive info)

## Project Structure

```
├── app/                      # Next.js app directory
│   ├── api/                 # API routes
│   ├── dashboard/           # Dashboard pages
│   ├── login/              # Auth pages
│   └── signup/
├── components/              # Reusable React components
├── database/               # Database schema and migrations
├── lib/                    # Utility functions
├── types/                  # TypeScript type definitions
├── middleware.ts           # Next.js middleware
├── public/                 # Static assets
└── styles/                 # Global styles (Tailwind)
```

## Feature Areas

### Authentication
- `lib/auth.ts` - JWT token handling
- `app/api/auth/` - Auth endpoints

### Permissions & Roles
- `lib/permissions.ts` - Permission mappings
- `app/api/permissions/` - Permission endpoints
- `app/api/roles/` - Role management endpoints
- `app/dashboard/roles/` - Role UI

### Business Features
- `app/api/products/` - Product endpoints
- `app/dashboard/products/` - Product UI
- Similar pattern for sales, customers, inventory, etc.

## Reporting Issues

Found a bug or want to request a feature? Create an issue with:
- Clear title
- Detailed description
- Steps to reproduce (for bugs)
- Expected vs actual behavior
- Screenshots/logs if applicable
- Your environment info

## Documentation

Documentation updates are just as valuable as code contributions:
- Fix typos and clarify existing docs
- Add examples and use cases
- Document new features
- Update README for major changes

## Pull Request Review

Maintainers will review your PR considering:
- Code quality and style
- Test coverage
- Database performance
- Security implications
- Documentation completeness
- Alignment with project goals

## Questions?

- Check existing issues/discussions
- Review the README and documentation
- Open a discussion for questions
- Contact maintainers if needed

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to Business Management Hub!** 🎉
