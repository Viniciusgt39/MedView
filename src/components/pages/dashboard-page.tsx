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
import { ArrowUp, ArrowDown, Minus, UserPlus, Users, AlertCircle, Smile, CheckCircle, Calendar, Bell, PlusSquare, FileText, ListChecks } from "lucide-react"; // Added Calendar, Bell, PlusSquare, FileText, ListChecks
import Link from "next/link";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Pie, Cell, LabelList, PieChart } from "recharts"; // Import Pie chart components
import { format } from 'date-fns'; // Import format
import { ptBR } from 'date-fns/locale'; // Import ptBR locale

// Chart configuration for colors and labels
const moodChartConfig = {
  count: { label: "Pacientes" },
  Feliz: { label: "Feliz", color: "hsl(var(--chart-1))" },
  Calmo: { label: "Calmo", color: "hsl(var(--chart-2))" },
  Ansioso: { label: "Ansioso", color: "hsl(var(--chart-3))" },
  Triste: { label: "Triste", color: "hsl(var(--chart-4))" },
  Irritado: { label: "Irritado", color: "hsl(var(--chart-5))" },
  Estressado: { label: "Estressado", color: "hsl(var(--chart-1))" }, // Reuse color or add more charts
  Outro: { label: "Outro/N/A", color: "hsl(var(--muted))" },
} satisfies ChartConfig;

const adherenceChartConfig = {
  count: { label: "Pacientes" },
  Baixa: { label: "Baixa (<70%)", color: "hsl(var(--destructive))" },
  Media: { label: "Média (70-89%)", color: "hsl(var(--chart-3))" }, // Yellow/Orange might be better, using chart-3 for now
  Alta: { label: "Alta (≥90%)", color: "hsl(var(--chart-1))" }, // Green
  NA: { label: "N/A", color: "hsl(var(--muted))" },
} satisfies ChartConfig;

// Mock data for new widgets
const mockAppointments = [
    { id: 'app_1', patientName: 'Ana Silva', time: new Date(new Date().setHours(9, 30, 0, 0)), type: 'Consulta de Rotina' },
    { id: 'app_2', patientName: 'Bruno Costa', time: new Date(new Date().setHours(11, 0, 0, 0)), type: 'Acompanhamento' },
    { id: 'app_3', patientName: 'Carla Dias', time: new Date(new Date().setHours(14, 0, 0, 0)), type: 'Consulta Inicial' },
];

const mockAlerts = [
    { id: 'alert_1', patientName: 'Eduarda Ferreira', description: 'Baixa adesão à medicação (60%)', timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), severity: 'high' },
    { id: 'alert_2', patientName: 'Bruno Costa', description: 'Humor reportado como "Ansioso" 2 dias seguidos', timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), severity: 'medium' },
    { id: 'alert_3', patientName: 'Daniel Martins', description: 'Nenhum check-in nos últimos 3 dias', timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), severity: 'low' },
];

export default function DashboardPage() {
  const [patients, setPatients] = React.useState<PatientSummary[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [moodChartData, setMoodChartData] = React.useState<any[]>([]);
  const [adherenceChartData, setAdherenceChartData] = React.useState<any[]>([]);

  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
          const data = await getMockPatientSummaries();
          setPatients(data);

          // Process data for Mood Chart
          const moodCounts = data.reduce((acc, patient) => {
            const mood = patient.lastMood || 'Outro'; // Group undefined/null as 'Other'
            acc[mood] = (acc[mood] || 0) + 1;
            return acc;
          }, {} as { [key: string]: number });

          const processedMoodData = Object.entries(moodCounts).map(([mood, count]) => ({
            mood,
            count,
            fill: moodChartConfig[mood as keyof typeof moodChartConfig]?.color || moodChartConfig.Outro.color, // Assign color dynamically
          }));
          setMoodChartData(processedMoodData);

          // Process data for Adherence Chart
          const adherenceCounts = data.reduce((acc, patient) => {
              const adherence = patient.medicationAdherence;
              let category: keyof typeof adherenceChartConfig;
              if (adherence === undefined || adherence === null) {
                  category = 'NA';
              } else if (adherence < 70) {
                  category = 'Baixa';
              } else if (adherence < 90) {
                  category = 'Media';
              } else {
                  category = 'Alta';
              }
              acc[category] = (acc[category] || 0) + 1;
              return acc;
          }, {} as { [key: string]: number });

          const processedAdherenceData = Object.entries(adherenceCounts).map(([level, count]) => ({
              level: adherenceChartConfig[level as keyof typeof adherenceChartConfig]?.label || level, // Use label from config
              count,
              fill: adherenceChartConfig[level as keyof typeof adherenceChartConfig]?.color || adherenceChartConfig.NA.color,
          }));
          setAdherenceChartData(processedAdherenceData);

      } catch (error) {
          console.error("Failed to fetch or process patient data:", error);
          // Optionally, set an error state or show a toast notification
      } finally {
          setLoading(false);
      }
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

       {/* Main Grid for Dashboard Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

          {/* Column 1: Summary Cards & Appointments */}
          <div className="lg:col-span-1 space-y-6">
              {/* Summary Cards */}
              <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total de Pacientes</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                      {loading ? <Skeleton className="h-8 w-1/4" /> : <div className="text-2xl font-bold">{totalPatients}</div>}
                      <p className="text-xs text-muted-foreground">Número total de pacientes ativos.</p>
                  </CardContent>
              </Card>
              <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Baixa Adesão (&lt; 70%)</CardTitle>
                      <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                      {loading ? <Skeleton className="h-8 w-1/4" /> : <div className="text-2xl font-bold">{patientsWithLowAdherence}</div>}
                      <p className="text-xs text-muted-foreground">Pacientes necessitando atenção na adesão.</p>
                  </CardContent>
              </Card>
              <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Tendência Negativa (Humor)</CardTitle>
                      <ArrowDown className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                      {loading ? <Skeleton className="h-8 w-1/4" /> : <div className="text-2xl font-bold">{patientsWithNegativeTrend}</div>}
                      <p className="text-xs text-muted-foreground">Pacientes com humor em declínio.</p>
                  </CardContent>
              </Card>

               {/* Upcoming Appointments Widget */}
               <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-primary" />
                            Próximas Consultas (Hoje)
                        </CardTitle>
                        <CardDescription>Agendamentos para o dia atual.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {loading ? (
                            [...Array(3)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)
                        ) : mockAppointments.length > 0 ? (
                            mockAppointments.map(app => (
                                <div key={app.id} className="flex items-center justify-between p-2 bg-secondary/50 rounded-md">
                                    <div>
                                        <p className="text-sm font-medium">{app.patientName}</p>
                                        <p className="text-xs text-muted-foreground">{app.type}</p>
                                    </div>
                                    <Badge variant="outline">{format(app.time, 'HH:mm', { locale: ptBR })}</Badge>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">Nenhuma consulta agendada para hoje.</p>
                        )}
                        <Button variant="link" size="sm" className="w-full mt-2" asChild>
                            <Link href="#">Ver Agenda Completa</Link>
                        </Button>
                    </CardContent>
                </Card>
          </div>

          {/* Column 2: Charts & Recent Alerts */}
          <div className="lg:col-span-1 space-y-6">
              {/* Mood Distribution Chart */}
              <Card>
                  <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                          <Smile className="h-5 w-5 text-primary" />
                          Distribuição de Humor (Último)
                      </CardTitle>
                      <CardDescription>Distribuição do último humor registrado pelos pacientes.</CardDescription>
                  </CardHeader>
                  <CardContent>
                      {loading ? (
                          <div className="flex items-center justify-center h-[250px]"> <Skeleton className="h-full w-full" /> </div>
                      ) : moodChartData.length > 0 ? (
                          <ChartContainer config={moodChartConfig} className="h-[250px] w-full">
                              <ResponsiveContainer width="100%" height="100%">
                                  <PieChart>
                                      <Tooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                                      <Pie data={moodChartData} dataKey="count" nameKey="mood" innerRadius={60} strokeWidth={2} labelLine={false}>
                                          <LabelList dataKey="mood" position="inside" formatter={(value: string, entry: any) => {
                                              if (entry && typeof entry.percent === 'number') {
                                                  const percentage = (entry.percent * 100).toFixed(0);
                                                  return Number(percentage) > 5 ? `${value}: ${percentage}%` : '';
                                              }
                                              return '';
                                          }} className="fill-background text-xs font-medium pointer-events-none" />
                                          {moodChartData.map((entry) => (<Cell key={`cell-${entry.mood}`} fill={entry.fill} />))}
                                      </Pie>
                                      <ChartLegend content={<ChartLegendContent />} />
                                  </PieChart>
                              </ResponsiveContainer>
                          </ChartContainer>
                      ) : (
                          <div className="flex items-center justify-center h-[250px] text-muted-foreground">Nenhum dado de humor disponível.</div>
                      )}
                  </CardContent>
              </Card>

                {/* Adherence Distribution Chart */}
               <Card>
                   <CardHeader>
                       <CardTitle className="flex items-center gap-2">
                           <CheckCircle className="h-5 w-5 text-primary" />
                           Distribuição de Adesão
                       </CardTitle>
                       <CardDescription>Distribuição dos níveis de adesão à medicação.</CardDescription>
                   </CardHeader>
                   <CardContent>
                       {loading ? (
                           <div className="flex items-center justify-center h-[250px]"> <Skeleton className="h-full w-full" /> </div>
                       ) : adherenceChartData.length > 0 ? (
                           <ChartContainer config={adherenceChartConfig} className="h-[250px] w-full">
                               <BarChart accessibilityLayer data={adherenceChartData} margin={{ top: 20, right: 10, left: -15, bottom: 0 }}>
                                   <CartesianGrid vertical={false} strokeDasharray="3 3" />
                                   <XAxis dataKey="level" tickLine={false} tickMargin={10} axisLine={false} fontSize={12} />
                                   <YAxis allowDecimals={false} />
                                   <Tooltip cursor={false} content={<ChartTooltipContent hideIndicator />} />
                                   <Bar dataKey="count" radius={4}>
                                       {adherenceChartData.map((entry) => (<Cell key={`cell-${entry.level}`} fill={entry.fill} />))}
                                       <LabelList position="top" offset={4} className="fill-foreground text-xs pointer-events-none" formatter={(value: number) => value.toString()} />
                                   </Bar>
                               </BarChart>
                           </ChartContainer>
                       ) : (
                           <div className="flex items-center justify-center h-[250px] text-muted-foreground">Nenhum dado de adesão disponível.</div>
                       )}
                   </CardContent>
               </Card>

                {/* Recent Alerts Widget */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Bell className="h-5 w-5 text-primary" />
                            Alertas Recentes
                        </CardTitle>
                        <CardDescription>Notificações e alertas importantes.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 max-h-60 overflow-y-auto">
                        {loading ? (
                             [...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)
                        ) : mockAlerts.length > 0 ? (
                            mockAlerts.map(alert => (
                                <div key={alert.id} className={`flex items-start gap-3 p-2 rounded-md ${alert.severity === 'high' ? 'bg-destructive/10 border border-destructive/30' : alert.severity === 'medium' ? 'bg-yellow-500/10 border border-yellow-500/30' : 'bg-secondary/50'}`}>
                                    <AlertCircle className={`h-4 w-4 mt-1 flex-shrink-0 ${alert.severity === 'high' ? 'text-destructive' : alert.severity === 'medium' ? 'text-yellow-600' : 'text-blue-500'}`} />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">{alert.patientName}</p>
                                        <p className={`text-xs ${alert.severity === 'high' ? 'text-destructive/90' : alert.severity === 'medium' ? 'text-yellow-700' : 'text-muted-foreground'}`}>{alert.description}</p>
                                        <p className="text-xs text-muted-foreground/80 mt-0.5">{format(alert.timestamp, 'HH:mm dd/MM', { locale: ptBR })}</p>
                                    </div>
                                    <Button variant="ghost" size="sm" className="text-xs h-7 px-2">Ver</Button>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">Nenhum alerta recente.</p>
                        )}
                    </CardContent>
                 </Card>

          </div>

          {/* Column 3: Patient Table & Quick Actions */}
          <div className="lg:col-span-1 space-y-6">
                {/* Patient Overview Table */}
                <Card className="h-full flex flex-col"> {/* Allow card to grow */}
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Visão Geral dos Pacientes (Recentes)</CardTitle>
                            <CardDescription>Resumo rápido do status dos seus pacientes.</CardDescription>
                        </div>
                         {/* Link to Add Patient page */}
                         <Button asChild size="sm" className="ml-auto">
                            <Link href="/patients/new"><UserPlus className="mr-2 h-4 w-4" /> Adicionar</Link>
                        </Button>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col"> {/* Allow content to grow */}
                         {loading ? (
                            <div className="space-y-2">
                                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                            </div>
                         ) : (
                            <div className="overflow-x-auto flex-1"> {/* Make table scrollable and grow */}
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Nome</TableHead>
                                            <TableHead>Humor</TableHead>
                                            <TableHead>Adesão</TableHead>
                                            <TableHead className="text-right">Ações</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {patients.slice(0, 7).map((patient) => ( // Show more patients
                                            <TableRow key={patient.id}>
                                                <TableCell className="font-medium py-2">{patient.name}</TableCell>
                                                <TableCell className="py-2">
                                                    {patient.lastMood ? (
                                                        <Badge variant={patient.moodTrend === 'down' ? "destructive" : "secondary"} className="text-xs">{patient.lastMood}</Badge>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground">N/A</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="py-2">
                                                    <div className="flex items-center gap-1" title={`Adesão: ${patient.medicationAdherence ?? 'N/A'}%`}>
                                                        <div className="w-10 h-1.5 rounded-full bg-muted">
                                                            <div className={`h-1.5 rounded-full ${getAdherenceColor(patient.medicationAdherence)}`} style={{ width: `${patient.medicationAdherence ?? 0}%` }}></div>
                                                        </div>
                                                        <span className="text-xs text-muted-foreground">{patient.medicationAdherence ?? 'N/A'}%</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right py-2">
                                                    <Button asChild variant="outline" size="sm" className="h-7 px-2 text-xs">
                                                        <Link href={`/patients/${patient.id}`}>Perfil</Link>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {patients.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center text-muted-foreground h-24">Nenhum paciente encontrado.</TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                        {patients.length > 7 && !loading && (
                            <div className="mt-4 text-center border-t pt-2">
                                <Button asChild variant="link" size="sm">
                                    <Link href="/patients">Ver todos os pacientes</Link>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Quick Actions Widget */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ListChecks className="h-5 w-5 text-primary" />
                            Ações Rápidas
                        </CardTitle>
                        <CardDescription>Atalhos para tarefas comuns.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-3">
                        <Button variant="outline" className="justify-start">
                            <UserPlus className="mr-2 h-4 w-4" /> Novo Paciente
                        </Button>
                        <Button variant="outline" className="justify-start">
                            <FileText className="mr-2 h-4 w-4" /> Nova Anotação
                        </Button>
                        <Button variant="outline" className="justify-start">
                            <PlusSquare className="mr-2 h-4 w-4" /> Prescrever Med.
                        </Button>
                        <Button variant="outline" className="justify-start">
                            <Calendar className="mr-2 h-4 w-4" /> Agendar Consulta
                        </Button>
                    </CardContent>
                </Card>
          </div>
      </div>


    </div>
  );
}