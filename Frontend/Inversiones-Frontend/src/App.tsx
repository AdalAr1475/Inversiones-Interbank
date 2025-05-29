import { Routes, Route } from "react-router-dom";
import Layout from "./layout/Layout";
import Prueba from "./pages/Prueba";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Prueba />} />
        {/* Aquí puedes agregar más rutas principales si es necesario }
        <Route path="programar-servicio" element={<ProgramarServicio />} />
        */}
      </Route>
    </Routes>
  );
};

export default App;