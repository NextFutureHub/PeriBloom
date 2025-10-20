"use client";

import { useState } from 'react';
import { PlusCircle, Brain } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useAppData } from '@/hooks/use-app-data';
import SymptomCalendar from './symptom-journal/symptom-calendar';
import { SymptomForm } from './symptom-journal/symptom-form';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { generateSymptomReport } from './symptom-journal/pdf-export';
import { useNavigate } from 'react-router-dom';

export default function SymptomJournalPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { symptoms, userData } = useAppData();
  const navigate = useNavigate();

  const symptomsForSelectedDate = symptoms.filter(
    (symptom) => symptom.date === format(selectedDate, 'yyyy-MM-dd')
  ).sort((a, b) => a.time.localeCompare(b.time));

  const handleExport = async () => {
    if (userData) {
      await generateSymptomReport(symptoms, userData);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
            <h2 className="text-2xl font-semibold font-headline">Журнал симптомов</h2>
            <p className="text-muted-foreground">Отслеживайте свое самочувствие день за днем.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleExport} disabled={symptoms.length === 0} className="w-full sm:w-auto">
            Экспорт в PDF
          </Button>
          {symptomsForSelectedDate.length > 0 && (
            <Button 
              variant="outline" 
              onClick={() => navigate('/app/ai-health?tab=triage')} 
              className="w-full sm:w-auto"
            >
              <Brain className="mr-2 h-4 w-4" />
              Анализировать симптомы
            </Button>
          )}
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <PlusCircle className="mr-2 h-4 w-4" />
                Добавить запись
              </Button>
            </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Добавить запись о симптоме</DialogTitle>
                        <DialogDescription>
                            Опишите ваше самочувствие как можно точнее для {format(selectedDate, 'd MMMM yyyy', { locale: ru })}.
                        </DialogDescription>
                    </DialogHeader>
                    <SymptomForm setFormOpen={setIsFormOpen} selectedDate={selectedDate} />
                </DialogContent>
            </Dialog>
        </div>
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-0">
              <SymptomCalendar
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                symptoms={symptoms}
              />
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>
                Записи за {format(selectedDate, 'd MMMM yyyy', { locale: ru })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[450px]">
                {symptomsForSelectedDate.length > 0 ? (
                  <div className="space-y-4">
                    {symptomsForSelectedDate.map((symptom) => (
                      <div key={symptom.id} className="rounded-lg border p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <p className="font-semibold">{symptom.symptom}</p>
                            <p className="text-sm text-muted-foreground">{symptom.time}</p>
                          </div>
                          <Badge variant={symptom.severity === 'high' ? 'destructive' : symptom.severity === 'medium' ? 'secondary' : 'default'}
                            className={symptom.severity === 'medium' ? 'bg-yellow-200 text-yellow-800' : ''}>
                            {symptom.severity === 'low' ? 'Низкая' : symptom.severity === 'medium' ? 'Средняя' : 'Высокая'}
                          </Badge>
                        </div>
                        {symptom.comment && (
                          <p className="mt-2 text-sm text-muted-foreground italic">"{symptom.comment}"</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex h-[400px] flex-col items-center justify-center text-center text-muted-foreground">
                    <p>Нет записей за эту дату.</p>
                    <p className="text-sm">Выберите другую дату или добавьте новую запись.</p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
