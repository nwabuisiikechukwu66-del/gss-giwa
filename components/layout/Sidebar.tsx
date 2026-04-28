'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import {
  LayoutDashboard, FileText, Calendar, Bell, User,
  LogOut, Users, ClipboardList, BookOpen, Home
} from 'lucide-react'

type SidebarProps = {
  role: 'student' | 'admin'
  userName?: string
  userSub?: string
}

const STUDENT_LINKS = [
  { href: '/student/portal',    label: 'Dashboard',     Icon: LayoutDashboard },
  { href: '/student/results',   label: 'My Results',    Icon: FileText },
  { href: '/student/timetable', label: 'Timetable',     Icon: Calendar },
  { href: '/student/notices',   label: 'Notice Board',  Icon: Bell },
  { href: '/student/profile',   label: 'My Profile',    Icon: User },
]

const ADMIN_LINKS = [
  { href: '/admin/dashboard',          label: 'Dashboard',  Icon: LayoutDashboard },
  { href: '/admin/dashboard/students', label: 'Students',   Icon: Users },
  { href: '/admin/dashboard/results',  label: 'Results',    Icon: ClipboardList },
  { href: '/admin/dashboard/notices',  label: 'Notices',    Icon: Bell },
  { href: '/admin/dashboard/staff',    label: 'Staff',      Icon: BookOpen },
]

export default function Sidebar({ role, userName, userSub }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const links = role === 'student' ? STUDENT_LINKS : ADMIN_LINKS

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push(role === 'student' ? '/login' : '/admin/login')
    router.refresh()
  }

  return (
    <aside className="bg-green-dark text-white w-64 flex-shrink-0 flex flex-col min-h-screen">
      {/* Brand */}
      <div className="px-5 py-6 border-b border-white/10">
        <Link href="/" className="flex items-center gap-2 mb-4">
          <Home size={14} className="text-white/40" />
          <span className="font-mono text-[10px] tracking-widest uppercase text-white/40 hover:text-white/70 transition-colors">
            Back to Website
          </span>
        </Link>
        <div className="font-serif text-[17px] font-semibold leading-tight">{userName || 'Portal'}</div>
        <div className="font-mono text-[10px] tracking-widest uppercase text-white/45 mt-1">{userSub}</div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        <div className="font-mono text-[10px] tracking-widest uppercase text-white/30 px-2 mb-2">Menu</div>
        <div className="flex flex-col gap-0.5">
          {links.map(({ href, label, Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded text-sm transition-all sidebar-link ${
                pathname === href
                  ? 'active font-medium'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon size={16} className="flex-shrink-0" />
              {label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 px-3 py-2.5 rounded text-sm text-red-300/80 hover:bg-red-500/10 hover:text-red-300 transition-all w-full"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
