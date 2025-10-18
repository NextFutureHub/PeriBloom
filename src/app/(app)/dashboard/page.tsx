"use client";

import { useAppData } from '@/hooks/use-app-data';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Bot, BookHeart, HeartPulse } from 'lucide-react';
import { differenceInWeeks, differenceInMonths, differenceInDays } from 'date-fns';
import Link from 'next/link';

export default function DashboardPage() {
  const { userData } = useAppData();

  const getStatus = () => {
    if (!userData) return { title: '', value: '' };

    const now = new Date();
    switch (userData.lifecycleStage) {
      case 'pregnancy':
        if (!userData.dueDate) return { title: '', value: '' };
        const dueDate = new Date(userData.dueDate);
        const lmpDate = new Date(dueDate.getTime() - 40 * 7 * 24 * 60 * 60 * 1000);
        const weeks = differenceInWeeks(now, lmpDate);
        return { title: 'Неделя беременности', value: `${weeks}` };
      case 'postpartum':
      case 'childcare':
        if (!userData.birthDate) return { title: '', value: '' };
        const birthDate = new Date(userData.birthDate);
        const months = differenceInMonths(now, birthDate);
        const days = differenceInDays(now, birthDate) % 30;
        if (months > 0) {
            return { title: 'Возраст ребенка', value: `${months} мес. ${days} д.` };
        }
        return { title: 'Возраст ребенка', value: `${days} д.` };
      default:
        return { title: '', value: '' };
    }
  };

  const { title, value } = getStatus();

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold font-headline">Добро пожаловать, {userData?.name}!</h1>
        <p className="text-muted-foreground">Готовы помочь вам на каждом шагу.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">{title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-5xl font-bold text-primary">{value}</p>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Рекомендация дня</CardTitle>
          </CardHeader>
          <CardContent>
             <p className="text-muted-foreground">Не забывайте пить достаточно воды в течение дня. Гидратация важна для вас и вашего малыша. Попробуйте выпивать не менее 8 стаканов воды.</p>
             <Button variant="link" className="px-0">Узнать больше <ArrowRight className="ml-2 h-4 w-4" /></Button>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-bold font-headline">Быстрые действия</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Link href="/symptom-journal">
          <Card className="hover:bg-secondary transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">Добавить симптом</CardTitle>
              <BookHeart className="h-6 w-6 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Запишите свое самочувствие, чтобы отслеживать изменения.</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/ai-assistant">
          <Card className="hover:bg-secondary transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">AI-ассистент</CardTitle>
              <Bot className="h-6 w-6 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Задайте вопрос и получите персональный совет.</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/triage">
          <Card className="hoverbg-secondary transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">Triage-анализ</CardTitle>
              <HeartPulse className="h-6 w-6 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Оцените свои симптомы с помощью AI.</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
