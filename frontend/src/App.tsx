import { BrowserRouter, Routes, Route } from "react-router-dom";

/* Pages */
import LoginPage from "./pages/LoginPage";
import DashBoard from "./pages/DashBoard";
import AccountingPage from "./pages/Accounting";

/* CSS */
import "./styles/index.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashBoard />} />
        <Route path="/accounting" element={<AccountingPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
