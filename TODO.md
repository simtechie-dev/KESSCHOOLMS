# KSSMS Fixes TODO

## Report Card & Dashboard Fixes

### [x] 1. Update API: app/api/results/route.ts ✅
- Add student_id filter ✓
- JOIN subjects for subject_name ✓ 
- Filter score > 0 (gt('score', 0)) ✓
- Ensure total/score consistency ✓

### [x] 2. Fix Report Card UI: app/dashboard/reports/[studentId]/page.tsx ✅
- Add no-results message ✓
- Fix hardcoded termId/classId ✓
- Update summary calcs ✓

### [x] 3. Add state_admin Quick Actions: app/dashboard/page.tsx ✅
- View All Schools ✓
- View Analytics ✓
- Generate Reports ✓
- Manage Sessions ✓

### [x] 5. Git commit & push ✅
- Add no-results message
- Fix hardcoded termId/classId (make dynamic)
- Update summary calcs

### [ ] 3. Add state_admin Quick Actions: app/dashboard/page.tsx
- View All Schools (/schools)
- View Analytics (/analytics)
- Generate Reports (/reports)
- Manage Sessions (/sessions)

### [ ] 4. Test changes
- Report card shows only subjects with scores
- No results message works
- State admin quick actions visible

### [ ] 5. Git commit & push
```
git add . &amp;&amp; git commit -m "fix: report card shows only subjects with scores + state admin quick actions" &amp;&amp; git push
```

**Current step: 2/5 - Report Card UI**
