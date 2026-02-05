import { Link } from 'react-router-dom';
import './Layout.css';

export default function Layout({ title, children }) {
  return (
    <div className="layout">
      <header className="layout-header">
        <Link to="/" className="layout-back">← Home</Link>
        <h1 className="layout-title">{title}</h1>
      </header>
      <main className="layout-main">{children}</main>
    </div>
  );
}
