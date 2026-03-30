# KSSMS Development Guide

## Project Structure Overview

```
KESSCHOOLMS/
├── app/                          # Next.js app directory structure
│   ├── api/                      # API routes for backend operations
│   │   ├── schools/              # School management endpoints
│   │   ├── students/             # Student management endpoints
│   │   ├── teachers/             # Teacher management endpoints
│   │   ├── classes/              # Class management endpoints
│   │   ├── attendance/           # Attendance tracking endpoints
│   │   ├── results/              # Grades and results endpoints
│   │   ├── enrollments/          # Student enrollment endpoints
│   │   ├── users/                # User profile endpoints
│   │   ├── notifications/        # Email and notification endpoints
│   │   └── webhooks/             # Clerk webhook handling
│   ├── dashboard/                # Protected dashboard pages
│   │   ├── page.tsx              # Main dashboard
│   │   ├── schools/              # School management UI
│   │   ├── students/             # Student management UI
│   │   ├── teachers/             # Teacher management UI
│   │   ├── classes/              # Class management UI
│   │   ├── attendance/           # Attendance tracking UI
│   │   ├── grades/               # Grades entry UI
│   │   ├── reports/              # Report generation UI
│   │   ├── analytics/            # State analytics UI
│   │   └── profile/              # User profile page
│   ├── sign-in/                  # Sign in page (Clerk)
│   ├── sign-up/                  # Sign up page (Clerk)
│   ├── page.tsx                  # Landing page
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Global styles
├── components/                   # Reusable React components
│   ├── Sidebar.tsx               # Navigation sidebar
│   ├── StatCard.tsx              # Statistics display card
│   ├── LoadingSpinner.tsx        # Loading indicator
│   ├── SchoolForm.tsx            # School form component
│   ├── StudentForm.tsx           # Student form component
│   └── ...                       # Other components
├── lib/                          # Utility functions and configurations
│   ├── types.ts                  # TypeScript interfaces
│   ├── supabase.ts               # Supabase client setup
│   ├── utils.ts                  # Helper functions
│   └── email.ts                  # Email service
├── middleware.ts                 # Clerk authentication middleware
├── database.sql                  # Database schema and RLS policies
├── package.json                  # Dependencies and scripts
├── tsconfig.json                 # TypeScript configuration
├── tailwind.config.ts            # Tailwind CSS configuration
├── postcss.config.js             # PostCSS configuration
├── next.config.js                # Next.js configuration
├── vercel.json                   # Vercel deployment configuration
├── .env.local.example            # Example environment variables
├── .gitignore                    # Git ignore rules
├── README.md                     # Project documentation
├── USER_GUIDE.md                 # User guide for end users
├── DEPLOYMENT.md                 # Deployment instructions
└── DEVELOPMENT.md                # This file
```

---

## Adding New Features

### Adding a New Module (e.g., Fees Management)

#### Step 1: Create Database Schema

Add to `database.sql`:

```sql
CREATE TABLE fees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id),
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT,
  due_date DATE,
  status TEXT CHECK (status IN ('Pending', 'Paid', 'Overdue')),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_fees_student_id ON fees(student_id);
```

#### Step 2: Create API Endpoint

Create `app/api/fees/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('fees')
      .select('*')
      .order('due_date', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching fees:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
```

#### Step 3: Create UI Component

Create a component `components/FeesForm.tsx`:

```typescript
'use client'

export default function FeesForm() {
  // Component implementation
}
```

#### Step 4: Create Pages

Create `app/dashboard/fees/page.tsx` and `app/dashboard/fees/new/page.tsx`:

```typescript
'use client'

export default function FeesPage() {
  // Page implementation
}
```

#### Step 5: Add TypeScript Interface

Update `lib/types.ts`:

```typescript
export interface Fee {
  id: string
  student_id: string
  amount: number
  description?: string
  due_date?: string
  status: 'Pending' | 'Paid' | 'Overdue'
  created_at: string
}
```

#### Step 6: Update Navigation

Update `app/dashboard/layout.tsx` sidebar navigation to include fees link.

---

## Common API Patterns

### Authentication Pattern

```typescript
import { auth } from '@clerk/nextjs/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  // 1. Check authentication
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Verify user role (optional)
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('role')
    .eq('clerk_id', userId)
    .single()

  if (userError || !user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  // 3. Check permissions
  if (user.role !== 'school_admin' && user.role !== 'state_admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  // 4. Fetch data
  const { data, error } = await supabase
    .from('table_name')
    .select('*')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
```

### Form Component Pattern

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function MyForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [data, setData] = useState({ field: '' })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/endpoint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed')
      }

      router.push('/dashboard/page')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card">
      {error && <div className="error">{error}</div>}
      {/* Form fields */}
      <button disabled={loading}>{loading ? 'Saving...' : 'Submit'}</button>
    </form>
  )
}
```

---

## Code Style Guidelines

### TypeScript

- Use strict mode
- Always define interfaces for data objects
- Use `type XOR YProp = (...) | (...)` for discriminated unions
- Avoid `any` type

### React/TSX

- Use functional components
- Place `'use client'` at top for client components
- Use `useEffect` for side effects
- Prefer composition over inheritance

### API Routes

- Always check authentication first
- Validate request data
- Check permissions before operations
- Return appropriate HTTP status codes

### Styling

- Use Tailwind CSS classes
- Avoid inline styles
- Define reusable classes in globals.css

---

## Testing

### Manual Testing Checklist

- [ ] User registration and login
- [ ] Different role permissions
- [ ] CRUD operations for each module
- [ ] Data validation
- [ ] Error handling
- [ ] Mobile responsiveness

### API Testing

Use curl to test API endpoints:

```bash
# Get schools
curl -H "Authorization: Bearer TOKEN" http://localhost:3000/api/schools

# Create school (POST with JSON)
curl -X POST -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"name":"School","code":"S001","lga":"Birnin Kebbi"}' \
  http://localhost:3000/api/schools
```

---

## Performance Optimization

### Database Queries

- Use indexes for frequently queried columns (already added in schema)
- Implement pagination for large datasets
- Use `select()` to fetch only needed columns

### Frontend

- Use dynamic imports for large components
- Implement lazy loading for images
- Minimize bundle size with tree-shaking

### Caching

- Implement Redis cache for frequently accessed data
- Use browser cache for static assets
- Cache API responses client-side with SWR or React Query

---

## Deployment Considerations

### Before Deployment

- [ ] All environment variables configured
- [ ] Database migrations run
- [ ] SSL certificate installed
- [ ] Email service configured
- [ ] Backups enabled
- [ ] Monitoring set up
- [ ] Performance tested

### Post-Deployment

- [ ] Verify all features working
- [ ] Test webhook integrations
- [ ] Monitor error logs
- [ ] Collect user feedback
- [ ] Plan rollback if needed

---

## Debugging

### Enable Debug Logs

Create `.env.local`:

```env
DEBUG=*
LOG_LEVEL=debug
NEXT_INSECURE_ALLOW_LOCALHOST_HTTPS=true
```

### Check Browser Console

- Press F12 to open DevTools
- Check Console tab for JavaScript errors
- Check Network tab to see API calls
- Check Application → Cookies for auth tokens

### Check Server Logs

```bash
# View Vercel logs
vercel logs

# Local development logs
npm run dev
# Errors appear in terminal
```

### Database Debugging

In Supabase:
1. Go to SQL Editor
2. Run `SELECT * FROM table_name;`
3. Check query results
4. View table structure and indexes

---

## Common Issues and Solutions

### Issue: "Unauthorized" Error

**Cause**: Missing or invalid authentication token

**Solution**:
1. Check if user is logged in
2. Verify Clerk configuration
3. Check middleware.ts
4. Clear browser cache

### Issue: Database Connection Error

**Cause**: Incorrect database URL or connection limit exceeded

**Solution**:
1. Verify Supabase URL and keys
2. Check connection pool limits
3. Restart application
4. Check Supabase status page

### Issue: Build Fails

**Cause**: TypeScript errors or missing dependencies

**Solution**:
1. Run `npm install`
2. Check TypeScript errors: `npx tsc --noEmit`
3. Fix import paths
4. Check tsconfig.json

---

## Git Workflow

### Branches

- `main` - Production code
- `develop` - Development branch
- `feature/*` - Feature branches

### Commits

```bash
git commit -m "feat: add new feature"
git commit -m "fix: resolve bug"
git commit -m "docs: update documentation"
git commit -m "refactor: improve code structure"
```

### Pull Requests

1. Create feature branch from develop
2. Make changes with clean commits
3. Push to GitHub
4. Create Pull Request
5. Request review
6. Merge after approval

---

## Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Clerk Docs](https://clerk.com/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

## Contributing

1. Follow code style guidelines
2. Add tests for new features
3. Update documentation
4. Create meaningful commits
5. Request code review

---

**Happy Coding! 🚀**
