"use client";
import { Menu, Home, User, BarChart2, LogOut, ChevronLeft, ChevronRight, Building2 } from "lucide-react";
import Link from "next/link";
import { useSidebar } from "@/context/SidebarContext";
export default function HeaderLat() {
  const {collapsed, setCollapsed} = useSidebar();
  return (
    <aside className={`h-screen bg-green-100 border-r border-green-100 fixed top-0 left-0 z-40 transition-all duration-300 ${collapsed ? 'w-16' : 'w-56'}`}> 
      <div className="flex items-center justify-between px-4 py-4 border-b border-green-100">
        {
            !collapsed && (
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
        </div>
            )
        }
        <span className={`text-green-800 font-bold text-xl font-primary transition-all duration-300 ${collapsed ? 'hidden' : 'block'}`}>Ensigna</span>
        <button onClick={() => setCollapsed(!collapsed)} className="p-1 rounded hover:bg-green-50">
          {collapsed ? <ChevronRight className="w-5 h-5 text-green-600" /> : <ChevronLeft className="w-5 h-5 text-green-600" />}
        </button>
      </div>
      <nav className="mt-6 flex flex-col gap-2">
        <Link href="/dashboard/empresa" className="flex items-center gap-3 px-4 py-2  hover:bg-green-50 transition-colors">
          <Home className="w-5 h-5" />
          <span className={`${collapsed ? 'hidden' : 'block'}`}>Inicio</span>
        </Link>
        <Link href="#" className="flex items-center gap-3 px-4 py-2  hover:bg-green-50 transition-colors">
          <BarChart2 className="w-5 h-5" />
          <span className={`${collapsed ? 'hidden' : 'block'}`}>Estadísticas</span>
        </Link>
        <Link href="./" className="flex items-center gap-3 px-4 py-2  hover:bg-green-50 transition-colors">
          <User className="w-5 h-5" />
          <span className={`${collapsed ? 'hidden' : 'block'}`}>Perfil</span>
        </Link>
        <Link href="#" className="flex items-center gap-3 px-4 py-2  hover:bg-green-50 transition-colors mt-8">
          <LogOut className="w-5 h-5" />
          <span className={`${collapsed ? 'hidden' : 'block'}`}>Cerrar sesión</span>
        </Link>
      </nav>
    </aside>
  );
}
