"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Bot, HeartPulse, MessageCircle, Send, Trash2 } from 'lucide-react';

import { useAppData } from '@/hooks/use-app-data';
import { useTranslation } from '@/hooks/use-translation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getAIResponse } from './ai-assistant/actions';
import { getTriageAnalysis } from './triage/actions';
import { AnalyzeSymptomsOutput } from '@/ai/flows/ai-symptom-triage';
import { Skeleton } from '@/components/ui/skeleton';

const chatSchema = z.object({
  query: z.string().min(1, "Сообщение не может быть пустым"),
});

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

export default function AIHealthPage() {
  const { userData, aiMessages, addAIMessage, clearAIChat } = useAppData();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('chat');
  const [isThinking, setIsThinking] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeSymptomsOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const scrollAreaRef = React.useRef<HTMLDivElement>(null);
  
  const chatForm = useForm<z.infer<typeof chatSchema>>({
    resolver: zodResolver(chatSchema),
    defaultValues: { query: "" },
  });

  const triageForm = useForm<z.infer<typeof triageSchema>>({
    resolver: zodResolver(triageSchema),
    defaultValues: { symptomsDescription: '' },
  });

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  };

  React.useEffect(() => {
    console.log('aiMessages updated:', aiMessages);
    scrollToBottom();
  }, [aiMessages]);

  // Обработка параметра tab из URL
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'triage') {
      setActiveTab('triage');
    }
  }, [searchParams]);

  const onChatSubmit = async (values: z.infer<typeof chatSchema>) => {
    const userMessage = {
      id: new Date().toISOString(),
      role: 'user' as const,
      content: values.query,
    };
    
    // Добавляем сообщение пользователя сразу
    console.log('Adding user message:', userMessage);
    addAIMessage(userMessage);
    // Сбрасываем форму сразу после добавления сообщения
    chatForm.reset();
    setIsThinking(true);
    
    // Прокручиваем к новому сообщению
    setTimeout(scrollToBottom, 100);

    try {
      if (userData) {
          // Подготавливаем историю сообщений для ИИ (последние 20 сообщений)
          const messageHistory = aiMessages.slice(-20).map(msg => ({
            role: msg.role,
            content: msg.content
          }));
          
          const result = await getAIResponse({
              lifecycleStage: userData.lifecycleStage,
              query: values.query,
              messageHistory: messageHistory
          });

          const aiResponse = {
              id: new Date().toISOString() + '-ai-' + Math.random().toString(36).substr(2, 9),
              role: 'assistant' as const,
              content: result.success ? result.response : 'Произошла ошибка при обработке запроса',
          };
          
          console.log('Adding AI response:', aiResponse);
          addAIMessage(aiResponse);
      }
    } catch (error) {
      console.error('Ошибка при получении ответа от AI:', error);
      const errorResponse = {
        id: new Date().toISOString() + '-error-' + Math.random().toString(36).substr(2, 9),
        role: 'assistant' as const,
        content: 'Извините, произошла ошибка при обработке вашего запроса. Попробуйте еще раз.',
      };
      addAIMessage(errorResponse);
    }
    
    setIsThinking(false);
    setTimeout(scrollToBottom, 100);
  };

  const onTriageSubmit = async (values: z.infer<typeof triageSchema>) => {
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setError(null);

    try {
      const result = await getTriageAnalysis(values);
      if (result.success) {
        setAnalysisResult({ riskLevel: result.riskLevel!, recommendations: result.recommendations! });
      } else {
        setError('Не удалось проанализировать симптомы. Попробуйте еще раз.');
      }
    } catch (err) {
      setError('Произошла ошибка при анализе. Попробуйте еще раз.');
    }
    setIsAnalyzing(false);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4">
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h2 className="text-2xl font-semibold font-headline">{t('aiHealth.title')}</h2>
          <p className="text-muted-foreground">{t('aiHealth.subtitle')}</p>
        </div>
        {activeTab === 'chat' && (
          <Button variant="ghost" size="icon" onClick={clearAIChat} disabled={aiMessages.length === 0}>
              <Trash2 className="h-5 w-5"/>
              <span className="sr-only">{t('aiHealth.chat.clearChat')}</span>
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            {t('aiHealth.chat.title')}
          </TabsTrigger>
          <TabsTrigger value="triage" className="flex items-center gap-2">
            <HeartPulse className="h-4 w-4" />
            {t('aiHealth.triage.title')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="flex-1">
          <Card className="h-full">
            <CardContent className="p-0 flex flex-col">
              <ScrollArea className="flex-1 rounded-md border p-4" ref={scrollAreaRef}>
                <div className="space-y-6">
                  {aiMessages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex items-start gap-3",
                        message.role === "user" && "justify-end"
                      )}
                    >
                      {message.role === "assistant" && (
                        <Avatar className="h-9 w-9">
                          <AvatarFallback><Bot /></AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={cn(
                          "max-w-md rounded-lg p-3",
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary"
                        )}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                      {message.role === "user" && (
                         <Avatar className="h-9 w-9">
                          <AvatarImage src={`https://i.pravatar.cc/150?u=${userData?.name}`} />
                          <AvatarFallback>{userData?.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}
                  {isThinking && (
                     <div className="flex items-start gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback><Bot /></AvatarFallback>
                        </Avatar>
                        <div className="max-w-md rounded-lg p-3 bg-secondary space-y-2">
                            <Skeleton className="h-3 w-48" />
                            <Skeleton className="h-3 w-32" />
                        </div>
                     </div>
                  )}
                  {aiMessages.length === 0 && !isThinking && (
                    <div className="text-center text-muted-foreground pt-16">
                      <Bot className="mx-auto h-12 w-12" />
                      <p className="mt-4">Задайте мне любой вопрос о вашем состоянии, уходе за ребенком или просто пообщайтесь.</p>
                    </div>
                  )}
                </div>
              </ScrollArea>

              <div className="p-4 border-t flex-shrink-0">
                <Form {...chatForm}>
                  <form onSubmit={chatForm.handleSubmit(onChatSubmit)} className="flex items-center gap-2">
                    <FormField
                      control={chatForm.control}
                      name="query"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input placeholder={t('aiHealth.chat.placeholder')} {...field} disabled={isThinking} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <Button type="submit" size="icon" disabled={isThinking}>
                      <Send className="h-5 w-5" />
                    </Button>
                  </form>
                </Form>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="triage" className="flex-1">
          <Card className="h-full">
            <CardHeader>
            <CardTitle>{t('aiHealth.triage.title')}</CardTitle>
            <CardDescription>{t('aiHealth.triage.subtitle')}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col h-full">
              <Form {...triageForm}>
                <form onSubmit={triageForm.handleSubmit(onTriageSubmit)} className="space-y-6">
                  <FormField
                    control={triageForm.control}
                    name="symptomsDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            rows={4}
                            placeholder={t('aiHealth.triage.placeholder')}
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isAnalyzing}>
                    {isAnalyzing ? t('aiHealth.triage.analyzing') : t('aiHealth.triage.analyze')}
                  </Button>
                </form>
              </Form>

              <div className="flex-1 overflow-auto">
                {isAnalyzing && (
                  <div className="mt-6 space-y-4">
                      <Skeleton className="h-8 w-1/3" />
                      <Skeleton className="h-20 w-full" />
                  </div>
                )}

                {error && <p className="mt-4 text-destructive">{error}</p>}
                
                {analysisResult && <RiskResult result={analysisResult} />}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
