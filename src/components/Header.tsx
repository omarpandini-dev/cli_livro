import { BookOpen, CircleDollarSign, Home, Menu, MessageCircle, X } from 'lucide-react';
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Logo } from './Logo';

const links = [
  { to: '/', label: 'Início', icon: Home, end: true },
  { to: '/books', label: 'Livros', icon: BookOpen, end: false },
  { to: '/comics', label: 'Quadrinhos', icon: MessageCircle, end: false },
];

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header">
      <div className="header-inner">
        <Logo />
        <button className="menu-button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-controls="primary-nav" aria-label={open ? 'Fechar menu' : 'Abrir menu'}>
          {open ? <X /> : <Menu />}
        </button>
        <nav id="primary-nav" className={open ? 'nav open' : 'nav'} aria-label="Navegação principal">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} onClick={() => setOpen(false)}><Icon aria-hidden="true" />{label}</NavLink>
          ))}
          <a className="nav-pricing" href="/#precos" onClick={() => setOpen(false)}><CircleDollarSign aria-hidden="true" />Preços</a>
        </nav>
      </div>
    </header>
  );
}
