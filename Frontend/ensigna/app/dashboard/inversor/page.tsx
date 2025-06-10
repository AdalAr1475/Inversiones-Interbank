import { ArrowUpRight, TrendingUp, DollarSign, PieChart, Building2, Eye, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import HeaderLat from "@/components/header-lat";

export default function DashboardInversor() {
  return (
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
              <TabsTrigger value="historial">Historial</TabsTrigger>
            </TabsList>

            <TabsContent value="portafolio" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Mis Inversiones</CardTitle>
                  <CardDescription>Estado actual de tus inversiones activas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Building2 className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">TechStart AI</h3>
                          <p className="text-sm text-gray-600">Tecnología • Invertido: $15,000</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Progress value={85} className="w-20 h-2" />
                            <span className="text-xs text-gray-500">85% financiado</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-green-600">+22.5%</div>
                        <div className="text-sm text-gray-600">$18,375</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                          <Building2 className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">EcoSolutions</h3>
                          <p className="text-sm text-gray-600">Sostenibilidad • Invertido: $25,000</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Progress value={62} className="w-20 h-2" />
                            <span className="text-xs text-gray-500">62% financiado</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-green-600">+15.8%</div>
                        <div className="text-sm text-gray-600">$28,950</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Building2 className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">FinanceFlow</h3>
                          <p className="text-sm text-gray-600">Fintech • Invertido: $10,000</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Progress value={43} className="w-20 h-2" />
                            <span className="text-xs text-gray-500">43% financiado</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-red-600">-2.1%</div>
                        <div className="text-sm text-gray-600">$9,790</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="oportunidades" className="space-y-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge className="bg-orange-100 text-orange-800">E-commerce</Badge>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600 ml-1">4.8</span>
                      </div>
                    </div>
                    <CardTitle className="text-green-800">ShopTech</CardTitle>
                    <CardDescription>Plataforma de e-commerce con IA</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Objetivo:</span>
                        <span className="font-semibold">$800,000</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Mín. inversión:</span>
                        <span className="font-semibold">$5,000</span>
                      </div>
                      <Progress value={28} className="w-full" />
                      <div className="text-sm text-gray-600">28% financiado • 45 días restantes</div>
                      <Button className="w-full bg-green-600 hover:bg-green-700 text-white">Ver Detalles</Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge className="bg-red-100 text-red-800">Salud</Badge>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600 ml-1">4.6</span>
                      </div>
                    </div>
                    <CardTitle className="text-green-800">MedConnect</CardTitle>
                    <CardDescription>Telemedicina para zonas rurales</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Objetivo:</span>
                        <span className="font-semibold">$600,000</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Mín. inversión:</span>
                        <span className="font-semibold">$2,500</span>
                      </div>
                      <Progress value={67} className="w-full" />
                      <div className="text-sm text-gray-600">67% financiado • 22 días restantes</div>
                      <Button className="w-full bg-green-600 hover:bg-green-700 text-white">Ver Detalles</Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge className="bg-yellow-100 text-yellow-800">Educación</Badge>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600 ml-1">4.9</span>
                      </div>
                    </div>
                    <CardTitle className="text-green-800">EduTech Pro</CardTitle>
                    <CardDescription>Plataforma de educación online</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Objetivo:</span>
                        <span className="font-semibold">$400,000</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Mín. inversión:</span>
                        <span className="font-semibold">$1,000</span>
                      </div>
                      <Progress value={91} className="w-full" />
                      <div className="text-sm text-gray-600">91% financiado • 8 días restantes</div>
                      <Button className="w-full bg-green-600 hover:bg-green-700 text-white">Ver Detalles</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="historial" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Historial de Inversiones</CardTitle>
                  <CardDescription>Todas tus inversiones pasadas y actuales</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border-l-4 border-green-500 bg-green-50 rounded">
                      <div>
                        <h4 className="font-semibold">TechStart AI</h4>
                        <p className="text-sm text-gray-600">Inversión completada • 15 Nov 2024</p>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">$15,000</div>
                        <div className="text-sm text-green-600">+22.5% ROI</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 border-l-4 border-blue-500 bg-blue-50 rounded">
                      <div>
                        <h4 className="font-semibold">EcoSolutions</h4>
                        <p className="text-sm text-gray-600">En progreso • 28 Oct 2024</p>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">$25,000</div>
                        <div className="text-sm text-green-600">+15.8% ROI</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 border-l-4 border-yellow-500 bg-yellow-50 rounded">
                      <div>
                        <h4 className="font-semibold">RetailTech</h4>
                        <p className="text-sm text-gray-600">Finalizada • 12 Sep 2024</p>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">$8,000</div>
                        <div className="text-sm text-green-600">+31.2% ROI</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
