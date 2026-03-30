import nodemailer from 'nodemailer'

// This is a placeholder for email service
// In production, you would use Resend or similar service

export interface EmailPayload {
  to: string
  subject: string
  html: string
  name?: string
}

export async function sendEmail(payload: EmailPayload) {
  try {
    // For development, you can use a service like Mailtrap or Resend
    // Here's a basic example with nodemailer (configure with your SMTP)

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@kssms.ng',
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
    }

    await transporter.sendMail(mailOptions)
    return { success: true }
  } catch (error) {
    console.error('Error sending email:', error)
    throw error
  }
}

// Email templates
export const emailTemplates = {
  studentEnrolled: (studentName: string, schoolName: string) => ({
    subject: 'Welcome to KSSMS',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px;">
        <h2>Welcome to Kebbi State School Management System</h2>
        <p>Hello ${studentName},</p>
        <p>You have been successfully enrolled at ${schoolName}.</p>
        <p>You can now access your grades, attendance, and report cards online.</p>
        <p>Best regards,<br>KSSMS Team</p>
      </div>
    `,
  }),

  attendanceAlert: (parentName: string, studentName: string, school: string) => ({
    subject: `Attendance Alert for ${studentName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px;">
        <h2>Attendance Alert</h2>
        <p>Hello ${parentName},</p>
        <p>${studentName} was marked absent today at ${school}.</p>
        <p>Please ensure your child attends school regularly.</p>
        <p>Best regards,<br>KSSMS Team</p>
      </div>
    `,
  }),

  reportCardReady: (parentName: string, studentName: string, term: string) => ({
    subject: `Report Card Ready - ${term} Term`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px;">
        <h2>Report Card Available</h2>
        <p>Hello ${parentName},</p>
        <p>The ${term} term report card for ${studentName} is now available.</p>
        <p>Please log in to the KSSMS portal to view and download the report card.</p>
        <p>Best regards,<br>KSSMS Team</p>
      </div>
    `,
  }),

  gradeNotification: (parentName: string, studentName: string, subject: string, grade: string) => ({
    subject: `Grade Posted - ${subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px;">
        <h2>Grade Posted</h2>
        <p>Hello ${parentName},</p>
        <p>A new grade has been posted for ${studentName} in ${subject}: <strong>${grade}</strong></p>
        <p>Log in to the KSSMS portal to view full details.</p>
        <p>Best regards,<br>KSSMS Team</p>
      </div>
    `,
  }),
}
