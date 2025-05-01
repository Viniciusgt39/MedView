import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold">Configurações</h1>
      <Card>
        <CardHeader>
          <CardTitle>Configurações da Aplicação</CardTitle>
           <CardDescription>Ajuste as preferências e configurações do MediView Desktop.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center gap-4 h-64 text-center">
          <Settings className="h-16 w-16 text-muted-foreground" />
          <p className="text-muted-foreground">
            Opções de configuração da aplicação serão adicionadas aqui em breve.
          </p>
           <p className="text-sm text-muted-foreground mt-2">
            Ex: Preferências de notificação, integração com calendário, temas.
           </p>
        </CardContent>
      </Card>
    </div>
  );
}
