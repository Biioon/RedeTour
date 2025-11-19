'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  DollarSign,
  Hotel,
  Car,
  MapPin,
  Tag,
  ChevronDown,
  ChevronRight,
  CreditCard,
  TrendingUp,
  Settings,
  User
} from 'lucide-react'
import { useState } from 'react'

const sidebarItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Produtos',
    icon: Package,
    submenu: [
      { title: 'Visão Geral', href: '/dashboard/products' },
      { title: 'Acomodações', href: '/dashboard/products/acomodacoes' },
      { title: 'Transportes', href: '/dashboard/products/transportes' },
      { title: 'Passeios', href: '/dashboard/products/passeios' },
      { title: 'Categorias', href: '/dashboard/products/categorias' },
    ],
  },
  {
    title: 'Financeiro',
    icon: DollarSign,
    submenu: [
      { title: 'Dashboard Financeiro', href: '/dashboard/financeiro' },
      { title: 'Assinaturas', href: '/dashboard/assinaturas' },
      { title: 'Vendas', href: '/dashboard/vendas' },
      { title: 'Comissões', href: '/dashboard/comissoes' },
    ],
  },
  {
    title: 'Afiliados',
    href: '/dashboard/affiliates',
    icon: Users,
  },
  {
    title: 'Configurações',
    href: '/dashboard/settings',
    icon: Settings,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<string[]>(['Produtos', 'Financeiro'])

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title)
        : [...prev, title]
    )
  }

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname.startsWith(href)
  }

  const isSubmenuActive = (submenu: { href: string }[]) => {
    return submenu.some(item => isActive(item.href))
  }

  return (
    <div className="w-64 bg-background border-r h-full">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">RT</span>
          </div>
          <h2 className="text-lg font-semibold">RedeTour</h2>
        </div>
        
        <nav className="space-y-2">
          {sidebarItems.map((item) => (
            <div key={item.title}>
              {item.submenu ? (
                <div>
                  <button
                    onClick={() => toggleExpanded(item.title)}
                    className={cn(
                      "flex items-center justify-between w-full px-3 py-2 text-sm font-medium rounded-md transition-colors",
                      isSubmenuActive(item.submenu)
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <div className="flex items-center">
                      <item.icon className="h-4 w-4 mr-3" />
                      {item.title}
                    </div>
                    {expandedItems.includes(item.title) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                  {expandedItems.includes(item.title) && (
                    <div className="ml-6 mt-1 space-y-1">
                      {item.submenu.map((subitem) => (
                        <Link
                          key={subitem.href}
                          href={subitem.href}
                          className={cn(
                            "block px-3 py-2 text-sm rounded-md transition-colors",
                            isActive(subitem.href)
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                          )}
                        >
                          {subitem.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive(item.href)
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4 mr-3" />
                  {item.title}
                </Link>
              )}
            </div>
          ))}
        </nav>
      </div>
    </div>
  )
}