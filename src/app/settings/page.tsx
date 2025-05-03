
"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Moon, Sun } from "lucide-react"; // Icons for theme toggle

export default function SettingsPage() {
  const [isDarkMode, setIsDarkMode] = React.useState(false);
  const [isMounted, setIsMounted] = React.useState(false);

  // Effect to run only on the client after hydration
  React.useEffect(() => {
    setIsMounted(true);
    // Check localStorage or system preference on initial load
    const storedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = storedTheme ? storedTheme === 'dark' : prefersDark;
    setIsDarkMode(initialTheme);
    document.documentElement.classList.toggle('dark', initialTheme);
  }, []);

  const handleThemeChange = (checked: boolean) => {
    if (!isMounted) return; // Prevent updates before mount

    setIsDarkMode(checked);
    document.documentElement.classList.toggle('dark', checked);
    localStorage.setItem('theme', checked ? 'dark' : 'light');
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold">Configurações</h1>
      <Card>
        <CardHeader>
          <CardTitle>Preferências</CardTitle>
           <CardDescription>Ajuste as preferências e configurações do NexusView.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
           {/* Theme Toggle Setting */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
             <div className="space-y-1">
                <Label htmlFor="theme-toggle" className="text-base font-medium">
                  Tema Escuro
                </Label>
                <p className="text-sm text-muted-foreground">
                   Ative para usar o modo escuro da aplicação.
                </p>
             </div>
             <div className="flex items-center gap-2">
                 <Sun className={`h-5 w-5 transition-opacity ${isDarkMode ? 'opacity-50' : 'opacity-100'}`} />
                  <Switch
                      id="theme-toggle"
                      checked={isDarkMode && isMounted} // Reflect state only after mount
                      onCheckedChange={handleThemeChange}
                      disabled={!isMounted} // Disable until mounted
                      aria-label="Alternar tema escuro"
                  />
                 <Moon className={`h-5 w-5 transition-opacity ${isDarkMode ? 'opacity-100' : 'opacity-50'}`} />
             </div>
          </div>

           {/* Placeholder for other settings */}
           <div className="p-4 border rounded-lg bg-muted/30">
               <h3 className="font-medium mb-2 text-muted-foreground">Outras Configurações</h3>
               <p className="text-sm text-muted-foreground italic">
                 Mais opções de configuração (ex: notificações, integrações) serão adicionadas aqui em breve.
               </p>
           </div>

        </CardContent>
      </Card>
    </div>
  );
}
