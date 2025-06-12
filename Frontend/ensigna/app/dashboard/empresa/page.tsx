import {
  ArrowUpRight,
  Users,
  DollarSign,
  Calendar,
  TrendingUp,
  Building2,
  Plus,
  Eye,
  MessageSquare,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import HeaderLat from "@/components/header-lat"
import ProtectedRoute from "@/components/ProtectedRoute"

export default function DashboardEmpresa() {
  return (
    <ProtectedRoute requiredRole="empresa">
      <div className="min-h-screen bg-gray-50">
        <HeaderLat />
        <div className="ml-56 transition-all duration-300">
          {/* Main Content */}

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Dashboard de Empresa</h1>
              <p className="text-gray-600">Gestiona tu campaña de financiamiento y conecta con inversores</p>
            </div>

            {/* Stats Cards */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Recaudado</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">$425,000</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600 flex items-center">
                      <ArrowUpRight className="w-3 h-3 mr-1" />
                      85%
                    </span>
                    del objetivo ($500K)
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Inversores</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">23</div>
                  <p className="text-xs text-muted-foreground">+3 esta semana</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Días Restantes</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground">de 60 días totales</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Visualizaciones</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1,247</div>
                  <p className="text-xs text-muted-foreground">+89 esta semana</p>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="campana" className="space-y-6">
              <TabsList>
                <TabsTrigger value="campana">Mi Campaña</TabsTrigger>
                <TabsTrigger value="inversores">Inversores</TabsTrigger>
                <TabsTrigger value="mensajes">Mensajes</TabsTrigger>
                <TabsTrigger value="documentos">Documentos</TabsTrigger>
              </TabsList>

              <TabsContent value="campana" className="space-y-6">
                <div className="grid lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle>Estado de la Campaña</CardTitle>
                          <Badge className="bg-green-100 text-green-800">Activa</Badge>
                        </div>
                        <CardDescription>TechStart AI - Plataforma de IA para automatización empresarial</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Progreso del financiamiento</span>
                            <span className="text-sm font-semibold">85% completado</span>
                          </div>
                          <Progress value={85} className="w-full h-3" />
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Recaudado:</span>
                              <div className="font-semibold text-green-600">$425,000</div>
                            </div>
                            <div>
                              <span className="text-gray-600">Objetivo:</span>
                              <div className="font-semibold">$500,000</div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Actividad Reciente</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                              <DollarSign className="w-4 h-4 text-white" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">Nueva inversión de $25,000</p>
                              <p className="text-xs text-gray-600">Roberto Silva • Hace 2 horas</p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                              <MessageSquare className="w-4 h-4 text-white" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">Nuevo mensaje de inversor</p>
                              <p className="text-xs text-gray-600">María González • Hace 5 horas</p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                              <Eye className="w-4 h-4 text-white" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">89 nuevas visualizaciones</p>
                              <p className="text-xs text-gray-600">Esta semana</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Acciones Rápidas</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                          <Plus className="w-4 h-4 mr-2" />
                          Actualizar Campaña
                        </Button>
                        <Button variant="outline" className="w-full">
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Mensaje a Inversores
                        </Button>
                        <Button variant="outline" className="w-full">
                          <TrendingUp className="w-4 h-4 mr-2" />
                          Ver Análisis
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Métricas Clave</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Tasa de conversión</span>
                          <span className="text-sm font-semibold">18.5%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Inversión promedio</span>
                          <span className="text-sm font-semibold">$18,478</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Tiempo promedio</span>
                          <span className="text-sm font-semibold">3.2 días</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="inversores" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Mis Inversores</CardTitle>
                    <CardDescription>Lista de todos los inversores en tu campaña</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-semibold">
                            R
                          </div>
                          <div>
                            <h3 className="font-semibold">Roberto Silva</h3>
                            <p className="text-sm text-gray-600">Inversor Ángel • Hace 2 horas</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-green-600">$25,000</div>
                          <Button size="sm" variant="outline">
                            <MessageSquare className="w-4 h-4 mr-1" />
                            Mensaje
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                            M
                          </div>
                          <div>
                            <h3 className="font-semibold">María González</h3>
                            <p className="text-sm text-gray-600">Empresaria • Hace 1 día</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-green-600">$15,000</div>
                          <Button size="sm" variant="outline">
                            <MessageSquare className="w-4 h-4 mr-1" />
                            Mensaje
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                            C
                          </div>
                          <div>
                            <h3 className="font-semibold">Carlos Rodríguez</h3>
                            <p className="text-sm text-gray-600">Fondo de Inversión • Hace 3 días</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-green-600">$50,000</div>
                          <Button size="sm" variant="outline">
                            <MessageSquare className="w-4 h-4 mr-1" />
                            Mensaje
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="mensajes" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Centro de Mensajes</CardTitle>
                    <CardDescription>Comunicación con inversores actuales y potenciales</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 border-l-4 border-green-500 bg-green-50 rounded">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                              R
                            </div>
                            <span className="font-semibold">Roberto Silva</span>
                          </div>
                          <span className="text-sm text-gray-600">Hace 2 horas</span>
                        </div>
                        <p className="text-gray-700">
                          "Excelente propuesta. Me interesa mucho el enfoque de IA que están desarrollando. ¿Podrían
                          enviarme más detalles sobre el roadmap técnico?"
                        </p>
                        <Button size="sm" className="mt-3 bg-green-600 hover:bg-green-700 text-white">
                          Responder
                        </Button>
                      </div>

                      <div className="p-4 border-l-4 border-blue-500 bg-blue-50 rounded">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                              M
                            </div>
                            <span className="font-semibold">María González</span>
                          </div>
                          <span className="text-sm text-gray-600">Hace 5 horas</span>
                        </div>
                        <p className="text-gray-700">
                          "¿Cuál es el plan de escalabilidad para los próximos 3 años? Me gustaría entender mejor cómo
                          planean usar el financiamiento."
                        </p>
                        <Button size="sm" className="mt-3 bg-green-600 hover:bg-green-700 text-white">
                          Responder
                        </Button>
                      </div>

                      <div className="p-4 border-l-4 border-yellow-500 bg-yellow-50 rounded">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-yellow-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                              A
                            </div>
                            <span className="font-semibold">Ana Martínez</span>
                          </div>
                          <span className="text-sm text-gray-600">Hace 1 día</span>
                        </div>
                        <p className="text-gray-700">
                          "Felicitaciones por el progreso. ¿Tienen planes de expansión internacional?"
                        </p>
                        <Button size="sm" className="mt-3 bg-green-600 hover:bg-green-700 text-white">
                          Responder
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="documentos" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Documentos de la Campaña</CardTitle>
                    <CardDescription>Gestiona todos los documentos relacionados con tu financiamiento</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">Plan de Negocio</h3>
                            <p className="text-sm text-gray-600">Actualizado hace 2 días</p>
                          </div>
                          <Badge className="bg-green-100 text-green-800">Público</Badge>
                        </div>
                      </div>

                      <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">Estados Financieros</h3>
                            <p className="text-sm text-gray-600">Actualizado hace 1 semana</p>
                          </div>
                          <Badge variant="outline">Privado</Badge>
                        </div>
                      </div>

                      <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">Pitch Deck</h3>
                            <p className="text-sm text-gray-600">Actualizado hace 3 días</p>
                          </div>
                          <Badge className="bg-green-100 text-green-800">Público</Badge>
                        </div>
                      </div>

                      <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">Términos Legales</h3>
                            <p className="text-sm text-gray-600">Actualizado hace 1 día</p>
                          </div>
                          <Badge variant="outline">Privado</Badge>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6">
                      <Button className="bg-green-600 hover:bg-green-700 text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Subir Documento
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
