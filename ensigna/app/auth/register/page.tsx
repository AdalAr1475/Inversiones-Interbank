"use client"

import { ArrowRight, Building2, Eye, EyeOff, Mail, Lock, User, Phone, MapPin, FileText, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import { useEffect, useState } from "react"
import { redirect } from "next/navigation"
import { jwtDecode } from "jwt-decode"

export default function RegisterPage() {

  // Estados para los campos de inversor
  const [nombreInversor, setNombreInversor] = useState("");
  const [apellidoInversor, setApellidoInversor] = useState("");
  const [dni, setDni] = useState("");
  const [paisInversor, setPaisInversor] = useState("");
  const [emailInversor, setEmailInversor] = useState("");
  const [telefono, setTelefono] = useState("");
  const [experiencia, setExperiencia] = useState("");
  const [passwordInversor, setPasswordInversor] = useState("");
  const [confirmPasswordInversor, setConfirmPasswordInversor] = useState("");

  // Estados para los campos de empresa
  const [nombreEmpresa, setNombreEmpresa] = useState("");
  const [ruc, setRuc] = useState("");
  const [sector, setSector] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [emailEmpresa, setEmailEmpresa] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [passwordEmpresa, setPasswordEmpresa] = useState("");
  const [confirmPasswordEmpresa, setConfirmPasswordEmpresa] = useState("");

  const [userType, setUserType] = useState("inversor");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  interface DecodedToken {
      id: number
      sub: string
      tipo_usuario: string
      exp: number
  }
  
  useEffect(() => {
    if (token) {
      // Si ya está logueado, redirigir al dashboard correspondiente
      const decodedToken = jwtDecode<DecodedToken>(token);
      const currentTime = Date.now() / 1000;
      
      // Verificar si el token ha expirado
      if (decodedToken.exp < currentTime) {
        localStorage.removeItem("token");
        return
      }

      if (decodedToken.tipo_usuario === "empresa") {
        redirect("/dashboard/empresa")
      } else if (decodedToken.tipo_usuario === "inversor") {
        redirect("/dashboard/inversor")
      }
    }
  });

  // Función para registrar
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Validación de campos obligatorios
    if (userType === "inversor") {
      if (!nombreInversor || !apellidoInversor || !dni || !paisInversor || !experiencia || !emailInversor || !telefono || !passwordInversor || !confirmPasswordInversor) {
        setErrorMsg("Por favor, completa todos los campos requeridos");
        return;
      }
    } else {
      if (!nombreEmpresa || !ruc || !sector || !descripcion || !emailEmpresa || !ubicacion || !passwordEmpresa || !confirmPasswordEmpresa) {
        setErrorMsg("Por favor, completa todos los campos requeridos");
        return;
      }
    }

    // Validación de contraseñas
    if (userType === "inversor" && passwordInversor !== confirmPasswordInversor) {
      setErrorMsg("Las contraseñas no coinciden");
      return;
    } else if (userType === "empresa" && passwordEmpresa !== confirmPasswordEmpresa) {
      setErrorMsg("Las contraseñas no coinciden");
      return;
    }

    try {
      let url = "";
      let body = {};

      if (userType === "inversor") {
        if (passwordInversor !== confirmPasswordInversor) {
          setErrorMsg("Las contraseñas no coinciden");
          return;
        }
        url = "http://localhost:8000/users/create-inversor";
        body = {
          nombre_inversor: nombreInversor,
          apellido_inversor: apellidoInversor,
          dni: dni,
          pais: paisInversor,
          email: emailInversor,
          telefono: telefono,
          experiencia: experiencia,
          password: passwordInversor,
        };
      } else {
        if (passwordEmpresa !== confirmPasswordEmpresa) {
          setErrorMsg("Las contraseñas no coinciden");
          return;
        }
        url = "http://localhost:8000/users/create-empresa";
        body = {
          nombre_empresa: nombreEmpresa,
          ruc: ruc,
          sector: sector,
          descripcion: descripcion,
          ubicacion: ubicacion,
          email: emailEmpresa,
          password: passwordEmpresa,
        };
      }

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMsg(data.detail || "Error al crear la cuenta");
      } else {
        setSuccessMsg(data.message || "Cuenta creada exitosamente");
        // Limpiar campos o redirigir después de unos segundos
        setTimeout(() => {
          // Limpiar campos
          setNombreInversor("");
          setApellidoInversor("");
          setEmailInversor("");
          setTelefono("");
          setPasswordInversor("");
          setConfirmPasswordInversor("");
          setUserType("inversor");

          // Redirigir a login
          window.location.href = "/auth/login"; // Cambia esta línea si usas un router
        }, 2000); // Esperar 2 segundos antes de redirigir
      }
    } catch (error) {
      setErrorMsg("Error de conexión con el servidor");
    }
  };

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
                Únete a la comunidad de
                <span className="text-green-600"> inversiones</span> más grande
              </h1>
              <p className="text-xl text-gray-600">
                Crea tu cuenta y comienza a invertir en empresas prometedoras o encuentra el financiamiento que
                necesitas.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-sm border border-green-100">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <div className="font-semibold text-gray-900">2,000+ Inversores</div>
                <div className="text-sm text-gray-600">Activos en la plataforma</div>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-sm border border-green-100">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Building2 className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <div className="font-semibold text-gray-900">89% Tasa de Éxito</div>
                <div className="text-sm text-gray-600">En proyectos financiados</div>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-sm border border-green-100">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <ArrowRight className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <div className="font-semibold text-gray-900">Proceso 100% Digital</div>
                <div className="text-sm text-gray-600">Rápido y seguro</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Register Form */}
        <div className="w-full max-w-md mx-auto">
          <Card className="border-green-100 shadow-xl">
            <CardHeader className="space-y-4 text-center">
              <div className="lg:hidden flex items-center justify-center space-x-2">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl font-bold text-green-800">Ensigna</span>
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">Crear Cuenta</CardTitle>
              <CardDescription>Únete a la plataforma de inversiones</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">

              <Tabs value={userType} onValueChange={setUserType} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="inversor">Inversor</TabsTrigger>
                  <TabsTrigger value="empresa">Empresa</TabsTrigger>
                </TabsList>

                <TabsContent value="inversor" className="space-y-4 mt-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nombre">Nombre</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="nombre"
                          value = {nombreInversor}
                          onChange={(e) => setNombreInversor(e.target.value)}
                          placeholder="Juan"
                          className="pl-10 border-green-200 focus:border-green-500 focus:ring-green-500"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="apellido">Apellido</Label>
                      <Input
                        id="apellido"
                        value={apellidoInversor}
                        onChange={(e) => setApellidoInversor(e.target.value)}
                        placeholder="Pérez"
                        className="border-green-200 focus:border-green-500 focus:ring-green-500"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dni">DNI</Label>
                      <div className="relative">
                        <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="dni"
                          value={dni}
                          onChange={(e) => setDni(e.target.value)}
                          placeholder="12345678"
                          className="pl-10 border-green-200 focus:border-green-500 focus:ring-green-500"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pais">País</Label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="pais"
                          value={paisInversor}
                          onChange={(e) => setPaisInversor(e.target.value)}
                          placeholder="Perú"
                          className="pl-10 border-green-200 focus:border-green-500 focus:ring-green-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email-inversor">Correo Electrónico</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="email-inversor"
                        type="email"
                        value={emailInversor}
                        onChange={(e) => setEmailInversor(e.target.value)}
                        placeholder="juan@email.com"
                        className="pl-10 border-green-200 focus:border-green-500 focus:ring-green-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="telefono">Teléfono</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="telefono"
                        value={telefono}
                        onChange={(e) => setTelefono(e.target.value)}
                        placeholder="+1 234 567 8900"
                        className="pl-10 border-green-200 focus:border-green-500 focus:ring-green-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experiencia">Experiencia en Inversiones</Label>
                    <Select value={experiencia} onValueChange={setExperiencia}>
                      <SelectTrigger className="border-green-200 focus:border-green-500 focus:ring-green-500">
                        <SelectValue placeholder="Selecciona tu nivel" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="principiante">Principiante</SelectItem>
                        <SelectItem value="intermedio">Intermedio</SelectItem>
                        <SelectItem value="avanzado">Avanzado</SelectItem>
                        <SelectItem value="profesional">Profesional</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password-inversor">Contraseña</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="password-inversor"
                        type={showPassword ? "text" : "password"}
                        value={passwordInversor}
                        onChange={(e) => setPasswordInversor(e.target.value)}
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

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirmar Contraseña</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPasswordInversor}
                        onChange={(e) => setConfirmPasswordInversor(e.target.value)}
                        placeholder="••••••••"
                        className="pl-10 pr-10 border-green-200 focus:border-green-500 focus:ring-green-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="empresa" className="space-y-4 mt-6">
                  <div className="space-y-2">
                    <Label htmlFor="empresa-nombre">Nombre de la Empresa</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="empresa-nombre"
                        value={nombreEmpresa}
                        onChange={(e) => setNombreEmpresa(e.target.value)}
                        placeholder="Mi Empresa S.A."
                        className="pl-10 border-green-200 focus:border-green-500 focus:ring-green-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ruc">RUC</Label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="ruc"
                        value={ruc}
                        onChange={(e) => setRuc(e.target.value)}
                        placeholder="20123456789"
                        className="pl-10 border-green-200 focus:border-green-500 focus:ring-green-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sector">Sector</Label>
                    <Select value={sector} onValueChange={setSector}>
                      <SelectTrigger className="border-green-200 focus:border-green-500 focus:ring-green-500">
                        <SelectValue placeholder="Selecciona el sector" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tecnologia">Tecnología</SelectItem>
                        <SelectItem value="fintech">Energia</SelectItem>
                        <SelectItem value="salud">Salud</SelectItem>
                        <SelectItem value="educacion">Educación</SelectItem>
                        <SelectItem value="ecommerce">E-commerce</SelectItem>
                        <SelectItem value="sostenibilidad">Sostenibilidad</SelectItem>
                        <SelectItem value="agricultura">Agricultura</SelectItem>
                        <SelectItem value="transporte">Transporte</SelectItem>
                        <SelectItem value="logistica">Logistica</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email-empresa">Correo Empresarial</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="email-empresa"
                        value={emailEmpresa}
                        onChange={(e) => setEmailEmpresa(e.target.value)}
                        type="email"
                        placeholder="contacto@empresa.com"
                        className="pl-10 border-green-200 focus:border-green-500 focus:ring-green-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ubicacion">Ubicación</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="ubicacion"
                        value={ubicacion}
                        onChange={(e) => setUbicacion(e.target.value)}
                        placeholder="Ciudad, País"
                        className="pl-10 border-green-200 focus:border-green-500 focus:ring-green-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="descripcion">Descripción Breve</Label>
                    <Textarea
                      id="descripcion"
                      value={descripcion}
                      onChange={(e) => setDescripcion(e.target.value)}
                      placeholder="Describe brevemente tu empresa y lo que hace..."
                      className="border-green-200 focus:border-green-500 focus:ring-green-500 min-h-[80px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password-empresa">Contraseña</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="password-empresa"
                        value={passwordEmpresa}
                        onChange={(e) => setPasswordEmpresa(e.target.value)}
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

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password-empresa">Confirmar Contraseña</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="confirm-password-empresa"
                        value={confirmPasswordEmpresa}
                        onChange={(e) => setConfirmPasswordEmpresa(e.target.value)}
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-10 pr-10 border-green-200 focus:border-green-500 focus:ring-green-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              {errorMsg && (
                <div className="text-red-600 text-sm font-semibold text-center mb-2">
                  {errorMsg}
                </div>
              )}
              {successMsg && (
                <div className="text-green-600 text-sm font-semibold text-center mb-2">
                  {successMsg}
                </div>
              )}

              <Button type="submit" onClick={handleRegister} className="w-full bg-green-600 hover:bg-green-700 text-white h-11">
                Crear Cuenta
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              <div className="text-center text-sm text-gray-600">
                ¿Ya tienes una cuenta?{" "}
                <Link href="/auth/login" className="text-green-600 hover:text-green-700 font-semibold">
                  Inicia sesión aquí
                </Link>
              </div>

            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
