"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState } from 'react';
import { AlertCircle, CheckCircle, ShieldAlert } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getTriageAnalysis } from './triage/actions';
import { AnalyzeSymptomsOutput } from '@/ai/flows/ai-symptom-triage';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

const triageSchema = z.object({
  symptomsDescription: z.string().min(10, 'Пожалуйста, опишите ваши симптомы подробнее (минимум 10 символов).'),
});

const RiskResult = ({ result }: { result: AnalyzeSymptomsOutput }) => {
  const riskMap = {
    low: {
      label: 'Низкий риск',
      icon: CheckCircle,
      badgeClass: 'bg-green-100 text-green-800 border-green-200',
      cardClass: 'border-green-200',
    },
    medium: {
      label: 'Средний риск',
      icon: AlertCircle,
      badgeClass: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      cardClass: 'border-yellow-200',
    },
    high: {
      label: 'Высокий риск',
      icon: ShieldAlert,
      badgeClass: 'bg-red-100 text-red-800 border-red-200',
      cardClass: 'border-red-200',
    },
  };
  const { label, icon: Icon, badgeClass, cardClass } = riskMap[result.riskLevel];

  return (
    <Card className={cn('mt-6', cardClass)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Результат анализа</CardTitle>
          <Badge variant="outline" className={cn('text-sm', badgeClass)}>
            <Icon className="mr-2 h-4 w-4" />
            {label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
            <h4 className="font-semibold">Рекомендации:</h4>
            <p className="text-muted-foreground whitespace-pre-wrap">{result.recommendations}</p>
        </div>
        <p className="text-xs text-muted-foreground pt-4">
          Отказ от ответственности: Этот анализ предоставлен AI и не является медицинской консультацией. Пожалуйста, обратитесь к врачу для получения точного диагноза.
        </p>
      </CardContent>
    </Card>
  );
};

export default function TriagePage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeSymptomsOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof triageSchema>>({
    resolver: zodResolver(triageSchema),
    defaultValues: { symptomsDescription: '' },
  });

  const onSubmit = async (values: z.infer<typeof triageSchema>) => {
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setError(null);

    const result = await getTriageAnalysis(values);
    if (result.success) {
      setAnalysisResult({ riskLevel: result.riskLevel!, recommendations: result.recommendations! });
    } else {
      setError(result.error || 'Произошла неизвестная ошибка.');
    }
    setIsAnalyzing(false);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>AI Triage-анализ</CardTitle>
          <CardDescription>Опишите ваши симптомы, и AI поможет оценить уровень риска и даст рекомендации.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="symptomsDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Описание симптомов</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={6}
                        placeholder="Например: 'У меня сильная головная боль в области висков, тошнота и чувствительность к свету. Это продолжается уже 3 часа.'"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isAnalyzing}>
                {isAnalyzing ? 'Анализируем...' : 'Проанализировать'}
              </Button>
            </form>
          </Form>

          {isAnalyzing && (
            <div className="mt-6 space-y-4">
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-20 w-full" />
            </div>
          )}

          {error && <p className="mt-4 text-destructive">{error}</p>}
          
          {analysisResult && <RiskResult result={analysisResult} />}
        </CardContent>
      </Card>
    </div>
  );
}
