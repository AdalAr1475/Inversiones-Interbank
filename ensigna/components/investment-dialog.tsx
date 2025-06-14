"use client"

import { Button } from "@/components/ui/button"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useEffect, useCallback } from "react"
import { ProyectoType } from "@/types/proyecto"
import { AlertCircle, CheckCircle, Wallet } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { getWalletBalance } from "@/api/wallet"
import { transferFunds } from "@/api/stripe"
import { jwtDecode } from "jwt-decode"
import { TransferRequestType } from "@/types/stripe"
interface InvestmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  project: ProyectoType
  onSuccess?: (amount: number) => void
}

interface DecodedToken {
  id: string
  sub: string
  tipo_usuario: string
  exp: number
}

export default function InvestmentDialog({ open, onOpenChange, project, onSuccess }: InvestmentDialogProps) {
  const [amount, setAmount] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [success, setSuccess] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [userBalance, setUserBalance] = useState<number>(0);
  const [walletLoading, setWalletLoading] = useState<boolean>(true);
    // Obtener el ID de usuario desde el token JWT
  const getUserId = useCallback((): string => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return "";
      
      const decoded = jwtDecode<DecodedToken>(token);
      return decoded.id;
    } catch (error) {
      console.error("Error al decodificar el token:", error);
      return "";
    }
  }, []);
  // Obtener el saldo de la wallet del usuario
  const fetchWalletBalance = useCallback(async () => {
    try {
      setWalletLoading(true);
      const token = localStorage.getItem("token");
      const userId = getUserId();
      
      if (!userId || !token) throw new Error("Usuario no autenticado");
      
      const walletData = await getWalletBalance(token, parseInt(userId));
      // El saldo viene como string desde la API, lo convertimos a número
      setUserBalance(parseFloat(walletData.saldo));
    } catch (error) {
      console.error("Error al obtener el saldo de la wallet:", error);
      setError("Error al obtener el saldo. Inténtalo de nuevo más tarde.");
    } finally {
      setWalletLoading(false);
    }
  }, [getUserId]);
    useEffect(() => {
    if (open) {
      fetchWalletBalance();
    }
  }, [open, fetchWalletBalance]);
  
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers and decimals
    const value = e.target.value
    if (value === "" || /^\d+(\.\d{0,2})?$/.test(value)) {
      setAmount(value)
    }
  }
    const handleInvest = async () => {
    try {
      setIsSubmitting(true)
      setError(null)
      
      // Obtener el token y el ID de usuario
      const token = localStorage.getItem("token");
      const userId = getUserId();
      
      if (!token || !userId) {
        setError("Necesitas iniciar sesión para invertir")
        setIsSubmitting(false)
        return
      }
      
      // Validate amount
      const amount_val = parseFloat(amount)
      if (isNaN(amount_val) || amount_val <= 0) {
        setError("Por favor ingresa un monto válido")
        setIsSubmitting(false)
        return
      }
      
      // Actualizar el saldo antes de confirmar la inversión
      try {
        // Verificamos el saldo actual
        const walletData = await getWalletBalance(token, parseInt(userId));
        const currentBalance = parseFloat(walletData.saldo);
        
        if (amount_val > currentBalance) {
          setError("No tienes suficiente saldo en tu cuenta. Por favor recarga tu saldo en la sección de Mi Perfil.")
          setIsSubmitting(false)
          return
        }
        
        // Actualizar el saldo mostrado
        setUserBalance(currentBalance);
      } catch (walletError) {
        console.error("Error al verificar el saldo:", walletError);
        setError("No se pudo verificar tu saldo actual. Inténtalo de nuevo.");
        setIsSubmitting(false)
        return
      }
        // Convertir el monto a centavos para la API de Stripe
      const amountCents = Math.round(amount_val * 100);
      
      // Realizar la transferencia de fondos con los valores solicitados
      // El inversor_id se obtiene del token decodificado
      // El proyecto_id se obtiene de la propiedad id del proyecto
      // El tipo se establece como "inversion"
      const result = await transferFunds({
        amount_cents: amountCents,
        connected_account_id: "",
        description: "",
        inversor_id: userId.toString(),
        proyecto_id: project.id.toString(),
        tipo: "inversion"
      });

      console.log("Transferencia realizada:", result);
      
      setSuccess(true)
      
      // Notify parent component about successful investment
      if (onSuccess) {
        onSuccess(amount_val);
      }
      
      // Reset form after another delay
      setTimeout(() => {
        setAmount("")
        setSuccess(false)
        onOpenChange(false)
      }, 2000)
    } catch {
      setError("Ocurrió un error al procesar tu inversión. Inténtalo de nuevo.")
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // Format currency
  const formatCurrency = (value: number): string => {
    return value.toLocaleString('es-ES', { style: 'currency', currency: 'USD' })
  }
  
  // Calculate percentage completed
  const percentageCompleted = project.monto_requerido > 0 
    ? Math.min(Math.round((project.monto_recaudado / project.monto_requerido) * 100), 100)
    : 0

  const resetDialog = () => {
    setAmount("")
    setSuccess(false)
    setError(null)
  }
  
  return (
    <Dialog 
      open={open} 
      onOpenChange={(newOpen) => {
        if (!newOpen) resetDialog()
        onOpenChange(newOpen)
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Invertir en {project.titulo}</DialogTitle>
          <DialogDescription>
            Ingresa el monto que deseas invertir en este proyecto.
          </DialogDescription>
        </DialogHeader>
        
        {success ? (
          <div className="py-6">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <h3 className="text-center font-medium text-lg mb-2">¡Inversión exitosa!</h3>
            <p className="text-center text-gray-500 mb-4">
              Tu inversión de {formatCurrency(parseFloat(amount) || 0)} ha sido procesada correctamente.
            </p>
            <p className="text-center text-gray-500">
              Recibirás un correo electrónico con los detalles de la operación.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-6 py-4">
              {/* Project info */}
              <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium">Detalles del proyecto</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-gray-500">Objetivo:</div>
                  <div className="font-medium text-right">{formatCurrency(project.monto_requerido)}</div>
                  
                  <div className="text-gray-500">Recaudado:</div>
                  <div className="font-medium text-right">{formatCurrency(project.monto_recaudado)}</div>
                  
                  <div className="text-gray-500">Progreso:</div>
                  <div className="font-medium text-right">{percentageCompleted}%</div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2 my-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${percentageCompleted}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="flex items-center justify-between bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <Wallet className="w-5 h-5 text-blue-600 mr-3" />
                  <span className="text-sm font-medium">Saldo disponible:</span>
                </div>
                <span className="font-medium text-blue-600">{formatCurrency(userBalance)}</span>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-right">
                  Monto a invertir
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    id="amount"
                    className="pl-8"
                    placeholder="0.00"
                    value={amount}
                    onChange={handleAmountChange}
                    autoFocus
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Ingresa el monto que deseas invertir en este proyecto.
                </p>
              </div>
              
              <Separator />
              
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Monto a invertir:</span>
                  <span className="font-medium">{formatCurrency(parseFloat(amount) || 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Comisión de plataforma:</span>
                  <span className="font-medium">{formatCurrency((parseFloat(amount) || 0) * 0.02)}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between items-center font-medium">
                  <span>Total:</span>
                  <span className="text-green-600">{formatCurrency((parseFloat(amount) || 0) * 1.02)}</span>
                </div>
              </div>
              
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleInvest} 
                disabled={!amount || isSubmitting || parseFloat(amount) <= 0}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? "Procesando..." : "Confirmar inversión"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
