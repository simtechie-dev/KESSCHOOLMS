# KESSCHOOLMS Task Completion Plan

## Remaining Tasks Progress Tracker

### Phase 1: API Enhancements
- [x] Step 1: Updated `app/api/schools/route.ts` with student_count, teacher_count, search/?lga= support.

- [ ] Step 3: Ensure `app/api/attendance/summary/route.ts` supports student+term, format {present_days, absent_days, total_days, percentage}.

### Phase 2: Frontend Updates

- [ ] Step 5: Update `app/dashboard/analytics/page.tsx`: Fetch from /api/dashboard/analytics, populate stats/charts/table w/ real data (bar students per LGA, top10 table).
- [ ] Step 6: Update `app/dashboard/reports/[studentId]/page.tsx`: 
  - Fetch school.name from student.school_id, class.name from enrollment, session.name from term/session_id.
  - Format attendance summary exactly as "Days Present | Days Absent | Total Days | Percentage".
  - Add @media print { body { margin: 0; } .print-hidden { display: none !important; } .sidebar, .navbar { display: none !important; } }
  - Verify print button.
- [ ] Step 7: Polish `app/dashboard/results/page.tsx` if needed (already has inputs/save).

### Phase 3: Testing & Completion
- [ ] Step 8: Test in dev: npm run dev, login as state_admin/school_admin, verify data loads, print works, inputs save, charts render.
- [ ] Step 9: attempt_completion w/ results.

**Current Progress:** Ready to start Step 1.

Track updates here after each step completion.
