import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

export default function ReportsPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold">Relatórios</h1>
      <Card>
        <CardHeader>
          <CardTitle>Gerador de Relatórios</CardTitle>
          <CardDescription>Crie e visualize relatórios personalizados sobre o progresso dos pacientes.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center gap-4 h-64 text-center">
          <BarChart3 className="h-16 w-16 text-muted-foreground" />
          <p className="text-muted-foreground">
            A funcionalidade de geração de relatórios está em desenvolvimento.
          </p>
           <p className="text-sm text-muted-foreground mt-2">
            Em breve, você poderá gerar relatórios semanais, mensais e personalizados.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
