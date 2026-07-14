import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import ResourceListPage from './pages/ResourceListPage';
import AddResourcePage from './pages/AddResourcePage';
import EditResourcePage from './pages/EditResourcePage';

export default function App() {
  return (
    <Router>
      <NavBar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<ResourceListPage />} />
          <Route path="/add" element={<AddResourcePage />} />
          <Route path="/edit/:id" element={<EditResourcePage />} />
        </Routes>
      </main>
    </Router>
  );
}
