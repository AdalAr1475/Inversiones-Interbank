import NavBar from "../components/NavBar";
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      <main className="mt-24 p-6 flex-grow w-[100vw]"> {/* Aumenté mt-24 para mejor margen */}
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;

