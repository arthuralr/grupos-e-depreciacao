import type { Metadata } from 'next';
import { Layers3 } from 'lucide-react';
import './globals.css';

export const metadata: Metadata = {
  title: 'Patrimônio AI | Consulta patrimonial',
  description: 'Assistente para consultar grupos, espécies e parâmetros de bens patrimoniais.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>
        <header className="site-header">
          <div className="shell header-inner">
            <a className="brand" href="/" aria-label="Patrimônio AI, início">
              <span className="brand-icon"><Layers3 size={20} aria-hidden="true" /></span>
              Patrimônio <span>AI</span>
            </a>
            <a className="help-link" href="#como-funciona">Como funciona</a>
          </div>
        </header>
        <main className="shell">{children}</main>
        <footer className="shell footer">
          <span>Patrimônio AI</span>
          <span>Apoio à gestão de bens patrimoniais</span>
        </footer>
      </body>
    </html>
  );
}
