import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Certificates } from './pages/Certificates';
import { SSHKeys } from './pages/SSHKeys';
import { CodeSigning } from './pages/CodeSigning';
import { AuditLogs } from './pages/AuditLogs';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/certificates" replace />} />
          <Route path="certificates" element={<Certificates />} />
          <Route path="ssh-keys" element={<SSHKeys />} />
          <Route path="code-signing" element={<CodeSigning />} />
          <Route path="audit-logs" element={<AuditLogs />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
