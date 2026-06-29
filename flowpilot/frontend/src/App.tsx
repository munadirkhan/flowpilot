import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import FlowPilotApp from "./FlowPilotApp";
import { Landing } from "./components/Landing";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/app" element={<FlowPilotApp />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
