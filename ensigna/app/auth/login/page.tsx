"use client"

import { ArrowRight, Building2, Eye, EyeOff, Mail, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { useState } from "react"
import { jwtDecode } from "jwt-decode"
import { useEffect } from "react";
import { redirect } from "next/navigation"

export default function LoginPage() {
  
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  'const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;'

  const token = window?.localStorage?.getItem("token");
  
  interface DecodedToken {
    id: number
    email: string
    tipo_usuario: string
    exp: number
  }

  useEffect(() => {
    if (token) {
      const decodedToken = jwtDecode<DecodedToken>(token);
      const currentTime = Date.now() / 1000;
      
      // Verificar si el token ha expirado
      if (decodedToken.exp < currentTime) {
        localStorage.removeItem("token");
        redirect("/auth/login")
        return
      }

      if (decodedToken.tipo_usuario === "emprendedor") {
        redirect("/dashboard/emprendedor")
      } else if (decodedToken.tipo_usuario === "inversor") {
        redirect("/dashboard/inversor")
      }
    }
  }, [token]);

  const handleLogin = async () => {
    setErrorMsg(null)
    try {
      const formData = new URLSearchParams()
      formData.append("username", email)
      formData.append("password", password)

      const response = await fetch("http://localhost:8000/auth/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      })

      let data = null
      try {
        data = await response.json()
      } catch (error){
        setErrorMsg("Error!")
      }

      if (!response.ok) {
        setErrorMsg(data?.detail || "Autenticación Fallida!")
        return
      }

      const token = data.access_token
      localStorage.setItem("token", token)
      const decodedToken = jwtDecode<DecodedToken>(token);

      if (decodedToken.tipo_usuario === "emprendedor") {
        redirect("/dashboard/emprendedor")
      } else if (decodedToken.tipo_usuario === "inversor") {
        redirect("/dashboard/inversor")
      }
    
    } catch (error) {
      console.log(error)
      setErrorMsg("Email o contraseña incorrectos.")
    }
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <div className="hidden lg:block space-y-8">
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
                <Building2 className="w-7 h-7 text-white" />
              </div>
              <span className="text-4xl font-bold text-green-800">Ensigna</span>
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-bold text-gray-900 leading-tight">
                Bienvenido de vuelta a la plataforma de
                <span className="text-green-600"> inversiones</span>
              </h1>
              <p className="text-xl text-gray-600">
                Conecta con oportunidades de inversión o encuentra el financiamiento que tu empredendimiento necesita.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-sm border border-green-100">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Building2 className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <div className="font-semibold text-gray-900">500+ Emprendimientos</div>
                <div className="text-sm text-gray-600">Buscando financiamiento</div>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-sm border border-green-100">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <ArrowRight className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <div className="font-semibold text-gray-900">$25M+ Financiados</div>
                <div className="text-sm text-gray-600">En proyectos exitosos</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full max-w-md mx-auto">
          <Card className="border-green-100 shadow-xl">
            <CardHeader className="space-y-4 text-center">
              <div className="lg:hidden flex items-center justify-center space-x-2">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl font-bold text-green-800">Ensigna</span>
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">Iniciar Sesión</CardTitle>
              <CardDescription>Accede a tu cuenta para continuar</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email-inversor">Correo Electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email-inversor"
                    type="email"
                    placeholder="tu@email.com"
                    className="pl-10 border-green-200 focus:border-green-500 focus:ring-green-500"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password-inversor">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password-inversor"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10 pr-10 border-green-200 focus:border-green-500 focus:ring-green-500"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              {/* Mensaje de error */}
              {errorMsg && (
                <div className="text-red-600 text-sm font-semibold text-center mb-2">
                  {errorMsg}
                </div>
              )}

              <Button onClick={handleLogin} className="w-full cursor-pointer bg-green-600 hover:bg-green-700 text-white h-11">
                Iniciar Sesión
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              
              <div className="text-center text-sm text-gray-600">
                ¿No tienes una cuenta?{" "}
                <Link href="/auth/register" className="text-green-600 hover:text-green-700 font-semibold">
                  Regístrate aquí
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
