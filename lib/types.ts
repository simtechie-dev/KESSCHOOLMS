export type UserRole = 'state_admin' | 'school_admin' | 'teacher' | 'student'

export interface User {
  id: string
  clerk_id: string
  email: string
  full_name: string
  phone?: string
  role: UserRole
  school_id?: string
  created_at: string
  updated_at: string
}

export interface School {
  id: string
  name: string
  code: string
  lga: string
  address?: string
  phone?: string
  email?: string
  principal_name?: string
  principal_email?: string
  created_at: string
  updated_at: string
}

export interface Student {
  id: string
  registration_number: string
  first_name: string
  last_name: string
  gender?: 'Male' | 'Female'
  date_of_birth?: string
  school_id: string
  parent_phone?: string
  parent_email?: string
  created_at: string
  updated_at: string
}

export interface Teacher {
  id: string
  user_id: string
  school_id: string
  employee_id: string
  specialization?: string
  qualification?: string
  phone?: string
  created_at: string
  updated_at: string
}

export interface Class {
  id: string
  school_id: string
  name: string
  code: string
  form_teacher_id?: string
  capacity?: number
  created_at: string
  updated_at: string
}

export interface Subject {
  id: string
  school_id: string
  name: string
  code: string
  description?: string
  created_at: string
  updated_at: string
}

export interface ClassSubject {
  id: string
  class_id: string
  subject_id: string
  teacher_id?: string
  created_at: string
}

export interface Enrollment {
  id: string
  student_id: string
  class_id: string
  enrollment_year: number
  created_at: string
  updated_at: string
}



export interface Attendance {
  id: string
  student_id: string
  class_id: string
  date: string
  status: 'Present' | 'Absent' | 'Late' | 'Excused'
  recorded_by?: string
  created_at: string
}

export interface AttendanceRecordInput {
  student_id: string
  status: 'Present' | 'Absent' | 'Late' | 'Excused'
}

export interface AttendancePayload {
  class_id: string
  date: string
  term_id: string
  records: AttendanceRecordInput[]
}

export interface AttendanceSummary {
  id: string
  registration_number: string
  first_name: string
  last_name: string
  present_days: number
  absent_days: number
  late_days: number
  excused_days: number
  total_days: number
  percentage: number
}


export interface Exam {
  id: string
  school_id: string
  class_id: string
  subject_id: string
  exam_type: 'CA1' | 'CA2' | 'CA3' | 'Exam'
  total_score: number
  exam_date?: string
  created_at: string
  updated_at: string
}

export interface Result {
  id: string
  school_id: string
  student_id: string
  subject_id: string
  exam_id: string
  term_id: string
  class_id: string
  ca1?: number
  ca2?: number
  ca3?: number
  exam?: number
  total?: number
  grade?: string
  remark?: string
  recorded_by?: string
  created_at: string
  updated_at: string
}

export interface ResultScoreInput {
  student_id: string
  ca1?: number
  ca2?: number
  exam?: number
}

export interface ResultPayload {
  term_id: string
  class_id: string
  subject_id: string
  scores: ResultScoreInput[]
}

export interface ReportCard {
  id: string
  student_id: string
  class_id: string
  term: 'First' | 'Second' | 'Third'
  year: number
  total_score?: number
  position?: number
  class_average?: number
  generated_by?: string
  created_at: string
}

export interface Payment {
  id: string
  student_id: string
  amount: number
  payment_date: string
  term: 'First' | 'Second' | 'Third'
  year: number
  payment_method?: string
  reference?: string
  status: 'Pending' | 'Completed' | 'Failed'
  recorded_by?: string
  created_at: string
  updated_at: string
}

export interface FeeStructure {
  id: string
  school_id: string
  class_id?: string
  term: 'First' | 'Second' | 'Third'
  year: number
  tuition_fee?: number
  development_fee?: number
  other_fees?: number
  created_at: string
}

export interface AcademicSession {
  id: string
  school_id: string
  name: string
  start_date: string
  end_date: string
  is_current: boolean
  created_at: string
  updated_at?: string
}

export interface Term {
  id: string
  session_id: string
  school_id: string
  name: 'First Term' | 'Second Term' | 'Third Term'
  start_date: string
  end_date: string
  is_current: boolean
  created_at: string
  updated_at?: string
}
