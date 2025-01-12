import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Sidebar } from "./components/layout/Sidebar";
import StockPage from "./pages/stock";

function App() {
  return (
    <Router>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 md:ml-64">
          <Routes>
            <Route path="/stock" element={<StockPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;