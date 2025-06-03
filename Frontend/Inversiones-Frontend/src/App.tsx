import { Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import Layout from "./layout/Layout";
import Prueba from "./pages/Prueba";
import Login from "./pages/Login";
import Usuarios from "./pages/Usuarios";
import LoginRoute from "./components/LoginRouter";
import { AuthContext } from "./context/AuthContext";

const App = () => {
  const { token } = useContext(AuthContext)

  return (
    <Routes>

      <Route
        path="/login"
        element={token ? <Navigate to="/dashboard" replace /> : <Login />}
      />

      <Route 
        path="/dashboard"
        element={
        <LoginRoute>
          <Layout />
        </LoginRoute>
        }
      >
        <Route index element={<Prueba />} />
        <Route path="usuarios" element={<Usuarios />} />
        {/* Aquí puedes agregar más rutas principales si es necesario
        <Route path="programar-servicio" element={<ProgramarServicio />} />
        */}
      </Route>
      
    <Route
      path="*"
      element={
        token ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
      }
    />
    
    </Routes>
  );
};

export default App;