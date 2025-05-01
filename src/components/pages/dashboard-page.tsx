"use client";

import * as React from "react";
import { PatientSummary, getMockPatientSummaries } from "@/types/patient";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowUp, ArrowDown, Minus, UserPlus, Users, AlertCircle } from "lucide-react"; // Added Users
import Link from "next/link";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";

export default function DashboardPage() {
  const [patients, setPatients] = React.useState<PatientSummary[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const data = await getMockPatientSummaries();
      setPatients(data);
      setLoading(false);
    };
    fetchData();
  }, []);

  const getTrendIcon = (trend?: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <ArrowUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <ArrowDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

 const getAdherenceColor = (adherence?: number) => {
    if (adherence === undefined || adherence === null) return 'bg-gray-200'; // Handle null/undefined
    if (adherence >= 90) return 'bg-green-500';
    if (adherence >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
 };

  const totalPatients = patients.length;
  const patientsWithLowAdherence = patients.filter(p => (p.medicationAdherence ?? 100) < 70).length;
  const patientsWithNegativeTrend = patients.filter(p => p.moodTrend === 'down').length;


  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Pacientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-1/4" /> : <div className="text-2xl font-bold">{totalPatients}</div> }
            <p className="text-xs text-muted-foreground">
              Número total de pacientes ativos.
            </p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Baixa Adesão (&lt; 70%)</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {loading ? <Skeleton className="h-8 w-1/4" /> : <div className="text-2xl font-bold">{patientsWithLowAdherence}</div> }
            <p className="text-xs text-muted-foreground">
              Pacientes necessitando atenção na adesão.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tendência Negativa (Humor)</CardTitle>
            <ArrowDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-1/4" /> : <div className="text-2xl font-bold">{patientsWithNegativeTrend}</div> }
            <p className="text-xs text-muted-foreground">
              Pacientes com humor em declínio.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Patient Overview Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Visão Geral dos Pacientes</CardTitle>
            <CardDescription>
              Resumo rápido do status dos seus pacientes.
            </CardDescription>
           </div>
            {/* Link to Add Patient page */}
            <Button asChild size="sm">
               <Link href="/patients/new"><UserPlus className="mr-2 h-4 w-4" /> Adicionar Paciente</Link>
           </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
             <div className="space-y-2">
                {/* Skeleton loaders for table rows */}
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
             </div>
          ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead className="hidden md:table-cell">Último Humor</TableHead>
                <TableHead className="hidden lg:table-cell">Tendência Humor</TableHead>
                <TableHead>Adesão Medicação</TableHead>
                <TableHead className="hidden md:table-cell">Atividade Recente</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell className="font-medium">{patient.name}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {patient.lastMood ? (
                      <Badge variant="secondary">{patient.lastMood}</Badge>
                    ) : (
                      <span className="text-muted-foreground">N/A</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {getTrendIcon(patient.moodTrend)}
                  </TableCell>
                  <TableCell>
                     {/* Adherence Progress Bar */}
                     <div className="flex items-center gap-2">
                       <div className="w-16 h-2 rounded-full bg-muted"> {/* Use muted for background */}
                          <div
                            className={`h-2 rounded-full ${getAdherenceColor(patient.medicationAdherence)}`}
                            style={{ width: `${patient.medicationAdherence ?? 0}%` }}
                            title={`Adesão: ${patient.medicationAdherence ?? 'N/A'}%`} // Tooltip for exact percentage
                          ></div>
                       </div>
                       <span className="text-xs text-muted-foreground">{patient.medicationAdherence ?? 'N/A'}%</span>
                     </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {patient.recentActivity ?? <span className="text-muted-foreground">Nenhuma</span>}
                  </TableCell>
                  <TableCell className="text-right">
                     {/* Link to individual patient profile */}
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/patients/${patient.id}`}>Ver Perfil</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
               {/* Display message if no patients */}
               {patients.length === 0 && (
                 <TableRow>
                   <TableCell colSpan={6} className="text-center text-muted-foreground h-24">
                     Nenhum paciente encontrado.
                   </TableCell>
                 </TableRow>
               )}
            </TableBody>
          </Table>
           )}
        </CardContent>
      </Card>
    </div>
  );
}
