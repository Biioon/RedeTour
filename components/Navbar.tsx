import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary"></div>
            <span className="text-xl font-bold">RedeTour</span>
          </Link>
        </div>
        
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/about" className="text-sm font-medium hover:text-primary">
            Sobre
          </Link>
          <Link href="/contact" className="text-sm font-medium hover:text-primary">
            Contato
          </Link>
        </nav>
        
        <div className="flex items-center gap-2">
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Entrar
            </Button>
          </Link>
          <Link href="/register">
            <Button size="sm">
              Cadastrar
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}