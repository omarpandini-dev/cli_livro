export function NotFound() {
  return <main className="reader-error" role="alert">
    <span aria-hidden="true">✦</span>
    <h1>Página não encontrada</h1>
    <p>Este endereço não existe. Use o link exato da história que você recebeu.</p>
  </main>;
}
