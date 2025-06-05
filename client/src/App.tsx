import { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuthStore } from "@/stores/auth";
import Layout from "@/components/layouts/Layout";
import LoginPage from "@/components/auth/LoginPage";
import CreateTenantPage from "@/components/auth/CreateTenantPage";
import Dashboard from "@/components/Dashboard";
import CompaniesPage from "@/components/companies/CompaniesPage";
import ContactsPage from "@/components/contacts/ContactsPage";
import DealsPage from "@/components/deals/DealsPage";
import ActivitiesPage from "@/components/activities/ActivitiesPage";
import NotesPage from "@/components/notes/NotesPage";

function App() {
  const { isAuthenticated, initAuth } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  if (!isAuthenticated) {
    return (
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/create-tenant" element={<CreateTenantPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/companies" element={<CompaniesPage />} />
          <Route path="/contacts" element={<ContactsPage />} />
          <Route path="/deals" element={<DealsPage />} />
          <Route path="/activities" element={<ActivitiesPage />} />
          <Route path="/notes" element={<NotesPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
