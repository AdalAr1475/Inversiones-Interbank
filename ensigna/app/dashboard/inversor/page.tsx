'use client';

import { ArrowUpRight, TrendingUp, DollarSign, PieChart, Eye } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import HeaderLat from "@/components/header-lat";
import ProtectedRoute from "@/components/ProtectedRoute"
import MisInversionesSection from "@/components/mis-inversiones-section"
import NuevasOportunidadesSection from "@/components/nuevas-oportunidades-section"

export default function DashboardInversor() {
  return (
    <ProtectedRoute requiredRole="inversor">
      <div className="min-h-screen bg-gray-50">
        <HeaderLat />
        <div className="ml-56 transition-all duration-300">
          {/* Main Content */}
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Dashboard del Inversor</h1>
              <p className="text-gray-600">Gestiona tus inversiones y descubre nuevas oportunidades</p>
            </div>

            {/* Stats Cards */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Portafolio Total</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">$125,000</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600 flex items-center">
                      <ArrowUpRight className="w-3 h-3 mr-1" />
                      +12.5%
                    </span>
                    desde el mes pasado
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Inversiones Activas</CardTitle>
                  <PieChart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">8</div>
                  <p className="text-xs text-muted-foreground">En 6 sectores diferentes</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Rendimiento Promedio</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">18.2%</div>
                  <p className="text-xs text-muted-foreground">Anualizado</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Nuevas Oportunidades</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">23</div>
                  <p className="text-xs text-muted-foreground">Disponibles esta semana</p>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="portafolio" className="space-y-6">
              <TabsList>
                <TabsTrigger value="portafolio">Mi Portafolio</TabsTrigger>
                <TabsTrigger value="oportunidades">Nuevas Oportunidades</TabsTrigger>
              </TabsList>              <TabsContent value="portafolio" className="space-y-6">
                <MisInversionesSection />
              </TabsContent>              <TabsContent value="oportunidades" className="space-y-6">
                <NuevasOportunidadesSection />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
