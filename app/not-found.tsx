import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col items-center justify-center space-y-6 text-center sm:w-[350px]">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl">404</h1>
          <h2 className="text-xl font-semibold">Página não encontrada</h2>
          <p className="text-sm text-muted-foreground">
            Desculpe, não conseguimos encontrar a página que você está procurando.
          </p>
        </div>
        
        <Link href="/">
          <Button>Voltar para Home</Button>
        </Link>
      </div>
    </div>
  )
}