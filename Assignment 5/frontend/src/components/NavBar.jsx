import { Link, useLocation } from 'react-router-dom';

export default function NavBar() {
  const { pathname } = useLocation();

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">📚 Student Resource Tracker</Link>
      </div>
      <ul className="navbar-links">
        <li>
          <Link to="/" className={pathname === '/' ? 'active' : ''}>
            All Resources
          </Link>
        </li>
        <li>
          <Link to="/add" className={pathname === '/add' ? 'active' : ''}>
            + Add Resource
          </Link>
        </li>
      </ul>
    </nav>
  );
}
