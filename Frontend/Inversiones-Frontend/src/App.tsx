import { Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import Layout from "./layout/Layout";
import Prueba from "./pages/Prueba";
import Login from "./pages/Login";
import { AuthContext } from "./context/AuthContext";

const App = () => {
  const { token } = useContext(AuthContext)

  return (
    <Routes>

      <Route
        path="/login"
        element={token ? <Navigate to="/home" replace /> : <Login />}
      />

      <Route 
        path="/home"
        element={token ? <Layout /> : <Navigate to="/login" replace />}
      >
        <Route index element={<Prueba />} />
        {/* Aquí puedes agregar más rutas principales si es necesario }
        <Route path="programar-servicio" element={<ProgramarServicio />} />
        */}
      </Route>

      <Route
        path="*"
        element={<Navigate to = {token ? "/home" : "/login"} replace />}
      />
      
    </Routes>
  );
};

export default App;