"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useDialog } from "@/context/DialogContext";
import HeaderLat from "@/components/header-lat";
import { SidebarProvider, useSidebar } from "@/context/SidebarContext";
import { User, CreditCard, CheckCircle, XCircle } from "lucide-react";
import { createCheckoutSession } from "@/api/stripe";
import { getInversorProfile } from "@/api/usuarios";
import { getWalletBalance, getRecargas } from "@/api/wallet";
import { InversorProfile } from "@/types/inversor";
import { jwtDecode } from "jwt-decode";


export default function PerfilPage() {
  // Estilos de animación en línea
  const animationStyles = `
    @keyframes slideInFromBottom {
      from {
        transform: translateY(20px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    @keyframes growWidth {
      from {
        width: 0%;
      }
      to {
        width: 100%;
      }
    }
  `;
  
  const { open, setOpen } = useDialog();
  const [monto, setMonto] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saldo, setSaldo] = useState(5000); // Mantenemos este estado para futura implementación
  const [mensaje, setMensaje] = useState("");
  const [profileLoading, setProfileLoading] = useState(true);
  const [profile, setProfile] = useState<InversorProfile | null>(null);
  const { collapsed } = useSidebar();
  const searchParams = useSearchParams();
  
  // Estados para animaciones de pago
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const [showPaymentFailed, setShowPaymentFailed] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);
  
  // Efecto para manejar las redirecciones de Stripe
  useEffect(() => {
    const success = searchParams.get("success");
    const amount = searchParams.get("amount");
    
    if (success === "true") {
      const amountValue = amount ? parseInt(amount) / 100 : 0;
      setPaymentAmount(amountValue);
      setShowPaymentSuccess(true);
      
      // Actualizar saldo simulado
      if (amountValue > 0) {
        setSaldo(prev => prev + amountValue);
      }
      
      // Ocultar la animación después de 5 segundos
      setTimeout(() => {
        setShowPaymentSuccess(false);
      }, 5000);
    } else if (success === "false") {
      setShowPaymentFailed(true);
      
      // Ocultar la animación después de 5 segundos
      setTimeout(() => {
        setShowPaymentFailed(false);
      }, 5000);
    }
    
    // Limpiar el query string para evitar que se muestre la animación nuevamente al recargar
    if (success) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [searchParams]);

  interface DecodedToken {
      id: string
      sub: string
      tipo_usuario: string
      exp: number
    }

  const idUsuario = jwtDecode<DecodedToken>(localStorage.getItem("token") || "").id;  // Estados adicionales para los datos del wallet y actividad
  // Definimos una interfaz para las actividades recientes
  interface RecargaActivity {
    id: number;
    monto: string;
    fecha: string;
    inversor_id: number;
  }
  const [recentActivity, setRecentActivity] = useState<RecargaActivity[]>([]);
  const [walletLoading, setWalletLoading] = useState(true);
  
  // Efecto para cargar el perfil del inversor y datos del wallet
  useEffect(() => {
    const fetchData = async () => {
      try {
        setProfileLoading(true);
        setWalletLoading(true);
        
        const token = window?.localStorage?.getItem("token");
        if (!token) {
          throw new Error("No se encontró el token de autenticación");
        }
        
        // Obtenemos los datos del perfil
        const profileData = await getInversorProfile(token, parseInt(idUsuario));
        setProfile(profileData);
          // Obtenemos la información del saldo
        const wallet = await getWalletBalance(token, parseInt(idUsuario));
        setSaldo(parseFloat(wallet.saldo)); // Actualizamos el saldo
        
        // Obtener historial de recargas
        try {
          const recargas = await getRecargas(token, parseInt(idUsuario));
          setRecentActivity(recargas);
        } catch (activityError) {
          console.error("Error al cargar las recargas:", activityError);
        }
        
      } catch (error) {
        console.error("Error al cargar los datos:", error);
      } finally {
        setProfileLoading(false);
        setWalletLoading(false);
      }
    };

    fetchData();
  }, [idUsuario]);

  const handleRecargar = async () => {
    if (monto > 0) {
      try {
        setLoading(true);
        setMensaje("Preparando el checkout...");
        // Obtenemos la URL del checkout de Stripe
        const checkoutUrl = await createCheckoutSession(`${idUsuario}`, monto*100);
        
        setMensaje("Redirigiendo a la pasarela de pago...");
        
        // Breve retraso para que el usuario vea el mensaje de redirección
        setTimeout(() => {
          // Redirigimos al usuario a la página de checkout de Stripe
          window.location.href = checkoutUrl;
        }, 800);
      } catch (error) {
        console.error("Error al procesar la recarga:", error);
        setMensaje("Hubo un error al procesar tu recarga. Inténtalo nuevamente.");
        setTimeout(() => setMensaje(""), 5000);
        setLoading(false);
      }
    } else {
      setMensaje("Ingresa un monto válido");
      setTimeout(() => setMensaje(""), 3000);
      setOpen(false);
    }
  };

  return (
    
    <SidebarProvider>
      <style dangerouslySetInnerHTML={{ __html: animationStyles }} />
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex">
        <HeaderLat />
        <main className={`flex-1 flex items-center justify-center transition-all duration-300 ${collapsed ? 'ml-16' : 'ml-56'} relative`}>
          {/* Animación de pago exitoso */}
          {showPaymentSuccess && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
              <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full transform transition-all duration-500 ease-in-out translate-y-0 opacity-100" 
                   style={{ animation: "slideInFromBottom 0.5s ease-in-out" }}>
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">¡Pago exitoso!</h2>
                  <p className="text-gray-600 text-center mb-4">
                    Has recargado <span className="font-semibold text-green-600">${paymentAmount.toFixed(2)}</span> a tu cuenta.
                  </p>
                  <div className="w-full bg-gray-200 h-2 rounded-full mb-6">
                    <div className="bg-green-500 h-2 rounded-full transition-all duration-1000 ease-in-out" 
                         style={{ width: "100%", animation: "growWidth 2s ease-in-out" }} />
                  </div>
                  <button 
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
                    onClick={() => setShowPaymentSuccess(false)}
                  >
                    Continuar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Animación de pago fallido */}
          {showPaymentFailed && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
              <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full transform transition-all duration-500 ease-in-out translate-y-0 opacity-100"
                   style={{ animation: "slideInFromBottom 0.5s ease-in-out" }}>
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6 animate-pulse">
                    <XCircle className="w-10 h-10 text-red-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Pago cancelado</h2>
                  <p className="text-gray-600 text-center mb-6">
                    El proceso de pago fue cancelado o no se pudo completar.
                  </p>
                  <div className="flex gap-4">
                    <button 
                      className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all"
                      onClick={() => setShowPaymentFailed(false)}
                    >
                      Cerrar
                    </button>
                    <button 
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
                      onClick={() => setOpen(true)}
                    >
                      Intentar de nuevo
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}          <div className="max-w-lg w-full bg-white rounded-lg shadow p-8 border border-green-100">
            {profileLoading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-600">Cargando perfil...</p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-3xl font-bold text-green-700 shadow">
                    {profile?.nombre_inversor?.charAt(0) || "I"}
                  </div>
                  <div>
                    <div className="font-semibold text-2xl">
                      {profile ? `${profile.nombre_inversor} ${profile.apellido_inversor}` : "Inversor"}
                    </div>
                    <div className="text-gray-500 text-sm flex items-center gap-2">
                      <User className="w-4 h-4" /> {profile?.email || "inversor@email.com"}
                    </div>
                    <div className="text-gray-500 text-sm flex items-center gap-2 mt-1">
                      <CreditCard className="w-4 h-4" /> {profile?.experiencia || "Inversor"}
                    </div>
                  </div>
                </div>
                <div className="mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 font-medium">Saldo disponible:</span>
                    <div>
                      {walletLoading ? (
                        <span className="text-gray-400 text-lg">Cargando...</span>
                      ) : (
                        <span className="text-green-600 font-bold text-2xl">${saldo.toFixed(2)}</span>
                      )}
                    </div>
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
                    <li><span className="font-medium">Nombre completo:</span> {profile ? `${profile.nombre_inversor} ${profile.apellido_inversor}` : "No disponible"}</li>
                    <li><span className="font-medium">DNI:</span> {profile?.dni || "No disponible"}</li>
                    <li><span className="font-medium">Teléfono:</span> {profile?.telefono || "No disponible"}</li>
                    <li><span className="font-medium">País:</span> {profile?.pais || "No disponible"}</li>
                    <li><span className="font-medium">Tipo de cuenta:</span> Inversor</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Actividad reciente</h3>
                  {recentActivity && recentActivity.length > 0 ? (
                    <ul className="text-gray-700 space-y-1 text-sm">
                      {recentActivity.slice(0, 5).map((activity, index) => (
                        <li key={index}>
                          • Recargaste ${parseFloat(activity.monto).toFixed(2)} el {new Date(activity.fecha_recarga).toLocaleDateString("pe-ES")} a las {new Date(activity.fecha_recarga).toLocaleTimeString("pe-PE")}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 text-sm italic">No hay actividad reciente para mostrar</p>                  )}
                </div>
              </>
            )}
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
                    disabled={loading}
                  />
                  {mensaje && (
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mb-4 text-sm text-blue-700">
                      {mensaje}
                    </div>
                  )}
                  <button
                    className={`px-4 py-2 ${loading ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'} text-white rounded w-full flex items-center justify-center`}
                    onClick={handleRecargar}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Procesando...
                      </>
                    ) : (
                      'Recargar'
                    )}
                  </button>
                  <button
                    className="mt-2 px-4 py-2 w-full rounded border border-gray-300 text-gray-700 hover:bg-gray-100"
                    onClick={() => setOpen(false)}
                  >
                    Cancelar
                  </button>

                  <div className="mt-4 text-xs text-gray-500 flex items-center justify-center">
                    <svg className="w-4 h-4 mr-1" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 11H5C3.89543 11 3 11.8954 3 13V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V13C21 11.8954 20.1046 11 19 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M7 11V7C7 5.93913 7.42143 4.92172 8.17157 4.17157C8.92172 3.42143 9.93913 3 11 3H13C14.0609 3 15.0783 3.42143 15.8284 4.17157C16.5786 4.92172 17 5.93913 17 7V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Pago seguro procesado por Stripe
                  </div>
                </div>
              </div>
            )}        </main>
      </div>
    </SidebarProvider>
  );
}
