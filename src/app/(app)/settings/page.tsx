"use client";

import { useRouter } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppData } from '@/hooks/use-app-data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function SettingsPage() {
  const { resetAllData, userData } = useAppData();
  const router = useRouter();

  const handleReset = () => {
    resetAllData();
    router.push('/');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold font-headline">Настройки</h2>
        <p className="text-muted-foreground">Управляйте данными вашего приложения.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Язык интерфейса</CardTitle>
          <CardDescription>Выберите предпочитаемый язык.</CardDescription>
        </CardHeader>
        <CardContent>
            <Select defaultValue={userData?.language || 'ru'}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="ru">Русский</SelectItem>
                    <SelectItem value="kk">Қазақша</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-2">Функция переключения языка находится в разработке.</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Управление данными</CardTitle>
          <CardDescription>Сброс данных приведет к удалению всей вашей информации из приложения.</CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Сбросить все данные</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
                <AlertDialogDescription>
                  Это действие необратимо. Все ваши данные, включая журнал симптомов и историю чатов, будут удалены.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Отмена</AlertDialogCancel>
                <AlertDialogAction onClick={handleReset} className="bg-destructive hover:bg-destructive/90">
                  Да, сбросить данные
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>О приложении</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Версия приложения: 1.0.0 (alpha)</p>
          <p className="text-muted-foreground">PeriBloom &copy; {new Date().getFullYear()}</p>
        </CardContent>
      </Card>
    </div>
  );
}
