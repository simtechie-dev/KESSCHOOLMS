# Registration & Student Dashboard Fixes TODO

## Tasks

### [x] 1. New User Role Selection ✅ **Option B**
**Default 'pending' role** - Admin must approve/assign role in Supabase
- sync-user now sets `role: 'pending'`
- pending users → /dashboard/profile

### [x] 2. Fix Student Dashboard `app/dashboard/student/page.tsx` ✅
- Removed admin actions
- Report Card button (existing)
- Stats: 'My Average Grade', 'Attendance %' ✓

### [x] 3. Verify redirect logic ✅
- student → /dashboard/student ✓
- teacher → /dashboard/teacher ✓
- student → /dashboard/student
- teacher → /dashboard/teacher

**Current step: 1/3**
