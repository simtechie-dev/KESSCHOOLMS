'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'

interface NavItem {
  label: string
  href: string
  icon: string | React.ReactNode
}

interface SidebarProps {
  navItems: NavItem[]
  userRole: string
}

export default function Sidebar({ navItems, userRole }: SidebarProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 p-3 bg-primary text-white rounded-full md:hidden"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-30 h-screen w-64 bg-primary text-white transition-transform duration-300 transform md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 border-b border-blue-600">
          <h1 className="text-2xl font-bold">KSSMS</h1>
          <p className="text-sm text-blue-100">{userRole}</p>
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    pathname === item.href
                      ? 'bg-secondary text-white'
                      : 'hover:bg-blue-700'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-blue-600">
          <UserButton />
        </div>
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
