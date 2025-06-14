import { Badge } from "./ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";

type CardInvestProps = {
  category: string
  title: string
  description: string
  goal: number
  raised: number
  investors: number
}

// Define category to color mapping
const categoryColors: { [key: string]: string } = {
  "Tecnologia": "blue",
  "Sostenibilidad": "green",
  "Energia": "yellow",
  "Energía": "red",
  // Add more categories as needed
};

export default function CardInvest({ category, title, description, goal, raised, investors }: CardInvestProps) {
return (
<Card className="border-green-100 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge className={`bg-${categoryColors[category]}-100 text-${categoryColors[category]}-800`}>{category}</Badge>
                  <Badge variant="outline" className="text-green-600 border-green-600 select-none">
                    {Math.round((raised / goal) * 100)}% financiado
                  </Badge>
                </div>
                <CardTitle className="text-green-800">{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Objetivo:</span>
                    <span className="font-semibold">${goal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Recaudado:</span>
                    <span className="font-semibold text-green-600">${raised.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Inversores:</span>
                    <span className="font-semibold">{investors.toLocaleString()}</span>
                  </div>                  <Progress value={Math.round((raised / goal) * 100)} className="w-full" />
                  <div className="text-sm text-gray-600">{Math.round((raised / goal) * 100)}% financiado</div>
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                    Ver Detalles
                  </Button>
                </div>
              </CardContent>
            </Card>)}