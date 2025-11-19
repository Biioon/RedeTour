import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t py-6 md:py-0">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
        <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
          © 2024 RedeTour. Todos os direitos reservados.
        </p>
        <div className="flex items-center gap-4">
          <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary">
            Termos
          </Link>
          <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary">
            Privacidade
          </Link>
          <Link href="/contact" className="text-sm text-muted-foreground hover:text-primary">
            Contato
          </Link>
        </div>
      </div>
    </footer>
  )
}