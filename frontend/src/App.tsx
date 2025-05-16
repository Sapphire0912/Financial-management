import { BrowserRouter, Routes, Route } from "react-router-dom";

/* Pages */
import LoginPage from "./pages/LoginPage";
import DashBoard from "./pages/DashBoard";

/* CSS */
import "./styles/index.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashBoard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
