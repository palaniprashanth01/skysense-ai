import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Index from "@/pages/Index";
import MyBookings from "@/pages/MyBookings";

import SkySenseChat from "@/pages/SkySenseChat";
import Layout from "@/components/Layout";

function App() {
  return (
    <LanguageProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/my-bookings" element={<MyBookings />} />
            <Route path="/skysense" element={<SkySenseChat />} />
          </Routes>
        </Layout>
      </Router>
    </LanguageProvider>
  );
}

export default App;
