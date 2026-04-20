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
<div className="flex items-center gap-3 px-6 py-4 border-b border-blue-700">
  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" 
         fill="none" stroke="#1e3a5f" strokeWidth="2" 
         strokeLinecap="round" strokeLinejoin="round"
         className="w-6 h-6">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
      <path d="M6 12v5c3 3 9 3 12 0v-5"/>
    </svg>
  </div>
  <div>
    <h1 className="text-white font-bold text-lg leading-tight">KSSMS</h1>
    <p className="text-blue-200 text-xs">Kebbi State Schools</p>
  </div>
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
