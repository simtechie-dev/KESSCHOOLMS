# Users Dashboard Page TODO

## New Task: Create /dashboard/users page

### [ ] 1. Create app/dashboard/users/page.tsx
- Table: Name, Email, Role (formatted), Date Joined
- Fetch from /api/users
- View button → modal with details (school, etc.)

### [ ] 2. Create app/api/users/route.ts 
- GET all users with school JOIN if applicable
- Role formatting helper

### [x] 3. Update components/Sidebar.tsx ✅
- Added 'Users' link for state_admin & school_admin ✓
  - href: '/dashboard/users'
  - icon: '👥'

### [x] 4. Test & git commit ✅

**Users dashboard page complete!**
