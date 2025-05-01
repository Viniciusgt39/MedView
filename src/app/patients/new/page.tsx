import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { ArrowLeft, UserPlus } from "lucide-react";

export default function NewPatientPage() {
  // TODO: Implement form handling with react-hook-form and Zod for validation
  // TODO: Implement API call to save the new patient

  return (
    <div className="flex flex-col gap-6">
       <div className="flex items-center gap-4 mb-4">
         <Button variant="outline" size="icon" asChild aria-label="Voltar para Pacientes">
           <Link href="/patients"><ArrowLeft className="h-4 w-4" /></Link>
         </Button>
        <h1 className="text-3xl font-bold">Adicionar Novo Paciente</h1>
      </div>

      <Card className="max-w-2xl mx-auto w-full"> {/* Ensure card takes full width up to max-w-2xl */}
        <CardHeader>
          <CardTitle>Informações do Paciente</CardTitle>
          <CardDescription>Preencha os dados básicos do novo paciente.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
           {/* TODO: Replace divs with Form components from Shadcn/react-hook-form */}
           <div className="space-y-2">
               <Label htmlFor="name">Nome Completo *</Label>
               <Input id="name" placeholder="Nome do Paciente" required />
           </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                 <Label htmlFor="email">Email (Opcional)</Label>
                 <Input id="email" type="email" placeholder="email@exemplo.com" />
              </div>
               <div className="space-y-2">
                 <Label htmlFor="phone">Telefone (Opcional)</Label>
                 <Input id="phone" type="tel" placeholder="(XX) XXXXX-XXXX" />
             </div>
           </div>
           <div className="space-y-2">
               <Label htmlFor="dob">Data de Nascimento (Opcional)</Label>
               <Input id="dob" type="date" />
           </div>
            {/* TODO: Add fields for initial diagnosis, notes, etc. if needed */}

          <div className="flex justify-end pt-6">
             {/* Button should trigger form submission */}
             <Button disabled> {/* TODO: Enable on form submit, handle loading state */}
                <UserPlus className="mr-2 h-4 w-4"/> Salvar Paciente
             </Button>
          </div>

           {/* Temporary notice about functionality */}
           {/* <p className="text-center text-muted-foreground text-sm pt-4">
             Funcionalidade de adicionar paciente em desenvolvimento.
           </p> */}
        </CardContent>
      </Card>
    </div>
  );
}
