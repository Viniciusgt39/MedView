
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";

export default function DoctorProfilePage() {
  // Placeholder data - in a real app, this would be fetched based on the logged-in user
  const doctor = {
    name: "Dr. Ricardo Alves",
    title: "Médico Psiquiatra",
    email: "ricardo.alves@nexushospital.com",
    phone: "(11) 99876-5432",
    specialty: "Psiquiatria Clínica",
    crm: "SP 123456",
    avatarUrl: "https://picsum.photos/id/237/128/128", // Larger avatar for profile page
    bio: "Especialista em transtornos de humor e ansiedade, com foco em abordagens terapêuticas integradas e personalizadas. Comprometido com o bem-estar e a recuperação de meus pacientes.",
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4 mb-4">
        <h1 className="text-3xl font-bold">Perfil Médico</h1>
        <Button variant="outline" size="sm" disabled> {/* Disabled edit button for now */}
          <Pencil className="mr-2 h-4 w-4" /> Editar Perfil
        </Button>
      </div>

      <Card className="w-full">
        <CardHeader className="border-b pb-4">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Avatar className="h-24 w-24 border-2 border-primary">
              <AvatarImage src={doctor.avatarUrl} data-ai-hint="doctor avatar large" alt={doctor.name} />
              <AvatarFallback>{doctor.name.split(' ').map(n => n[0]).slice(0, 2).join('')}</AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left">
              <CardTitle className="text-2xl">{doctor.name}</CardTitle>
              <CardDescription className="text-base">{doctor.title}</CardDescription>
              <p className="text-sm text-muted-foreground mt-1">{doctor.specialty} | CRM: {doctor.crm}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 grid gap-4 md:grid-cols-2">
          {/* Contact Information */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg mb-2 border-b pb-1">Informações de Contato</h3>
            <p className="text-sm"><strong>Email:</strong> {doctor.email}</p>
            <p className="text-sm"><strong>Telefone:</strong> {doctor.phone}</p>
          </div>

          {/* Biography */}
          <div className="space-y-2 md:col-span-2">
             <h3 className="font-semibold text-lg mb-2 border-b pb-1">Biografia</h3>
             <p className="text-sm text-muted-foreground">{doctor.bio}</p>
           </div>

           {/* Placeholder for other sections like Schedule, Settings, etc. */}
            <div className="space-y-2 md:col-span-2 mt-4">
              <h3 className="font-semibold text-lg mb-2 border-b pb-1">Outras Informações</h3>
               <p className="text-sm text-muted-foreground italic">
                 Seções adicionais como agenda, configurações de conta, etc., podem ser adicionadas aqui.
               </p>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
