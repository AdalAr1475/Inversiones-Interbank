"use client"

import { ArrowRight, Building2, Eye, EyeOff, Mail, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { useState } from "react"
import { redirect } from "next/navigation"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [userType, setUserType] = useState("inversor")
  const handleLogin = () => {

    userType === "inversor" ? redirect("/dashboard/inversor") : redirect("/dashboard/empresa")
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
                Conecta con oportunidades de inversión o encuentra el financiamiento que tu empresa necesita.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-sm border border-green-100">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Building2 className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <div className="font-semibold text-gray-900">500+ Empresas</div>
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
              <Tabs value={userType} onValueChange={setUserType} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="inversor">Inversor</TabsTrigger>
                  <TabsTrigger value="empresa">Empresa</TabsTrigger>
                </TabsList>

                <TabsContent value="inversor" className="space-y-4 mt-6">
                  <div className="space-y-2">
                    <Label htmlFor="email-inversor">Correo Electrónico</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="email-inversor"
                        type="email"
                        placeholder="tu@email.com"
                        className="pl-10 border-green-200 focus:border-green-500 focus:ring-green-500"
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
                </TabsContent>

                <TabsContent value="empresa" className="space-y-4 mt-6">
                  <div className="space-y-2">
                    <Label htmlFor="email-empresa">Correo Empresarial</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="email-empresa"
                        type="email"
                        placeholder="contacto@empresa.com"
                        className="pl-10 border-green-200 focus:border-green-500 focus:ring-green-500"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password-empresa">Contraseña</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="password-empresa"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-10 pr-10 border-green-200 focus:border-green-500 focus:ring-green-500"
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
                </TabsContent>
              </Tabs>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox id="remember" className="border-green-300 data-[state=checked]:bg-green-600" />
                  <Label htmlFor="remember" className="text-sm text-gray-600">
                    Recordarme
                  </Label>
                </div>
                <Link href="/auth/forgot-password" className="text-sm text-green-600 hover:text-green-700">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

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

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">O continúa con</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="border-green-200 hover:bg-green-50">
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Google
                </Button>
                <Button variant="outline" className="border-green-200 hover:bg-green-50">
                  <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                  </svg>
                  Twitter
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
