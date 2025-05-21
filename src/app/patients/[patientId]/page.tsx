

"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import {
  PatientProfile,
  getMockPatientProfile,
  WearableData,
  UIMedication, // Use UIMedication
  MoodCheckin,
  Note,
  TreatmentEvent
} from "@/types/patient";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  HeartPulse,
  Thermometer,
  Bed,
  Footprints,
  Pill,
  FileText,
  Smile,
  Frown,
  Meh,
  AlertTriangle,
  Star,
  Sparkles, // Keep Sparkles for non-AI achievements maybe?
  MessageSquare,
  Info,
  CalendarDays,
  Stethoscope,
  BrainCircuit, // Using BrainCircuit for AI Insights
  ArrowUp, ArrowDown, Minus, Edit, Trash, PlusCircle, CheckCircle, XCircle, Clock, Activity // Added Activity for EDA icon
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { generateInsights, GenerateInsightsInput, GenerateInsightsOutput } from '@/ai/flows/generate-insights';
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea"; // Import Textarea
import { Label } from "@/components/ui/label"; // Import Label
import { Input } from "@/components/ui/input"; // Import Input
import { cn } from "@/lib/utils"; // Import cn utility

// Chart configuration for colors and labels
const chartConfig = {
  heartRate: { label: "FC (bpm)", color: "hsl(var(--chart-1))" },
  hrv: { label: "VFC (ms)", color: "hsl(var(--chart-2))" },
  eda: { label: "AED (µS)", color: "hsl(var(--chart-3))" },
  temperature: { label: "Temp (°C)", color: "hsl(var(--chart-4))" },
  steps: { label: "Passos", color: "hsl(var(--chart-5))" },
  sleep: { label: "Sono (h)", color: "hsl(var(--chart-2))" }, // Reusing color
} satisfies ChartConfig;

// Helper function to get mood icon based on mood string
const getMoodIcon = (mood: string) => {
    switch (mood.toLowerCase()) {
        case 'feliz': return <Smile className="h-4 w-4 text-green-500" />;
        case 'calmo': return <Meh className="h-4 w-4 text-blue-500" />;
        case 'ansioso': return <Frown className="h-4 w-4 text-yellow-600" />; // Adjusted color
        case 'triste': return <Frown className="h-4 w-4 text-gray-500" />;
        case 'irritado': return <AlertTriangle className="h-4 w-4 text-red-500" />;
        case 'estressado': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
        default: return <Meh className="h-4 w-4 text-muted-foreground" />;
    }
};

// Helper function to get icon based on treatment event type
const getTreatmentEventIcon = (type: TreatmentEvent['type']) => {
    switch(type) {
        case 'moodCheckin': return <Smile className="h-4 w-4 text-blue-500" />;
        case 'medication': return <Pill className="h-4 w-4 text-purple-500" />;
        case 'note': return <FileText className="h-4 w-4 text-gray-500" />;
        case 'activity': return <Footprints className="h-4 w-4 text-green-500" />;
        case 'insight': return <BrainCircuit className="h-4 w-4 text-teal-500" />; // Use BrainCircuit for AI insight events
        case 'crisis': return <AlertTriangle className="h-4 w-4 text-red-500" />;
        case 'achievement': return <Star className="h-4 w-4 text-yellow-500" />; // Use Star for achievements
        default: return <Info className="h-4 w-4 text-muted-foreground" />;
    }
}

// Component for displaying a single real-time metric
interface RealTimeMetricProps {
  icon: React.ElementType;
  label: string;
  value: number | string | undefined;
  unit: string;
  className?: string;
  iconClassName?: string;
}

const RealTimeMetric: React.FC<RealTimeMetricProps> = ({ icon: Icon, label, value, unit, className, iconClassName }) => (
    <Card className={cn("flex flex-col items-center justify-center p-4 text-center h-full", className)}>
        <Icon className={cn("h-6 w-6 mb-2 text-primary", iconClassName)} />
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="text-3xl font-bold">
            {value !== undefined && value !== null ? value : '--'}
            <span className="text-lg font-normal text-muted-foreground ml-1">{unit}</span>
        </p>
    </Card>
);

// Main component for the patient profile page
export default function PatientProfilePage() {
  const params = useParams();
  const patientId = params.patientId as string;
  const [patient, setPatient] = React.useState<PatientProfile | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [generatingInsights, setGeneratingInsights] = React.useState(false);
  const { toast } = useToast();

  // State for adding a new note
  const [newNoteTitle, setNewNoteTitle] = React.useState("");
  const [newNoteContent, setNewNoteContent] = React.useState("");
  const [isAddingNote, setIsAddingNote] = React.useState(false);

  // State for real-time data simulation
  const [realTimeHR, setRealTimeHR] = React.useState<number | undefined>(undefined);
  const [realTimeHRV, setRealTimeHRV] = React.useState<number | undefined>(undefined);
  const [realTimeEDA, setRealTimeEDA] = React.useState<number | undefined>(undefined);

  // Effect for real-time data simulation
  React.useEffect(() => {
    if (loading || !patient) return; // Don't run if loading or no patient data

    // Get initial values from the *last* wearable data entry
    const lastReading = patient.wearableData[patient.wearableData.length - 1];
    let currentHR = lastReading?.heartRateBpm ?? 75;
    let currentHRV = lastReading?.heartRateVariabilityMs ?? 60;
    let currentEDA = lastReading?.edaMicrosiemens ?? 0.8;

    // Set initial state values
    setRealTimeHR(currentHR);
    setRealTimeHRV(currentHRV);
    setRealTimeEDA(parseFloat(currentEDA.toFixed(1))); // Format EDA initially


    const intervalId = setInterval(() => {
       // Simulate slight variations around the current value
      currentHR += (Math.random() - 0.5) * 4; // Fluctuate HR slightly more
      currentHR = Math.max(50, Math.min(120, Math.round(currentHR))); // Clamp and round HR

      currentHRV += (Math.random() - 0.5) * 6; // Fluctuate HRV
      currentHRV = Math.max(25, Math.min(130, Math.round(currentHRV))); // Clamp and round HRV

      currentEDA += (Math.random() - 0.5) * 0.2; // Fluctuate EDA
      currentEDA = Math.max(0.1, Math.min(2.5, currentEDA)); // Clamp EDA

      // Update state
      setRealTimeHR(currentHR);
      setRealTimeHRV(currentHRV);
      setRealTimeEDA(parseFloat(currentEDA.toFixed(1))); // Keep EDA with one decimal place

    }, 1500); // Update every 1.5 seconds

    return () => clearInterval(intervalId); // Cleanup interval on component unmount or when patient changes
  }, [loading, patient]); // Rerun effect if loading status or patient data changes


  // Fetch patient data on component mount or when patientId changes
  React.useEffect(() => {
    const fetchPatient = async () => {
      if (patientId) {
        setLoading(true);
        try {
            const data = await getMockPatientProfile(patientId);
            setPatient(data);
        } catch (error) {
            console.error("Failed to fetch patient profile:", error);
            toast({ title: "Erro", description: "Falha ao carregar dados do paciente.", variant: "destructive"});
        } finally {
            setLoading(false);
        }
      }
    };
    fetchPatient();
  }, [patientId, toast]); // Add toast to dependency array

  // Handler for generating AI insights
  const handleGenerateInsights = async () => {
    if (!patientId) return;
    setGeneratingInsights(true);
    try {
      const input: GenerateInsightsInput = { patientId };
      const result: GenerateInsightsOutput = await generateInsights(input);

       const newInsightEvent: TreatmentEvent = {
            id: `evt_insight_${Date.now()}`,
            timestamp: new Date(),
            type: 'insight',
            description: 'Novos Insights de IA Gerados',
            details: result.insights, // Store the insight text
        };

      // Update patient state locally (in a real app, you might refetch or update via API)
      setPatient(prev => prev ? {
        ...prev,
        aiInsights: result.insights,
        treatmentHistory: [newInsightEvent, ...prev.treatmentHistory].sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime()) // Add insight to history and sort
       } : null);

      toast({
        title: "Insights Gerados",
        description: "Novos insights de IA foram adicionados ao perfil do paciente.",
      });
    } catch (error) {
      console.error("Error generating insights:", error);
      toast({
        title: "Erro ao Gerar Insights",
        description: error instanceof Error ? error.message : "Não foi possível gerar insights no momento.",
        variant: "destructive",
      });
    } finally {
      setGeneratingInsights(false);
    }
  };

  // Handler for adding a new note
  const handleAddNote = () => {
    if (!newNoteTitle || !newNoteContent) {
         toast({ title: "Erro", description: "Título e conteúdo da nota são obrigatórios.", variant: "destructive" });
        return;
    }

    const newNote: Note = {
        id: `note_${Date.now()}`, // Simple unique ID generation for mock
        createdAt: new Date(),
        updatedAt: new Date(),
        title: newNoteTitle,
        content: newNoteContent,
    };

     const newTreatmentEvent: TreatmentEvent = {
        id: `evt_note_${newNote.id}`,
        timestamp: newNote.createdAt,
        type: 'note',
        description: `Nota Adicionada: ${newNote.title}`,
        details: newNote,
    }

    // TODO: In a real app, send this to the backend API
    setPatient(prev => prev ? {
        ...prev,
        notes: [newNote, ...prev.notes].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()), // Add and sort notes
        treatmentHistory: [newTreatmentEvent, ...prev.treatmentHistory].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()) // Add to history and sort
     } : null);

     // Reset form and hide
    setNewNoteTitle("");
    setNewNoteContent("");
    setIsAddingNote(false);
     toast({ title: "Sucesso", description: "Nova nota adicionada." });
  };


  // Display loading skeletons while fetching data
  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-10 w-full" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-64 w-full rounded-lg" />
          <Skeleton className="h-64 w-full rounded-lg" />
          <Skeleton className="h-64 w-full rounded-lg" />
           <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  // Display message if patient data is not found
  if (!patient) {
    return <div className="text-center py-10 text-muted-foreground">Paciente não encontrado ou falha ao carregar dados.</div>;
  }

  // Prepare data for charts - taking last N readings
  const chartDataPoints = 15;
  const wearableChartData = patient.wearableData.slice(-chartDataPoints).map((d, index) => ({
    // Format timestamp for X-axis label (e.g., 'DD/MM')
    name: format(d.timestamp, 'dd/MM'), // Use timestamp from WearableData
    heartRate: d.heartRateBpm,
    hrv: d.heartRateVariabilityMs,
    eda: d.edaMicrosiemens,
    temperature: d.bodyTemperatureCelsius,
    steps: d.movementData?.stepCount, // Use optional chaining
    sleep: d.sleepData?.durationHours, // Use optional chaining
  }));


  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border">
            <AvatarImage src={`https://picsum.photos/seed/${patient.id}/64/64`} data-ai-hint="patient avatar" />
            <AvatarFallback>{patient.name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold">{patient.name}</h1>
            <p className="text-muted-foreground">
              ID: {patient.id} | Membro desde: {format(patient.dateJoined, 'dd/MM/yyyy', { locale: ptBR })}
            </p>
          </div>
        </div>
         {/* AI Insight Generation Button */}
         <Button onClick={handleGenerateInsights} disabled={generatingInsights} size="sm">
          <BrainCircuit className="mr-2 h-4 w-4" />
          {generatingInsights ? "Gerando Insights..." : "Gerar Insights IA"}
        </Button>
      </div>

       {/* AI Insights Display Card */}
       {patient.aiInsights && (
        <Card className="bg-secondary border-primary/30">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
             <BrainCircuit className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg text-secondary-foreground">Insights da IA</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-secondary-foreground">{patient.aiInsights}</p>
          </CardContent>
        </Card>
      )}

       {/* Real-time Biofeedback Section */}
        <Card>
            <CardHeader>
                <CardTitle>Biofeedback em Tempo Real</CardTitle>
                <CardDescription>Valores atuais simulados dos sensores vestíveis.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 grid-cols-1 sm:grid-cols-3">
                <RealTimeMetric
                    icon={HeartPulse}
                    label="Frequência Cardíaca"
                    value={realTimeHR}
                    unit="bpm"
                 />
                 <RealTimeMetric
                    icon={Activity} // Using Activity icon for HRV as it relates to heart 'activity' pattern
                    label="Variabilidade da FC"
                    value={realTimeHRV}
                    unit="ms"
                    iconClassName="text-blue-500" // Example color override
                 />
                  <RealTimeMetric
                    icon={Thermometer} // Placeholder - could use Activity or a custom EDA icon if available
                    label="Atividade Eletrodérmica"
                    value={realTimeEDA}
                    unit="µS"
                     iconClassName="text-orange-500" // Example color override
                 />
            </CardContent>
        </Card>


      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="wearable">Dados Vestíveis</TabsTrigger>
          <TabsTrigger value="medications">Medicações</TabsTrigger>
          <TabsTrigger value="notes">Anotações</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>

        {/* Overview Tab Content */}
        <TabsContent value="overview" className="mt-4 space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                 {/* Last Mood Card */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Último Humor</CardTitle>
                        {patient.lastMood ? getMoodIcon(patient.lastMood) : <Meh className="h-4 w-4 text-muted-foreground" /> }
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{patient.lastMood ?? 'N/A'}</div>
                         <p className="text-xs text-muted-foreground flex items-center gap-1 capitalize">
                           Tendência: {patient.moodTrend === 'up' ? <ArrowUp className="h-3 w-3 text-green-500" /> : patient.moodTrend === 'down' ? <ArrowDown className="h-3 w-3 text-red-500" /> : <Minus className="h-3 w-3 text-muted-foreground" />}
                           {patient.moodTrend ?? 'estável'}
                        </p>
                    </CardContent>
                </Card>
                {/* Medication Adherence Card */}
                 <Card>
                     <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                         <CardTitle className="text-sm font-medium">Adesão (Geral)</CardTitle>
                         <Pill className="h-4 w-4 text-muted-foreground" />
                     </CardHeader>
                     <CardContent>
                         <div className="text-2xl font-bold">{patient.medicationAdherence ?? 'N/A'}%</div>
                         <p className="text-xs text-muted-foreground">Média de adesão às medicações</p>
                     </CardContent>
                 </Card>
                 {/* Recent Activity Card */}
                <Card>
                     <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                         <CardTitle className="text-sm font-medium">Atividade Recente</CardTitle>
                         <Clock className="h-4 w-4 text-muted-foreground" />
                     </CardHeader>
                     <CardContent>
                         <div className="text-lg font-bold truncate">{patient.recentActivity ?? 'Nenhuma'}</div>
                         {patient.lastCheckin && <p className="text-xs text-muted-foreground">Último check-in: {format(patient.lastCheckin, "dd/MM HH:mm", { locale: ptBR })}</p>}
                     </CardContent>
                 </Card>
                 {/* Steps Yesterday Card */}
                 <Card>
                     <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                         <CardTitle className="text-sm font-medium">Passos (Ontem)</CardTitle>
                         <Footprints className="h-4 w-4 text-muted-foreground" />
                     </CardHeader>
                     <CardContent>
                        {/* Get steps from the second to last entry in wearable data */}
                         <div className="text-2xl font-bold">{patient.wearableData[patient.wearableData.length - 2]?.movementData?.stepCount?.toLocaleString() ?? 'N/A'}</div>
                         <p className="text-xs text-muted-foreground">Contagem de passos do dia anterior</p>
                     </CardContent>
                 </Card>
            </div>

            {/* Recent Mood Check-ins Card */}
             <Card>
                <CardHeader>
                    <CardTitle>Últimos Check-ins de Humor</CardTitle>
                </CardHeader>
                <CardContent>
                     {/* Scrollable area for mood check-ins */}
                     <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                        {patient.moodCheckins.slice(0, 5).map(checkin => (
                            <div key={checkin.id} className="flex items-start gap-3 border-b pb-3 last:border-b-0">
                                {getMoodIcon(checkin.mood)}
                                <div className="flex-1">
                                    <div className="flex justify-between items-baseline">
                                         <p className="font-medium">{checkin.mood}</p>
                                         <span className="text-xs text-muted-foreground">{format(checkin.timestamp, 'dd/MM HH:mm', { locale: ptBR })}</span>
                                    </div>
                                    {checkin.symptoms.length > 0 && <p className="text-sm text-muted-foreground mt-1">Sintomas: {checkin.symptoms.join(', ')}</p>}
                                    {checkin.notes && <p className="text-sm text-foreground mt-1 italic">"{checkin.notes}"</p>}
                                </div>
                            </div>
                        ))}
                        {patient.moodCheckins.length === 0 && <p className="text-muted-foreground text-sm text-center py-4">Nenhum check-in de humor registrado recentemente.</p>}
                    </div>
                </CardContent>
            </Card>
        </TabsContent>


        {/* Wearable Data Tab Content */}
        <TabsContent value="wearable" className="mt-4 space-y-4">
          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
             {/* Biofeedback Chart (HR, HRV, EDA) */}
             <Card>
               <CardHeader>
                 <CardTitle>Biofeedback (Histórico)</CardTitle>
                  <CardDescription>Frequência Cardíaca (FC), Variabilidade da FC (VFC) e Atividade Eletrodérmica (AED) - Últimos {chartDataPoints} dias</CardDescription>
               </CardHeader>
               <CardContent>
                 <ChartContainer config={chartConfig} className="h-[250px] w-full">
                   <LineChart data={wearableChartData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                     <CartesianGrid vertical={false} strokeDasharray="3 3" />
                     <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} fontSize={10} />
                     <YAxis yAxisId="left" domain={['dataMin - 5', 'dataMax + 5']} tickFormatter={(value) => Math.round(value)} />
                     <YAxis yAxisId="right" orientation="right" domain={['dataMin - 10', 'dataMax + 10']} tickFormatter={(value) => Math.round(value)} />
                     <YAxis yAxisId="eda" orientation="right" domain={[0, 'dataMax + 0.5']} tickCount={4} stroke="hsl(var(--chart-3))" dx={35} tickFormatter={(value) => value.toFixed(1)}/>
                     <Tooltip content={<ChartTooltipContent indicator="line" />} />
                     <ChartLegend content={<ChartLegendContent />} />
                     <Line type="monotone" dataKey="heartRate" stroke="var(--color-heartRate)" strokeWidth={2} dot={false} yAxisId="left" name={chartConfig.heartRate.label} />
                     <Line type="monotone" dataKey="hrv" stroke="var(--color-hrv)" strokeWidth={2} dot={false} yAxisId="right" name={chartConfig.hrv.label} />
                     <Line type="monotone" dataKey="eda" stroke="var(--color-eda)" strokeWidth={2} dot={false} yAxisId="eda" name={chartConfig.eda.label} />
                   </LineChart>
                 </ChartContainer>
               </CardContent>
             </Card>

              {/* Temperature Chart */}
             <Card>
               <CardHeader>
                 <CardTitle>Temperatura Corporal (Histórico)</CardTitle>
                  <CardDescription>Últimos {chartDataPoints} dias (°C)</CardDescription>
               </CardHeader>
               <CardContent>
                  <ChartContainer config={chartConfig} className="h-[250px] w-full">
                    <AreaChart data={wearableChartData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                       <CartesianGrid vertical={false} strokeDasharray="3 3"/>
                       <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} fontSize={10}/>
                       <YAxis domain={['dataMin - 0.5', 'dataMax + 0.5']} tickCount={4} tickFormatter={(value) => value.toFixed(1)}/>
                       <Tooltip content={<ChartTooltipContent indicator="dot"/>}/>
                       <defs>
                            <linearGradient id="fillTemperature" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--color-temperature)" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="var(--color-temperature)" stopOpacity={0.1}/>
                            </linearGradient>
                        </defs>
                       <Area type="monotone" dataKey="temperature" fill="url(#fillTemperature)" stroke="var(--color-temperature)" stackId="a"/>
                       <ChartLegend content={<ChartLegendContent />} />
                    </AreaChart>
                 </ChartContainer>
               </CardContent>
             </Card>

             {/* Sleep & Movement Chart */}
             <Card className="lg:col-span-2"> {/* Make this chart span full width on larger screens */}
               <CardHeader>
                 <CardTitle>Sono e Movimento (Histórico)</CardTitle>
                  <CardDescription>Duração do Sono (horas) e Passos - Últimos {chartDataPoints} dias</CardDescription>
               </CardHeader>
               <CardContent>
                 <ChartContainer config={chartConfig} className="h-[250px] w-full">
                   <BarChart data={wearableChartData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                     <CartesianGrid vertical={false} strokeDasharray="3 3" />
                     <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} fontSize={10} />
                     <YAxis yAxisId="left" domain={[0, 'dataMax + 1']} tickFormatter={(value) => Math.round(value)} />
                     <YAxis yAxisId="right" orientation="right" domain={[0, 'dataMax + 1000']} tickFormatter={(value) => (value / 1000).toFixed(0) + 'k'}/>
                     <Tooltip content={<ChartTooltipContent />} />
                     <ChartLegend content={<ChartLegendContent />} />
                     <Bar dataKey="sleep" fill="var(--color-sleep)" radius={[4, 4, 0, 0]} yAxisId="left" name={chartConfig.sleep.label}/>
                     <Bar dataKey="steps" fill="var(--color-steps)" radius={[4, 4, 0, 0]} yAxisId="right" name={chartConfig.steps.label}/>
                   </BarChart>
                 </ChartContainer>
               </CardContent>
             </Card>
           </div>
        </TabsContent>

        {/* Medications Tab Content */}
        <TabsContent value="medications" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Medicações Prescritas</CardTitle>
              <CardDescription>Lista de medicamentos atuais, horários e lembretes.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Dosagem</TableHead>
                    <TableHead>Horário</TableHead>
                    <TableHead className="text-center">Lembretes</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patient.medications.map((med) => (
                    <TableRow key={med.id}>
                      <TableCell className="font-medium">{med.name}</TableCell>
                      <TableCell>{med.dosage}</TableCell>
                      <TableCell>{med.schedule}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={med.remindersEnabled ? "default" : "outline"} className={med.remindersEnabled ? "bg-green-100 text-green-800 border-green-300" : ""}>
                          {med.remindersEnabled ? <><CheckCircle className="h-3 w-3 mr-1"/> Ativado</> : <><XCircle className="h-3 w-3 mr-1"/> Desativado</>}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                          {/* Placeholder buttons for actions - visually disabled */}
                         <Button variant="ghost" size="icon" disabled className="text-muted-foreground cursor-not-allowed"> <Edit className="h-4 w-4"/> </Button>
                         <Button variant="ghost" size="icon" disabled className="text-muted-foreground cursor-not-allowed"> <Trash className="h-4 w-4"/> </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                   {patient.medications.length === 0 && (
                       <TableRow>
                           <TableCell colSpan={5} className="text-center text-muted-foreground h-24">Nenhuma medicação registrada para este paciente.</TableCell>
                       </TableRow>
                   )}
                </TableBody>
              </Table>
               {/* Button to add medication (disabled placeholder) */}
               <Button variant="outline" size="sm" className="mt-4" disabled>
                   <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Medicação
               </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notes Tab Content */}
        <TabsContent value="notes" className="mt-4 space-y-4">
           <Card>
                <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                     <div>
                        <CardTitle>Anotações Clínicas</CardTitle>
                        <CardDescription>Observações e notas sobre o paciente.</CardDescription>
                    </div>
                     {/* Toggle button for adding a new note */}
                     <Button variant="outline" size="sm" onClick={() => setIsAddingNote(!isAddingNote)}>
                        <PlusCircle className="mr-2 h-4 w-4" /> {isAddingNote ? "Cancelar" : "Nova Nota"}
                     </Button>
                </CardHeader>
                <CardContent>
                   {/* Form for adding a new note */}
                   {isAddingNote && (
                        <div className="mb-6 p-4 border rounded-lg space-y-4 bg-muted/50">
                            <h3 className="text-lg font-medium">Adicionar Nova Nota</h3>
                             <div className="space-y-1.5">
                                <Label htmlFor="noteTitle">Título *</Label>
                                <Input
                                    id="noteTitle"
                                    value={newNoteTitle}
                                    onChange={(e) => setNewNoteTitle(e.target.value)}
                                    placeholder="Ex: Sessão 15/07, Observação Rápida"
                                />
                            </div>
                             <div className="space-y-1.5">
                                <Label htmlFor="noteContent">Conteúdo *</Label>
                                <Textarea
                                    id="noteContent"
                                    value={newNoteContent}
                                    onChange={(e) => setNewNoteContent(e.target.value)}
                                    placeholder="Escreva sua nota clínica aqui..."
                                    rows={5}
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button variant="ghost" onClick={() => { setIsAddingNote(false); setNewNoteTitle(""); setNewNoteContent(""); }}>Cancelar</Button>
                                <Button onClick={handleAddNote}>Salvar Nota</Button>
                             </div>
                        </div>
                    )}

                    {/* List of existing notes */}
                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                        {patient.notes.map(note => (
                            <div key={note.id} className="p-4 border rounded-md bg-card shadow-sm">
                                <div className="flex justify-between items-start gap-2">
                                    <h4 className="font-medium text-base flex-1">{note.title}</h4>
                                     {/* Placeholder buttons for note actions */}
                                     <div className="flex gap-1">
                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" disabled title="Editar (Em breve)">
                                            <span className="sr-only">Editar</span>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                         <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive/70 hover:text-destructive" disabled title="Excluir (Em breve)">
                                            <span className="sr-only">Excluir</span>
                                             <Trash className="h-4 w-4" />
                                         </Button>
                                     </div>
                                </div>
                                 <p className="text-sm mt-2 whitespace-pre-wrap">{note.content}</p> {/* Preserve line breaks */}
                                 <p className="text-xs text-muted-foreground mt-3 pt-2 border-t border-dashed">
                                     Criado em: {format(note.createdAt, 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                                      {note.createdAt.getTime() !== note.updatedAt.getTime() && ` | Atualizado em: ${format(note.updatedAt, 'dd/MM/yyyy HH:mm', { locale: ptBR })}`}
                                </p>
                            </div>
                        ))}
                        {/* Message if no notes exist */}
                        {patient.notes.length === 0 && !isAddingNote && (
                            <div className="text-center py-16 text-muted-foreground">
                                <FileText className="mx-auto h-12 w-12 mb-2" />
                                Nenhuma anotação clínica registrada para este paciente.
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </TabsContent>


        {/* History Tab Content */}
        <TabsContent value="history" className="mt-4">
            <Card>
                <CardHeader>
                    <CardTitle>Histórico do Tratamento</CardTitle>
                    <CardDescription>Linha do tempo cronológica de eventos importantes do paciente.</CardDescription>
                </CardHeader>
                 <CardContent>
                     {/* Timeline Component */}
                     <div className="space-y-6 max-h-[600px] overflow-y-auto relative pl-8 before:absolute before:top-0 before:left-[1.125rem] before:bottom-0 before:w-0.5 before:bg-border">
                        {patient.treatmentHistory.map((event, index) => (
                             <div key={event.id} className="relative flex items-start gap-4">
                                 {/* Timeline Icon */}
                                 <div className="absolute top-0 left-0 flex h-9 w-9 items-center justify-center rounded-full bg-background border-2 border-primary/50 z-10 -translate-x-1/2 translate-y-[-2px]">
                                      {getTreatmentEventIcon(event.type)}
                                  </div>
                                  {/* Timeline Content */}
                                  <div className="ml-8 pt-1 flex-1">
                                       <p className="font-medium text-sm leading-tight">{event.description}</p>
                                       <p className="text-xs text-muted-foreground mt-0.5">{format(event.timestamp, 'dd/MM/yyyy HH:mm', { locale: ptBR })}</p>
                                       {/* Optionally display more details based on event.details - Example for Insights */}
                                       {event.type === 'insight' && typeof event.details === 'string' && (
                                           <p className="text-xs text-muted-foreground italic mt-1">"{event.details}"</p>
                                       )}
                                        {/* Example for Notes */}
                                       {event.type === 'note' && event.details && typeof event.details === 'object' && 'content' in event.details && (
                                           <p className="text-xs text-muted-foreground italic mt-1 truncate">"{String(event.details.content)}"</p>
                                       )}
                                  </div>
                              </div>
                        ))}
                        {/* Message if history is empty */}
                        {patient.treatmentHistory.length === 0 && (
                           <div className="text-center py-16 text-muted-foreground">
                               <CalendarDays className="mx-auto h-12 w-12 mb-2" />
                               Nenhum evento registrado no histórico do paciente.
                           </div>
                        )}
                     </div>
                 </CardContent>
            </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}

