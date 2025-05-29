import { Link , useLocation } from "react-router-dom";
import { useState , useEffect } from "react";

const NavBar = () => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const location = useLocation(); // Hook para detectar cambios de ruta

  const handleToggle = (section: string) => {
    // Si el dropdown que clickeaste ya está abierto, ciérralo
    if (openDropdown === section) {
      setOpenDropdown(null);
    } else {
      // Si clickeas otro, cierra el anterior y abre el nuevo
      setOpenDropdown(section);
    }
  };

  useEffect(() => {
    // Cuando cambia la ruta, cerramos cualquier menú abierto
    setOpenDropdown(null);
  }, [location.pathname]);

  return (
    <nav className="bg-[#a32d42] fixed top-0 left-0 w-full z-50 shadow-md py-3">
      <div className="max-w-screen-xl mx-auto px-6 flex flex-wrap justify-between items-center">
        {/* Título */}
        <h1 className="text-white text-2xl font-bold">Barra de Prueba</h1>

        {/* Menú */}
        <div className="flex flex-wrap justify-end space-x-6 text-base md:text-lg font-semibold text-white relative">

          {/* Inicio */}
          <div className="relative">
            <Link to="/" className="nav-link">Inicio</Link>
          </div>

          {/* Servicios */}
          <div className="navbar-item relative">
            <button 
              onClick={() => handleToggle('servicios')} 
              className="nav-link"
            >
              Servicios
            </button>
            {openDropdown === 'servicios' && (
              <div className="absolute top-full mt-2 bg-white text-black shadow-md rounded-md py-2 w-48 z-10">
                <Link to="/programar-servicio" className="block px-4 py-2 hover:bg-gray-100">Programar</Link>
                <Link to="/registro-alumnos" className="block px-4 py-2 hover:bg-gray-100">Registro</Link>
                <Link to="/recepcion-alumnos" className="block px-4 py-2 hover:bg-gray-100">Recepción</Link>
              </div>
            )}
          </div>

          {/* Alumnos */}
          <div className="relative">
            <button 
              onClick={() => handleToggle('alumnos')} 
              className="nav-link"
            >
              Alumnos
            </button>
            {openDropdown === 'alumnos' && (
              <div className="absolute top-full mt-2 bg-white text-black shadow-md rounded-md py-2 w-52 z-10">
                <Link to="/gestion-sanciones" className="block px-4 py-2 hover:bg-gray-100">Sanciones</Link>
                <Link to="/registrar-alumno" className="block px-4 py-2 hover:bg-gray-100">Registrar/Editar Alumno</Link>
                <Link to="/pase-libre" className="block px-4 py-2 hover:bg-gray-100">Pase Libre</Link>
              </div>
            )}
          </div>

          {/* Configuraciones */}
          <div className="relative">
            <button 
              onClick={() => handleToggle('configuraciones')} 
              className="nav-link"
            >
              Configuraciones
            </button>
            {openDropdown === 'configuraciones' && (
              <div className="absolute top-full mt-2 bg-white text-black shadow-md rounded-md py-2 w-56 z-10">
                <Link to="/areas" className="block px-4 py-2 hover:bg-gray-100">Áreas</Link>
                <Link to="/tipos-de-servicio" className="block px-4 py-2 hover:bg-gray-100">Tipos de servicio</Link>
                <Link to="/horarios-de-turno" className="block px-4 py-2 hover:bg-gray-100">Horarios de turno</Link>
                <Link to="/preferencias" className="block px-4 py-2 hover:bg-gray-100">Preferencias</Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
};

export default NavBar;
