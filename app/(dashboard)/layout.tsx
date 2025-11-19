'use client'

import { Sidebar } from '@/components/Sidebar'
import { RoleBasedDashboard } from '@/components/dashboard/role-based-dashboard'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { useState } from 'react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = async () => {
    setRefreshing(true)
    // Recarregar dados dos dashboards
    setTimeout(() => {
      setRefreshing(false)
      window.location.reload()
    }, 1000)
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar para desktop */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      {/* Sidebar mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="fixed left-0 top-0 h-full w-64 bg-background border-r">
            <div className="absolute right-4 top-4">
              <button
                className="p-2 hover:bg-muted rounded-md"
                onClick={() => setSidebarOpen(false)}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <Sidebar />
          </div>
        </div>
      )}

      {/* Conteúdo principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <DashboardHeader
          title="Dashboard"
          onMenuClick={() => setSidebarOpen(true)}
          onRefresh={handleRefresh}
        />

        {/* Conteúdo */}
        <main className="flex-1 overflow-y-auto p-6">
          <RoleBasedDashboard>
            {children}
          </RoleBasedDashboard>
        </main>
      </div>
    </div>
  )
}