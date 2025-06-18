import HeaderLat from "@/components/header-lat";
import { SidebarProvider, useSidebar } from "@/context/SidebarContext";

export default function PerfilPage() {

  return (
    
    <SidebarProvider>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex">
        <HeaderLat />
      </div>
    </SidebarProvider>
  );
}
