import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';

function App() {
  return (
    <main className="min-h-screen bg-[#eef2f4] text-[#17252d]">
      <header className="border-b border-[#ced8dd] bg-[#f8faf9]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <a className="flex items-center gap-3 font-semibold tracking-tight" href="/">
            <span className="grid size-9 place-items-center rounded-md bg-[#146c68] text-sm text-white" aria-hidden="true">S</span>
            Support Desk
          </a>
          <span className="text-sm text-[#52636b]">Ticket workspace</span>
        </div>
      </header>
      <section className="mx-auto grid max-w-6xl gap-12 px-6 py-16 md:grid-cols-[1fr_20rem] md:items-start md:py-24">
        <div>
          <p className="text-sm font-medium text-[#146c68]">Support operations</p>
          <h1 className="mt-5 max-w-2xl text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">Every request, moving forward.</h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-[#52636b]">Your support ticket workspace is ready. Ticket tools will appear here.</p>
        </div>
        <aside className="border-t-2 border-[#146c68] bg-[#f8faf9] px-5 py-5" aria-labelledby="workspace-status">
          <h2 id="workspace-status" className="font-semibold">Workspace status</h2>
          <p className="mt-3 text-sm leading-6 text-[#52636b]">Frontend is running. Check the backend at <a className="font-medium text-[#146c68] underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4" href="/health">/health</a>.</p>
        </aside>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
