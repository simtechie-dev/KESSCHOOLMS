# KSSMS User Guide

## Getting Started

### System Requirements

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection
- Supported on desktop, tablet, and mobile devices

---

## User Roles Overview

### 1. State Administrator

**Access Level**: Full system access across all schools

**Key Responsibilities**:
- Create and manage schools
- Monitor state-wide performance
- View analytics and reports
- Manage user accounts
- Generate state-level reports

**Available Features**:
- Dashboard with state-wide statistics
- School management
- User management
- Analytics dashboard
- Report generation

**Navigation**:
```
Dashboard → Schools → Analytics → Reports
```

### 2. School Administrator

**Access Level**: Full access to their assigned school only

**Key Responsibilities**:
- Manage students and teachers
- Create classes and subjects
- Record attendance
- Enter grades and results
- Generate school reports
- Manage fees and payments

**Available Features**:
- Student registration and management
- Teacher assignment
- Class management
- Attendance tracking
- Grade entry
- Report card generation
- Fee management

**Navigation**:
```
Dashboard → Students → Teachers → Classes → Attendance → Grades → Reports
```

### 3. Teacher

**Access Level**: Limited access to assigned classes

**Key Responsibilities**:
- Record daily attendance
- Enter student grades
- Monitor class performance
- View student records

**Available Features**:
- My Classes
- Attendance marking
- Grade entry
- Student performance tracking

**Navigation**:
```
Dashboard → My Classes → Attendance → Grades
```

### 4. Student

**Access Level**: View-only access to personal records

**Key Responsibilities**:
- Access personal academic records
- View grades and attendance
- Download report cards

**Available Features**:
- View grades
- Check attendance
- Download report cards
- View class schedule

**Navigation**:
```
Dashboard → My Grades → My Attendance → My Reports
```

---

## Common Tasks

### As State Admin: Create a School

1. Click **Schools** in the sidebar
2. Click **Add School** button
3. Fill in school details:
   - School Name
   - School Code
   - LGA (Local Government Area)
   - Address
   - Principal Details
4. Click **Create School**
5. School appears in schools list instantly

### As School Admin: Add a Student

1. Click **Students** in sidebar
2. Click **Add Student** button
3. Fill in student information:
   - Registration Number (auto-generated or manual)
   - First and Last Name
   - Gender
   - Date of Birth
   - Parent Contact Details
4. Click **Add Student**
5. Student appears in student list

### As School Admin: Create a Class

1. Click **Classes** in sidebar
2. Click **Add Class** button
3. Fill in class details:
   - School (auto-selected if single school)
   - Class Name (e.g., "Senior Secondary 1")
   - Class Code (e.g., "SS1A")
   - Capacity
4. Click **Create Class**

### As Teacher: Record Attendance

1. Click **Attendance** in sidebar
2. Select Class and Date
3. A table appears with all students
4. For each student, select status:
   - **Present**: Student was in class
   - **Absent**: Student was not present
   - **Late**: Student arrived late
   - **Excused**: Student absent with valid reason
5. Click **Save Attendance**

### As Teacher: Enter Grades

1. Click **Grades** in sidebar
2. Select Class and Exam
   - Exams can be: CA1, CA2, CA3, or Final Exam
3. A table appears with students
4. Enter score (0-100) for each student
5. Grade is auto-calculated:
   - 90-100: A
   - 80-89: B
   - 70-79: C
   - 60-69: D
   - 50-59: E
   - 0-49: F
6. Click **Save Grades**

### Generate Report Card

1. Click **Reports** in sidebar
2. Select:
   - Class
   - Student
   - Term (First, Second, or Third)
   - Year
3. Click **Generate Report Card**
4. Review the report card
5. Click **Download as PDF** to save

### View Analytics (State Admin Only)

1. Click **Analytics** in sidebar
2. Dashboard displays:
   - Total schools, students, teachers
   - Attendance rate
   - Pass rate
   - Schools by LGA
   - Grade distribution
   - Weekly attendance trend
   - Class statistics

---

## Data Entry Guidelines

### Registration Numbers

**Format**: `SCHOOLCODE-YEAR-NUMBER`

**Example**: `GSS001-2024-0001`

**Recommendations**:
- Use unique codes
- Include school identifier
- Include enrollment year
- Use sequential numbering

### Class Codes

**Format**: `FORM+SECTION`

**Examples**:
- `SS1A` (Senior Secondary 1, Section A)
- `JSS2B` (Junior Secondary 2, Section B)
- `SS3C` (Senior Secondary 3, Section C)

### Score Entry

**Valid Range**: 0-100

**Grading Formula**:
- Automatic calculation based on score
- Displays as letter grade (A-F)
- Stored for report generation

**Best Practices**:
- Enter scores as percentage out of 100
- Double-check entries
- Use bulk operations when possible

---

## Attendance Management

### Daily Workflow

1. **Morning**: Teacher marks attendance for first class
2. **Each Class**: Teacher updates attendance
3. **End of Day**: Attendance data is consolidated
4. **Reports**: Generate attendance reports

### Attendance Statuses

| Status | Description | Mark |
|--------|-------------|------|
| Present | Student attended class | ✓ |
| Absent | Student was not present | ✗ |
| Late | Student arrived after class started | ! |
| Excused | Student with valid excuse | ~ |

### Generating Attendance Reports

1. Go to **Attendance** page
2. Select date range
3. Select class or all classes
4. Click **Generate Report**
5. Review and download PDF

---

## Performance Monitoring

### Key Metrics

**Attendance Rate**
- Formula: (Present Days / Total Days) × 100
- Target: >85%
- Alerts: <70%

**Pass Rate**
- Formula: (Students with grade C+) / Total Students × 100
- Target: >70%
- Benchmark: Compare across schools

**Class Average**
- Formula: Sum of all student scores / Number of students
- Shows overall class performance

**Student Performance**
- Individual scores and grades
- Trend analysis
- Comparison with class average

---

## Reports

### Types of Reports Available

#### 1. Report Card
- Student name and details
- All subject scores
- Grades and comments
- Class position
- Class average

#### 2. Attendance Report
- Daily attendance by student
- Monthly summary
- Yearly statistics
- Trend analysis

#### 3. Grade Report
- Grade distribution by class
- Subject-wise performance
- Exam-wise breakdown
- Trend over terms

#### 4. School Report
- Enrollment statistics
- Staff information
- Class-wise performance
- Attendance summary

#### 5. State Report
- School comparison
- Performance rankings
- State-wide trends
- LGA-wise breakdown

---

## Troubleshooting

### Login Issues

**Problem**: Cannot login

**Solutions**:
1. Check email address is correct
2. Verify password
3. Check email for password reset link
4. Clear browser cache
5. Try different browser
6. Contact administrator

**Problem**: "Unauthorized" error

**Solutions**:
1. Check user role and permissions
2. Verify school assignment (for school admin)
3. Confirm email is verified
4. Try logging out and back in

### Data Issues

**Problem**: Student not appearing in class

**Solutions**:
1. Verify student is enrolled in class
2. Check class selection
3. Verify school assignment
4. Refresh page
5. Check enrollment status

**Problem**: Attendance/grades not saving

**Solutions**:
1. Check internet connection
2. Verify all required fields are filled
3. Close and reopen browser
4. Try again after a few moments
5. Check if data already exists

### Performance Issues

**Problem**: Slow page loading

**Solutions**:
1. Clear browser cache
2. Check internet speed
3. Try different browser
4. Close other browser tabs
5. Contact system administrator

---

## Best Practices

### Data Management

✓ **Do**:
- Enter data promptly (within 24 hours)
- Verify data before submission
- Use standardized naming conventions
- Keep attendance records updated
- Review grades before finalizing
- Make regular backups (automatic)

✗ **Don't**:
- Leave data entry until end of term
- Enter incorrect information
- Use abbreviations inconsistently
- Duplicate student entries
- Delete data by mistake

### Security

✓ **Do**:
- Keep password secure
- Don't share login credentials
- Log out after session
- Use strong passwords
- Report security issues
- Keep software updated

✗ **Don't**:
- Share login account
- Write down passwords
- Use same password everywhere
- Leave computer unattended while logged in
- Click suspicious links in emails

### Communication

✓ **Do**:
- Inform parents of progress
- Send attendance alerts
- Send grade notifications
- Share report cards promptly
- Provide feedback on performance

✗ **Don't**:
- Share private information
- Discuss students publicly
- Make inappropriate comments
- Delay important communications

---

## Getting Help

### Support Channels

1. **In-App Help**
   - Click **?** icon on any page
   - Hover over fields for tooltips

2. **Documentation**
   - See README.md for technical details
   - Check this guide for user procedures

3. **System Administrator**
   - Contact school administrator
   - Report technical issues
   - Request account recovery

4. **Technical Support**
   - Email: support@kssms.ng
   - Phone: +234 XXX XXX XXXX

---

## System Features Summary

| Feature | State Admin | School Admin | Teacher | Student |
|---------|-----------|------------|---------|---------|
| Dashboard | ✓ | ✓ | ✓ | ✓ |
| Schools | ✓ | View Only | - | - |
| Students | View All | ✓ | View | View Own |
| Teachers | View All | ✓ | View | - |
| Classes | View All | ✓ | View Own | View Own |
| Attendance | View All | ✓ | ✓ | View Own |
| Grades | View All | ✓ | ✓ | View Own |
| Reports | ✓ | ✓ | Limited | View Own |
| Analytics | ✓ | Limited | - | - |
| Payments | View All | ✓ | - | - |

---

## Contact Information

**KSSMS Support**
- Email: support@kssms.ng
- Phone: +234 XXX XXX XXXX
- Hours: Monday - Friday, 8:00 AM - 5:00 PM

**Emergency Issues**
- Technical Issues: admin@kssms.ng
- Data Loss: backup@kssms.ng
- Security Issues: security@kssms.ng

---

## Version Information

- **Application**: KSSMS v0.1.0
- **Last Updated**: 2024
- **Supported Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

---

**Thank you for using KSSMS. We're committed to improving education management in Kebbi State.**
