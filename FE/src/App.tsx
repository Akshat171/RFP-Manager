import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MainLayout from './components/layout/MainLayout'
import RFPCreator from './pages/RFPCreator'
import Drafts from './pages/Drafts'
import VendorDirectory from './pages/VendorDirectory'
import ActiveRFPs from './pages/ActiveRFPs'
import EvaluationDashboard from './pages/EvaluationDashboard'

function App() {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/" element={<RFPCreator />} />
          <Route path="/drafts" element={<Drafts />} />
          <Route path="/vendors" element={<VendorDirectory />} />
          <Route path="/rfps" element={<ActiveRFPs />} />
          <Route path="/evaluation" element={<EvaluationDashboard />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  )
}

export default App
