import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken, COOKIE_NAME } from '@/lib/auth'
import { connectDb } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import Navbar from '@/components/Navbar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) redirect('/auth/login')

  const payload = verifyToken(token)
  if (!payload) redirect('/auth/login')

  const db = await connectDb()
  const user = await db
    .collection('users')
    .findOne({ _id: new ObjectId(payload.userId) }, { projection: { name: 1 } })

  return (
    <div className="min-h-screen">
      <Navbar userName={user?.name as string | undefined} />
      <main>
        <div className="max-w-7xl mx-auto px-6 py-8">{children}</div>
      </main>
    </div>
  )
}
