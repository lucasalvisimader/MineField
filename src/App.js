import './App.css';
import Home from './pages/home/Home';
import { Route, BrowserRouter, Routes } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
