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
import { ArrowUp, ArrowDown, Minus, UserPlus, Filter } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale'; // Import Portuguese locale

export default function PatientsPage() {
  const [allPatients, setAllPatients] = React.useState<PatientSummary[]>([]);
  const [filteredPatients, setFilteredPatients] = React.useState<PatientSummary[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [sortConfig, setSortConfig] = React.useState<{ key: keyof PatientSummary | null; direction: 'ascending' | 'descending' }>({ key: null, direction: 'ascending' });
  const [filterMood, setFilterMood] = React.useState<string[]>([]);
  const [filterAdherence, setFilterAdherence] = React.useState<string | null>(null); // 'low', 'medium', 'high'

  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const data = await getMockPatientSummaries();
      setAllPatients(data);
      // setFilteredPatients(data); // Initialize filtered list - Let useEffect handle this
      setLoading(false);
    };
    fetchData();
  }, []);

  // Filtering logic
  React.useEffect(() => {
    let tempPatients = [...allPatients];

    // Search term filter
    if (searchTerm) {
        tempPatients = tempPatients.filter(patient =>
            patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            patient.id.toLowerCase().includes(searchTerm.toLowerCase()) // Allow searching by ID
        );
    }

    // Mood filter
    if (filterMood.length > 0) {
        tempPatients = tempPatients.filter(patient =>
            patient.lastMood && filterMood.includes(patient.lastMood)
        );
    }

     // Adherence filter
    if (filterAdherence) {
        tempPatients = tempPatients.filter(patient => {
            const adherence = patient.medicationAdherence ?? -1; // Treat null/undefined as -1 for filtering
             if (adherence === -1 && filterAdherence !== null) return false; // Don't include N/A if filtering by adherence level
            if (filterAdherence === 'low') return adherence < 70;
            if (filterAdherence === 'medium') return adherence >= 70 && adherence < 90;
            if (filterAdherence === 'high') return adherence >= 90;
            return true; // Should not happen if filterAdherence is set
        });
    }

    setFilteredPatients(tempPatients);
  }, [searchTerm, allPatients, filterMood, filterAdherence]);


  // Sorting logic
  const sortedPatients = React.useMemo(() => {
    let sortableItems = [...filteredPatients];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        const key = sortConfig.key!;
        const direction = sortConfig.direction === 'ascending' ? 1 : -1;

        const valA = a[key];
        const valB = b[key];

        // Handle different data types
        if (typeof valA === 'string' && typeof valB === 'string') {
           return valA.localeCompare(valB) * direction;
        } else if (typeof valA === 'number' && typeof valB === 'number') {
            return (valA - valB) * direction;
        } else if (valA instanceof Date && valB instanceof Date) {
            return (valA.getTime() - valB.getTime()) * direction;
        }
        // Handle null/undefined - place them at the end when ascending
        else if (valA === null || valA === undefined) {
            return 1 * direction;
        } else if (valB === null || valB === undefined) {
            return -1 * direction;
        }
        // Fallback for potentially mixed types (should ideally not happen with good typing)
        else {
             const strA = String(valA).toLowerCase();
             const strB = String(valB).toLowerCase();
            if (strA < strB) return -1 * direction;
            if (strA > strB) return 1 * direction;
            return 0;
        }
      });
    }
    return sortableItems;
  }, [filteredPatients, sortConfig]);

  const requestSort = (key: keyof PatientSummary) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key: keyof PatientSummary) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'ascending' ? ' ▲' : ' ▼';
  };


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
    if (adherence === undefined || adherence === null) return 'bg-gray-300'; // More visible gray
    if (adherence >= 90) return 'bg-green-500';
    if (adherence >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

   const handleMoodFilterChange = (mood: string, checked: boolean) => {
        setFilterMood(prev =>
            checked ? [...prev, mood] : prev.filter(m => m !== mood)
        );
    };

    const handleAdherenceFilterChange = (level: string | null, checked: boolean) => {
        // Allow only one adherence level selection at a time
        setFilterAdherence(checked ? level : null);
    };

    const availableMoods = React.useMemo(() => {
        const moods = new Set(allPatients.map(p => p.lastMood).filter(Boolean) as string[]);
        return Array.from(moods).sort(); // Sort moods alphabetically
    }, [allPatients]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold">Pacientes</h1>

      <Card>
        <CardHeader>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                 <div>
                    <CardTitle>Lista de Pacientes</CardTitle>
                    <CardDescription>
                      Gerencie e visualize os detalhes dos seus pacientes.
                    </CardDescription>
                </div>
                 <div className="flex items-center gap-2 w-full md:w-auto">
                    <Input
                        placeholder="Buscar por nome ou ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="max-w-sm flex-grow md:flex-grow-0" // Make input take available space on mobile
                    />
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                                <Filter className="mr-2 h-4 w-4" /> Filtrar
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>Filtrar por Humor</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {availableMoods.length > 0 ? availableMoods.map(mood => (
                                <DropdownMenuCheckboxItem
                                    key={mood}
                                    checked={filterMood.includes(mood)}
                                    onCheckedChange={(checked) => handleMoodFilterChange(mood, !!checked)}
                                >
                                    {mood}
                                </DropdownMenuCheckboxItem>
                            )) : <div className="px-2 py-1.5 text-sm text-muted-foreground">Nenhum humor registrado</div>}
                             <DropdownMenuSeparator />
                             <DropdownMenuLabel>Filtrar por Adesão</DropdownMenuLabel>
                             <DropdownMenuSeparator />
                              <DropdownMenuCheckboxItem
                                    checked={filterAdherence === 'high'}
                                    onCheckedChange={(checked) => handleAdherenceFilterChange('high', !!checked)}
                                >
                                    Alta (&ge; 90%)
                                </DropdownMenuCheckboxItem>
                               <DropdownMenuCheckboxItem
                                    checked={filterAdherence === 'medium'}
                                    onCheckedChange={(checked) => handleAdherenceFilterChange('medium', !!checked)}
                                >
                                    Média (70-89%)
                                </DropdownMenuCheckboxItem>
                                <DropdownMenuCheckboxItem
                                    checked={filterAdherence === 'low'}
                                    onCheckedChange={(checked) => handleAdherenceFilterChange('low', !!checked)}
                                >
                                    Baixa (&lt; 70%)
                                </DropdownMenuCheckboxItem>
                                <DropdownMenuCheckboxItem // Option to show patients with no adherence data
                                    checked={filterAdherence === 'none'}
                                    onCheckedChange={(checked) => handleAdherenceFilterChange('none', !!checked)}
                                >
                                    Não Registrada (N/A)
                                </DropdownMenuCheckboxItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Button asChild size="sm" className="whitespace-nowrap">
                        <Link href="/patients/new"><UserPlus className="mr-2 h-4 w-4" /> Novo Paciente</Link>
                    </Button>
                </div>
            </div>

        </CardHeader>
        <CardContent>
           {loading ? (
             <div className="space-y-2">
                {/* More skeleton rows for better loading feel */}
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
             </div>
          ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead onClick={() => requestSort('name')} className="cursor-pointer hover:bg-accent transition-colors w-[25%]">
                    Nome {getSortIndicator('name')}
                </TableHead>
                <TableHead className="hidden md:table-cell w-[15%]">Último Humor</TableHead>
                <TableHead className="hidden lg:table-cell w-[15%]">Tendência Humor</TableHead>
                 <TableHead onClick={() => requestSort('medicationAdherence')} className="cursor-pointer hover:bg-accent transition-colors w-[20%]">
                    Adesão {getSortIndicator('medicationAdherence')}
                 </TableHead>
                {/* <TableHead className="hidden md:table-cell">Atividade Recente</TableHead> */}
                 <TableHead onClick={() => requestSort('lastCheckin')} className="cursor-pointer hover:bg-accent transition-colors hidden lg:table-cell w-[15%]">
                    Último Check-in {getSortIndicator('lastCheckin')}
                 </TableHead>
                <TableHead className="text-right w-[10%]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedPatients.map((patient) => (
                <TableRow key={patient.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="font-medium">{patient.name}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {patient.lastMood ? (
                      <Badge variant="secondary">{patient.lastMood}</Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">N/A</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                     <div className="flex items-center gap-1">
                        {getTrendIcon(patient.moodTrend)}
                        <span className="text-xs capitalize text-muted-foreground">{patient.moodTrend ?? 'estável'}</span>
                     </div>
                  </TableCell>
                  <TableCell>
                     <div className="flex items-center gap-2">
                       <div className="w-16 h-2 rounded-full bg-muted" title={`Adesão: ${patient.medicationAdherence ?? 'N/A'}%`}>
                          <div
                            className={`h-2 rounded-full ${getAdherenceColor(patient.medicationAdherence)}`}
                            style={{ width: `${patient.medicationAdherence ?? 0}%` }}
                          ></div>
                       </div>
                       <span className="text-xs text-muted-foreground">{patient.medicationAdherence !== null && patient.medicationAdherence !== undefined ? `${patient.medicationAdherence}%` : 'N/A'}</span>
                     </div>
                  </TableCell>
                  {/* <TableCell className="hidden md:table-cell">
                    {patient.recentActivity ?? <span className="text-xs text-muted-foreground">Nenhuma</span>}
                  </TableCell> */}
                  <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                     {patient.lastCheckin ? formatDistanceToNow(patient.lastCheckin, { addSuffix: true, locale: ptBR }) : <span className="text-xs text-muted-foreground">N/A</span>}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/patients/${patient.id}`}>Ver Perfil</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
           )}
           { !loading && sortedPatients.length === 0 && (
             <div className="text-center py-16 text-muted-foreground">
               <p>Nenhum paciente encontrado.</p>
                {(searchTerm || filterMood.length > 0 || filterAdherence) && <p className="text-sm mt-1">Tente ajustar os filtros ou termo de busca.</p>}
             </div>
           )}
        </CardContent>
      </Card>
    </div>
  );
}
