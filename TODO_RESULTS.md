# Results/Grades + Report Card TODO

## Plan Steps:

### 1. lib/types.ts - Update Result interface
- Add term_id, class_id, subject_id, ca1, ca2, ca3, exam, total (or keep score per exam_id)

### 2. lib/utils.ts - Update calculateGrade to new scale
- A:75-100, B:65-74, C:55-64, D:45-54, F:0-44

### 3. app/api/results/route.ts
- Switch to getSupabaseAdminClient()
- POST bulk: {term_id, class_id, subject_id, scores: [{student_id, ca1, ca2, exam}] } → create exams if needed, upsert results, auto-total/grade
- GET: by term/class/subject

### 4. Create app/api/results/summary/route.ts
- GET class/term: all results grouped student

### 5. app/dashboard/grades/page.tsx → /dashboard/results
- Select Class/Term/Subject
- Students table: Name | CA1(30) | CA2(30) | Exam(40) | Total | Grade
- Bulk save

### 6. Create app/dashboard/reports/[studentId]/page.tsx
- Fetch student details, results by student/term, class position, attendance
- Professional report layout, window.print()

### 7. Test & Complete

**Progress: 5/7** ( + summary/route.ts TS fixed)
