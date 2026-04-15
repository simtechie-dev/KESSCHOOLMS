'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import LoadingSpinner from '@/components/LoadingSpinner'
import StatCard from '@/components/StatCard'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

interface AnalyticsData {
  totalSchools: number
  totalStudents: number
  totalTeachers: number
  attendanceRate: number
  passRate: number
  schoolsByLGA: any[]
  studentGradeDistribution: any[]
  attendanceTrend: any[]
}

export default function AnalyticsPage() {
  const { user: clerkUser, isLoaded } = useUser()
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isLoaded || !clerkUser) return

    const fetchAnalytics = async () => {
      try {
        // Fetch statistics from API routes
        const analyticsResponse = await fetch('/api/dashboard/analytics')
        if (!analyticsResponse.ok) {
          throw new Error('Failed to fetch analytics data')
        }

        const analyticsData = await analyticsResponse.json()
        const { totalSchools, totalStudents, totalTeachers, schoolsByLGA, topSchools } = analyticsData

        // Calculate LGA distribution if not provided
        const lgaCount = schoolsByLGA || []

        // Calculate LGA distribution
        const lgaCount = (schoolsData || []).reduce((acc: any, school: any) => {
          const existing = acc.find((item: any) => item.name === school.lga)
          if (existing) {
            existing.value += 1
          } else {
            acc.push({ name: school.lga, value: 1 })
          }
          return acc
        }, [])

        // Calculate grade distribution (mock data)
        const gradeDistribution = [
          { name: 'A', value: 15 },
          { name: 'B', value: 25 },
          { name: 'C', value: 35 },
          { name: 'D', value: 20 },
          { name: 'F', value: 5 },
        ]

        // Mock attendance trend
        const attendanceTrend = [
          { name: 'Mon', present: 850, absent: 150 },
          { name: 'Tue', present: 880, absent: 120 },
          { name: 'Wed', present: 820, absent: 180 },
          { name: 'Thu', present: 890, absent: 110 },
          { name: 'Fri', present: 800, absent: 200 },
        ]

        setData({
          totalSchools: totalSchools || 0,
          totalStudents: totalStudents || 0,
          totalTeachers: totalTeachers || 0,
          attendanceRate: 85,
          passRate: 72,
          schoolsByLGA: lgaCount,
          studentGradeDistribution: gradeDistribution,
          attendanceTrend,
          topSchools: topSchools || []
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching analytics')
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [isLoaded, clerkUser])

  if (loading) return <LoadingSpinner />

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    )
  }

  if (!data) {
    return <LoadingSpinner />
  }

  const COLORS = ['#003366', '#006699', '#00A3E0', '#FF6B6B', '#FFD93D']

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-gray-800">State Analytics Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <StatCard title="Total Schools" value={data.totalSchools} icon="🏫" color="blue" />
        <StatCard title="Total Students" value={data.totalStudents} icon="👨‍🎓" color="green" />
        <StatCard title="Total Teachers" value={data.totalTeachers} icon="👨‍🏫" color="purple" />
        <StatCard title="Attendance Rate" value={`${data.attendanceRate}%`} icon="✅" color="orange" />
        <StatCard title="Pass Rate" value={`${data.passRate}%`} icon="📊" color="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Schools by LGA */}
        <div className="card">
          <h3 className="text-xl font-bold mb-4 text-gray-800">Schools by LGA</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.schoolsByLGA}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.schoolsByLGA.map((_entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Grade Distribution */}
        <div className="card">
          <h3 className="text-xl font-bold mb-4 text-gray-800">Grade Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.studentGradeDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#003366" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Attendance Trend */}
      <div className="card mb-8">
        <h3 className="text-xl font-bold mb-4 text-gray-800">Weekly Attendance Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.attendanceTrend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="present" stroke="#003366" />
            <Line type="monotone" dataKey="absent" stroke="#FF6B6B" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <h4 className="font-semibold text-gray-700 mb-2">Top Performing School</h4>
          <p className="text-2xl font-bold text-primary">87.5%</p>
          <p className="text-sm text-gray-600">Pass rate</p>
        </div>
        <div className="card">
          <h4 className="font-semibold text-gray-700 mb-2">Average Class Size</h4>
          <p className="text-2xl font-bold text-primary">42</p>
          <p className="text-sm text-gray-600">Students per class</p>
        </div>
        <div className="card">
          <h4 className="font-semibold text-gray-700 mb-2">Overall Performance</h4>
          <p className="text-2xl font-bold text-primary">{data.passRate}%</p>
          <p className="text-sm text-gray-600">Pass rate (State)</p>
        </div>
      </div>
    </div>
  )
}
