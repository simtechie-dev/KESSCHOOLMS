import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// Assuming a utility to get user role and school_id. This would typically interact with your database
// to fetch the user's assigned role and school_id based on their Clerk user ID.
// This function should be implemented in '@/lib/utils.ts'
async function getUserRoleAndSchoolId(userId: string) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
  // Assuming a 'users' table that links Clerk user IDs to roles and school_ids
  // Schema for 'users' table is not provided, but typically would include 'clerk_user_id', 'role', 'school_id'
  const { data, error } = await supabase
    .from('users')
    .select('role, school_id')
    .eq('clerk_user_id', userId) // Assuming 'clerk_user_id' is the column storing Clerk user IDs
    .single();

  if (error) {
    console.error('Error fetching user role and school ID:', error);
    return { role: null, school_id: null };
  }
  return { role: data.role, school_id: data.school_id };
}

export async function GET(request: Request) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  const { data: { user }, error: userAuthError } = await supabase.auth.getUser();
  if (userAuthError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { role, school_id } = await getUserRoleAndSchoolId(user.id);

  if (!role) {
    return NextResponse.json({ error: 'User role not found or not assigned' }, { status: 403 });
  }

  try {
    let totalSchools = 0;
    let totalStudents = 0;
    let totalTeachers = 0;
    let todayPresentAttendanceCount = 0;
    let gradeScores: number[] = []; // To store all scores for distribution calculation
    let schoolsByLGA: any[] = [];

    // --- Fetch Total Schools (State Admin only) ---
    // The 'schools' table is assumed to have an 'id' and 'lga' column.
    if (role === 'State Admin') {
      const { count, error } = await supabase
        .from('schools')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      totalSchools = count || 0;

      // Fetch Schools by LGA for State Admin
      const { data: lgaData, error: lgaError } = await supabase
        .from('schools')
        .select('lga, count')
        .group('lga');
      if (lgaError) throw lgaError;
      schoolsByLGA = lgaData || [];
    }

    // --- Fetch Total Students ---
    // The 'students' table has 'school_id' directly.
    if (role === 'State Admin') {
      const { count, error } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      totalStudents = count || 0;
    } else if (role === 'School Admin' && school_id) {
      const { count, error } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true })
        .eq('school_id', school_id);
      if (error) throw error;
      totalStudents = count || 0;
    }

    // --- Fetch Total Teachers ---
    // The 'teachers' table has 'school_id' directly.
    if (role === 'State Admin') {
      const { count, error } = await supabase
        .from('teachers')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      totalTeachers = count || 0;
    } else if (role === 'School Admin' && school_id) {
      const { count, error } = await supabase
        .from('teachers')
        .select('*', { count: 'exact', head: true })
        .eq('school_id', school_id);
      if (error) throw error;
      totalTeachers = count || 0;
    }

    // --- FIX: Today's Present Attendance Count ---
    // The 'attendance' table does NOT have a 'school_id' column directly.
    // It has: id, class_id, student_id, term_id, date, status
    // To filter attendance by school, we must join through the 'students' table.
    const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD

    if (role === 'School Admin' && school_id) {
      const { count, error } = await supabase
        .from('attendance')
        .select('*, students!inner(school_id)', { count: 'exact', head: true })
        .eq('students.school_id', school_id)
        .eq('date', today)
        .eq('status', 'Present'); // Counting only 'Present' students for today
      if (error) throw error;
      todayPresentAttendanceCount = count || 0;
    } else if (role === 'State Admin') {
      // For State Admin, get overall present attendance for today across all schools
      const { count, error } = await supabase
        .from('attendance')
        .select('*', { count: 'exact', head: true })
        .eq('date', today)
        .eq('status', 'Present');
      if (error) throw error;
      todayPresentAttendanceCount = count || 0;
    }

    // --- Fetch Grade Scores for Distribution ---
    // The 'results' table has 'school_id' directly.
    // It has: id, school_id, student_id, subject_id, exam_id, term_id, class_id, score
    // We fetch raw scores; client-side logic or a database view/function would typically categorize these into A-F grades.
    const resultsQuery = supabase.from('results').select('score');
    if (role === 'School Admin' && school_id) {
      resultsQuery.eq('school_id', school_id);
    }
    const { data, error } = await resultsQuery;
    if (error) throw error;
    gradeScores = data?.map(row => row.score) || [];

    return NextResponse.json({
      totalSchools,
      totalStudents,
      totalTeachers,
      todayPresentAttendanceCount,
      gradeScores, // Client-side will process this into A-F distribution
      schoolsByLGA,
      // Add other relevant stats here as needed for the dashboard
    });

  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error.message);
    return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 });
  }
}