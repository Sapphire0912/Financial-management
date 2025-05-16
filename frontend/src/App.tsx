import { BrowserRouter, Routes, Route } from "react-router-dom";

/* Pages */
import LoginPage from "./pages/LoginPage";
import DashBoard from "./pages/DashBoard";
import AccountingPage from "./pages/Accounting";
import AnalyzePage from "./pages/Analyze";
import TransactionPage from "./pages/Transaction";
import NotificationPage from "./pages/Notification";
import InvestingPage from "./pages/Investing";
import SettingPage from "./pages/Setting";

/* CSS */
import "./styles/index.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashBoard />} />
        <Route path="/accounting" element={<AccountingPage />} />
        <Route path="/analyze" element={<AnalyzePage />} />
        <Route path="/history" element={<TransactionPage />} />
        <Route path="/notification" element={<NotificationPage />} />
        <Route path="/investing" element={<InvestingPage />} />
        <Route path="/setting" element={<SettingPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
