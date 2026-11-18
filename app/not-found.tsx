import Link from "next/link"
import { ArrowLeft, FolderKanban } from "lucide-react"

export default function NotFound() {
  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
      <div className="max-w-md w-full rounded-3xl border border-border bg-card p-8 text-center shadow-sm space-y-5">
        <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary-subtle text-primary">
          <FolderKanban className="size-6" />
        </div>
        <div className="space-y-2">
          <p className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
            404
          </p>
          <h1 className="text-xl font-bold tracking-tight text-card-foreground">
            Página não encontrada
          </h1>
          <p className="text-sm text-muted-foreground">
            O endereço solicitado não existe ou foi movido dentro do workspace Kard.
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-blue-700"
        >
          <ArrowLeft className="size-4" />
          <span>Voltar ao Dashboard</span>
        </Link>
      </div>
    </main>
  )
}
