

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
import { ArrowUp, ArrowDown, Minus, UserPlus, Users, AlertCircle, Smile, CheckCircle } from "lucide-react"; // Changed BarChart2, PieChart icons
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

      {/* Charts Section */}
       <div className="grid gap-4 md:grid-cols-2">
           {/* Mood Distribution Chart */}
           <Card>
               <CardHeader>
                   <CardTitle className="flex items-center gap-2">
                     <Smile className="h-5 w-5 text-primary" /> {/* Changed Icon */}
                     Distribuição de Humor (Último)
                   </CardTitle>
                   <CardDescription>Distribuição do último humor registrado pelos pacientes.</CardDescription>
               </CardHeader>
               <CardContent>
                   {loading ? (
                        <div className="flex items-center justify-center h-[250px]"> <Skeleton className="h-full w-full" /> </div>
                    ) : moodChartData.length > 0 ? (
                       <ChartContainer config={moodChartConfig} className="h-[250px] w-full">
                            {/* Using Pie Chart for Mood */}
                           <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Tooltip
                                        cursor={false}
                                        content={<ChartTooltipContent hideLabel />}
                                    />
                                    <Pie
                                        data={moodChartData}
                                        dataKey="count"
                                        nameKey="mood"
                                        innerRadius={60}
                                        strokeWidth={2}
                                        labelLine={false} // Remove label lines
                                    >
                                         {/* Labels inside the Pie */}
                                         <LabelList
                                            dataKey="mood"
                                            position="inside"
                                            formatter={(value: string, entry: any) => {
                                                // Check if entry and entry.percent exist
                                                if (entry && typeof entry.percent === 'number') {
                                                    const percentage = (entry.percent * 100).toFixed(0);
                                                    // Only show label if percentage is significant enough (e.g., > 5%)
                                                    return Number(percentage) > 5 ? `${value}: ${percentage}%` : '';
                                                }
                                                return ''; // Return empty string if data is missing
                                             }}
                                             className="fill-background text-xs font-medium pointer-events-none" // Style label
                                         />
                                        {moodChartData.map((entry) => (
                                            <Cell key={`cell-${entry.mood}`} fill={entry.fill} />
                                        ))}
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
                       <CheckCircle className="h-5 w-5 text-primary" /> {/* Changed Icon */}
                       Distribuição de Adesão
                   </CardTitle>
                   <CardDescription>Distribuição dos níveis de adesão à medicação.</CardDescription>
               </CardHeader>
               <CardContent>
                    {loading ? (
                         <div className="flex items-center justify-center h-[250px]"> <Skeleton className="h-full w-full" /> </div>
                    ) : adherenceChartData.length > 0 ? (
                       <ChartContainer config={adherenceChartConfig} className="h-[250px] w-full">
                           <BarChart accessibilityLayer data={adherenceChartData} margin={{ top: 20, right: 10, left: -15, bottom: 0 }}> {/* Added top margin for labels */}
                               <CartesianGrid vertical={false} strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="level"
                                    tickLine={false}
                                    tickMargin={10}
                                    axisLine={false}
                                    fontSize={12} // Ensure labels fit
                                />
                                <YAxis allowDecimals={false} />
                                <Tooltip
                                     cursor={false} // Disable cursor line
                                    content={<ChartTooltipContent hideIndicator />} // Use ShadCN tooltip
                                />
                                <Bar dataKey="count" radius={4}>
                                     {/* Color bars based on the 'fill' property in data */}
                                     {adherenceChartData.map((entry) => (
                                        <Cell key={`cell-${entry.level}`} fill={entry.fill} />
                                     ))}
                                      <LabelList
                                        position="top"
                                        offset={4}
                                        className="fill-foreground text-xs pointer-events-none"
                                        formatter={(value: number) => value.toString()}
                                    />
                                </Bar>
                           </BarChart>
                       </ChartContainer>
                   ) : (
                        <div className="flex items-center justify-center h-[250px] text-muted-foreground">Nenhum dado de adesão disponível.</div>
                   )}
               </CardContent>
           </Card>
       </div>


      {/* Patient Overview Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Visão Geral dos Pacientes (Recentes)</CardTitle>
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
               {/* Show only top 5 or 10 patients for brevity */}
              {patients.slice(0, 5).map((patient) => (
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
            {patients.length > 5 && !loading && ( // Only show if more than 5 patients and not loading
                 <div className="mt-4 text-center">
                     <Button asChild variant="link">
                         <Link href="/patients">Ver todos os pacientes</Link>
                     </Button>
                 </div>
             )}
        </CardContent>
      </Card>
    </div>
  );
}

    