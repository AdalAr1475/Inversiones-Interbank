"use client";

import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import {
  ArrowUpRight,
  TrendingUp,
  DollarSign,
  PieChart,
  Eye,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import HeaderLat from "@/components/header-lat";
import ProtectedRoute from "@/components/ProtectedRoute";
import MisInversionesSection from "@/components/mis-inversiones-section";
import NuevasOportunidadesSection from "@/components/nuevas-oportunidades-section";
import MisContratosSeccion from "@/components/mis-contratos-seccion";
import { getInvestSummary, InvestSummary } from "@/api/invest";

export default function DashboardInversor() {
  // Estado para el resumen de inversiones
  const [investSummary, setInvestSummary] = useState<InvestSummary | null>(null);
  const [loading, setLoading] = useState(true);

  interface DecodedToken {
    id: string;
    rol: string;
    exp: number;
  }

  useEffect(() => {
    // Función para cargar los datos del resumen de inversiones
    const loadInvestmentSummary = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("No se encontró el token de autenticación");
          setLoading(false);
          return;
        }

        // Decodificar el token para obtener el ID del usuario
        const decodedToken = jwtDecode<DecodedToken>(token);
        const usuarioId = parseInt(decodedToken.id);

        // Obtener el resumen de inversiones
        const summary = await getInvestSummary(usuarioId, token);
        setInvestSummary(summary);
      } catch (error) {
        console.error("Error al cargar el resumen de inversiones:", error);
      } finally {
        setLoading(false);
      }
    };

    loadInvestmentSummary();
  }, []);

  // Formatear el monto del portafolio con separadores de miles
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('es-ES', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  };

  return (
    <ProtectedRoute requiredRole="inversor">
      <div className="min-h-screen bg-gray-50">
        <HeaderLat />
        <div className="ml-56 transition-all duration-300">
          {/* Main Content */}
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">
                Dashboard del Inversor
              </h1>
              <p className="text-gray-600">
                Gestiona tus inversiones y descubre nuevas oportunidades
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Portafolio Total
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="h-8 w-32 bg-gray-200 animate-pulse rounded"></div>
                  ) : (
                    <div className="text-2xl font-bold text-green-600">
                      {investSummary ? formatCurrency(investSummary.porfolio_total) : "$0"}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600 flex items-center">
                      <ArrowUpRight className="w-3 h-3 mr-1" />
                      +5.2%
                    </span>
                    desde el mes pasado
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Inversiones Activas
                  </CardTitle>
                  <PieChart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
                  ) : (
                    <div className="text-2xl font-bold">
                      {investSummary ? investSummary.proyectos_activos : 0}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    En diversos sectores
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Rendimiento Promedio
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">15.8%</div>
                  <p className="text-xs text-muted-foreground">Anualizado</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Nuevas Oportunidades
                  </CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
                  ) : (
                    <div className="text-2xl font-bold">
                      {investSummary ? investSummary.proyectos_disponibles : 0}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Disponibles ahora
                  </p>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="portafolio" className="space-y-6">
              <TabsList>
                <TabsTrigger value="portafolio">Mi Portafolio</TabsTrigger>
                <TabsTrigger value="oportunidades">
                  Nuevas Oportunidades
                </TabsTrigger>
                <TabsTrigger value="contratos">
                  Mis contratos
                </TabsTrigger>
              </TabsList>{" "}
              <TabsContent value="portafolio" className="space-y-6">
                <MisInversionesSection />
              </TabsContent>{" "}
              <TabsContent value="oportunidades" className="space-y-6">
                <NuevasOportunidadesSection />
              </TabsContent>
              <TabsContent value="contratos" className="space-y-6">
                <MisContratosSeccion />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
