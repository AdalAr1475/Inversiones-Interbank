"use client";
import { useState } from "react";
import { useDialog } from "@/context/DialogContext";
import HeaderLat from "@/components/header-lat";
import { SidebarProvider, useSidebar } from "@/context/SidebarContext";
import { User, Mail, CreditCard, ChevronLeft, ChevronRight } from "lucide-react";
import { postRecarga } from "@/api/usuarios";

export default function PerfilPage() {
  const { open, setOpen } = useDialog();
  const [monto, setMonto] = useState(0);
  const [saldo, setSaldo] = useState(5000);
  const [mensaje, setMensaje] = useState("");
  const { collapsed } = useSidebar();

  const handleRecargar = () => {
    if (monto > 0) {
      setSaldo(saldo + monto);
      setMensaje(`Recarga exitosa: $${monto}`);
      postRecarga({
        inversor_id: 2,
        monto: monto,
      })
      console.log("Holaaa");
      setMonto(0);
    } else {
      setMensaje("Ingresa un monto válido");
    }
    setOpen(false);
    setTimeout(() => setMensaje(""), 3000);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex">
        <HeaderLat />
        <main className={`flex-1 flex items-center justify-center transition-all duration-300 ${collapsed ? 'ml-16' : 'ml-56'}`}>
          <div className="max-w-lg w-full bg-white rounded-lg shadow p-8 border border-green-100">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-3xl font-bold text-green-700 shadow">
                I
              </div>
              <div>
                <div className="font-semibold text-2xl">Inversor Demo</div>
                <div className="text-gray-500 text-sm flex items-center gap-2"><User className="w-4 h-4" /> inversor@email.com</div>
                <div className="text-gray-500 text-sm flex items-center gap-2 mt-1"><CreditCard className="w-4 h-4" /> Cuenta activa desde: 2023</div>
              </div>
            </div>
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <span className="text-gray-700 font-medium">Saldo disponible:</span>
                <span className="text-green-600 font-bold text-2xl">${saldo}</span>
              </div>
              <button
                className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 w-full shadow"
                onClick={() => setOpen(true)}
              >
                Recargar saldo
              </button>
              {mensaje && <div className="mt-4 text-green-700 font-semibold text-center animate-pulse">{mensaje}</div>}
            </div>
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-2">Datos personales</h3>
              <ul className="text-gray-700 space-y-1">
                <li><span className="font-medium">Nombre completo:</span> Juan Pérez</li>
                <li><span className="font-medium">DNI:</span> 12345678</li>
                <li><span className="font-medium">Teléfono:</span> +51 999 888 777</li>
                <li><span className="font-medium">Dirección:</span> Lima, Perú</li>
                <li><span className="font-medium">Tipo de cuenta:</span> Inversor</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Actividad reciente</h3>
              <ul className="text-gray-700 space-y-1 text-sm">
                <li>• Recargaste $1,000 el 10/06/2025</li>
                <li>• Invertiste $5,000 en &quot;TechStart AI&quot; el 01/06/2025</li>
                <li>• Retiraste $500 el 20/05/2025</li>
              </ul>
            </div>
            {open && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative">
                  <h2 className="text-xl font-bold mb-4">Recargar saldo</h2>
                  <label className="block mb-2 text-gray-700">Monto a recargar</label>
                  <input
                    type="number"
                    min={1}
                    value={monto}
                    onChange={e => setMonto(Number(e.target.value))}
                    className="w-full border border-gray-300 rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Ingrese el monto"
                  />
                  <button
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 w-full"
                    onClick={handleRecargar}
                  >
                    Recargar
                  </button>
                  <button
                    className="mt-2 px-4 py-2 w-full rounded border border-gray-300 text-gray-700 hover:bg-gray-100"
                    onClick={() => setOpen(false)}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
