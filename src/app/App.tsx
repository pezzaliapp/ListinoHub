/* ListinoHub — © PezzaliAPP — MIT License */
export default function App() {
  return (
    <div className="min-h-full flex flex-col">
      <header className="bg-nav text-nav-ink px-4 py-3 shadow-sm">
        <h1 className="text-lg font-semibold tracking-tight">ListinoHub</h1>
      </header>
      <main className="flex-1 p-4">
        <p className="text-ink-soft">
          Scaffold iniziale. AppShell, router e pagine arrivano nei prossimi
          commit.
        </p>
      </main>
      <footer className="px-4 py-3 text-center text-xs text-muted border-t border-border">
        ListinoHub — © PezzaliAPP
      </footer>
    </div>
  );
}
