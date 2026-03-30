# KSSMS - Kebbi State School Management System

A modern, cloud-based multi-school management platform built for Kebbi State. KSSMS enables centralized school operations management with state-level oversight while maintaining independent school operations.

## ✨ Key Features

- **Multi-School Management**: Manage multiple schools from a single dashboard
- **Student Management**: Complete digital student records and profiles
- **Teacher Management**: Teacher assignments and qualifications tracking
- **Attendance Tracking**: Real-time attendance recording and reporting
- **Grades & Results**: Automated grading system with report generation
- **Report Cards**: Instant digital report card generation
- **State-Level Analytics**: Comprehensive dashboards for government oversight
- **Role-Based Access**: Secure multi-level access control (State Admin, School Admin, Teacher, Student)
- **Cloud-Based**: Scalable infrastructure with automatic backups

## 🛠️ Technology Stack

- **Frontend**: React 19, Next.js 15, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Clerk (Role-based)
- **Deployment**: Vercel
- **UI Components**: Lucide React Icons
- **Charts**: Recharts
- **PDF Generation**: jsPDF, html2canvas

## 📋 Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Supabase account
- Clerk account
- Vercel account (for deployment)

## 🚀 Quick Start

### 1. Clone and Setup

```bash
cd KESSCHOOLMS
npm install
```

### 2. Environment Configuration

Create a `.env.local` file in the root directory:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_WEBHOOK_SECRET=your_webhook_secret

# API URLs
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### 3. Database Setup

1. Go to your Supabase project
2. Create a new database query
3. Copy and run the contents of `database.sql`
4. This will create all necessary tables and RLS policies

### 4. Clerk Configuration

1. Go to Clerk Dashboard
2. Add a Webhook for user.created events
3. Set the webhook URL to: `https://your-domain/api/webhooks/clerk`
4. Copy the webhook secret to `.env.local`

### 5. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 📁 Project Structure

```
KESSCHOOLMS/
├── app/
│   ├── api/              # API routes
│   ├── dashboard/        # Protected dashboard pages
│   ├── layout.tsx        # Root layout with Clerk provider
│   ├── page.tsx          # Landing page
│   └── globals.css       # Global styles
├── components/           # Reusable React components
├── lib/
│   ├── types.ts          # TypeScript interfaces
│   ├── supabase.ts       # Supabase client
│   └── utils.ts          # Utility functions
├── middleware.ts         # Clerk authentication middleware
├── database.sql          # Database schema and RLS policies
└── package.json          # Dependencies and scripts
```

## 🔐 User Roles

### State Admin
- Full access across all schools
- View state-level analytics
- Manage schools and users
- Generate state-level reports

### School Admin
- Manage their school only
- Student and teacher management
- Attendance and results entry
- School-level reporting

### Teacher
- Manage assigned classes
- Record attendance
- Enter grades and results
- View student performance

### Student
- View personal grades
- Check attendance records
- Download report cards
- View class schedule

## 📊 Core Modules

### Schools Module
- Create and manage schools
- Assign principals and staff
- Track school information

### Students Module
- Register new students
- Manage student profiles
- Track enrollment history
- Student demographics

### Teachers Module
- Teacher registration
- Qualification tracking
- Class assignments
- Subject specializations

### Classes & Subjects
- Create class structures
- Manage subjects per class
- Assign teachers to subjects
- Class capacity management

### Attendance System
- Daily attendance marking
- Attendance reports
- Attendance analytics

### Grading System
- Create exams (CA1, CA2, CA3, Final)
- Record student scores
- Automatic grade calculation
- Performance analytics

### Report Cards
- Automatic report card generation
- Term-wise reports
- Class ranking
- Performance summaries

## 🔗 API Endpoints

### Authentication
- `POST /api/webhooks/clerk` - User creation webhook

### Schools
- `GET /api/schools` - Fetch schools
- `POST /api/schools` - Create school

### Students
- `GET /api/students` - Fetch students
- `POST /api/students` - Create student

### Classes
- `GET /api/classes` - Fetch classes
- `POST /api/classes` - Create class

### Attendance
- `GET /api/attendance` - Fetch attendance
- `POST /api/attendance` - Record attendance

### Results
- `GET /api/results` - Fetch results
- `POST /api/results` - Record grade

### Users
- `GET /api/users/profile` - Get user profile

## 📈 Grade Scale

| Range | Grade | Point |
|-------|-------|-------|
| 90-100 | A | 5 |
| 80-89 | B | 4 |
| 70-79 | C | 3 |
| 60-69 | D | 2 |
| 50-59 | E | 1 |
| 0-49 | F | 0 |

## 🚢 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect GitHub repository to Vercel
3. Add environment variables in Vercel Dashboard
4. Deploy

```bash
# Or use Vercel CLI
npm i -g vercel
vercel
```

## 📝 Database Schema

### Key Tables
- `users` - System users with roles
- `schools` - School information
- `students` - Student records
- `teachers` - Teacher information
- `classes` - Class definitions
- `subjects` - Subject list
- `enrollments` - Student class enrollment
- `attendance` - Daily attendance records
- `exams` - Exam definitions
- `results` - Student grades
- `report_cards` - Generated report cards
- `payments` - Fee payments

## 🔒 Security Features

- Role-based access control (RBAC)
- Row-level security (RLS) policies
- Authentication via Clerk
- Secure API routes with middleware
- HTTPS enforcement in production
- Data encryption in transit

## 💡 Usage Examples

### 1. Create a School (State Admin)

```
1. Login as State Admin
2. Go to Schools > Add School
3. Fill in school details
4. Click Create School
```

### 2. Add Students (School Admin)

```
1. Login as School Admin
2. Go to Students > Add Student
3. Fill in student information
4. Click Add Student
```

### 3. Record Attendance (Teacher)

```
1. Login as Teacher
2. Go to Attendance
3. Select class and date
4. Mark attendance for each student
5. Click Save Attendance
```

### 4. Enter Grades (Teacher)

```
1. Login as Teacher
2. Go to Grades
3. Select class and exam
4. Enter scores for students
5. Click Save Grades
```

## 🐛 Troubleshooting

### Authentication Issues
- Verify Clerk keys in `.env.local`
- Check Clerk Dashboard for webhook configuration
- Clear browser cache and cookies

### Database Connection Errors
- Verify Supabase credentials
- Check database connection limits
- Ensure RLS policies are properly configured

### API Route Errors
- Check middleware configuration
- Verify API route file structure
- Check browser console for error details

## 📞 Support

For issues and feature requests, please create an issue in the repository.

## 📄 License

This project is proprietary and intended for use in Kebbi State educational system.

## 🤝 Contributing

Contributions are welcome! Please follow the existing code style and create pull requests for new features.

---

**Built with ❤️ for Kebbi State Education**
