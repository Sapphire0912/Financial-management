import { BrowserRouter, Routes, Route } from "react-router-dom";

/* Provider */
import { MenuProvider } from "./contexts/SidebarMenu";

/* Pages */
import LoginPage from "./pages/LoginPage";
import DashBoard from "./pages/DashBoard";
import AccountingPage from "./pages/Accounting";
import AnalyzePage from "./pages/Analyze";
import TransactionPage from "./pages/Transaction";
import NotificationPage from "./pages/Notification";
import InvestingPage from "./pages/Investing";
import SettingPage from "./pages/Setting";
import RedirectPage from "./pages/RedirectPage";

/* CSS */
import "./styles/index.css";

function App() {
  return (
    <MenuProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/line/auth/callback" element={<RedirectPage />} />
          <Route path="/dashboard" element={<DashBoard />} />
          <Route path="/accounting" element={<AccountingPage />} />
          <Route path="/analyze" element={<AnalyzePage />} />
          <Route path="/history" element={<TransactionPage />} />
          {/*可能會移除 */}
          {/* <Route path="/notification" element={<NotificationPage />} /> */}

          <Route path="/investing" element={<InvestingPage />} />
          <Route path="/setting" element={<SettingPage />} />
        </Routes>
      </BrowserRouter>
    </MenuProvider>
  );
}

export default App;
