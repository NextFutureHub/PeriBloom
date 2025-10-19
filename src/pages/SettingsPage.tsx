import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useAppData } from '@/hooks/use-app-data';
import { User, Bell, Shield, Trash2 } from 'lucide-react';

export default function SettingsPage() {
  const { userData, setUserData, resetAllData } = useAppData();

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (userData) {
      setUserData({ ...userData, name: e.target.value });
    }
  };

  const handleLifecycleStageChange = (value: string) => {
    if (userData) {
      setUserData({ ...userData, lifecycleStage: value as 'pregnancy' | 'postpartum' | 'childcare' });
    }
  };

  const handleResetData = () => {
    if (confirm('Вы уверены, что хотите удалить все данные? Это действие нельзя отменить.')) {
      resetAllData();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold font-headline">Настройки</h2>
        <p className="text-muted-foreground">Управляйте своими данными и предпочтениями</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <User className="h-6 w-6 text-primary" />
              <div>
                <CardTitle>Личная информация</CardTitle>
                <CardDescription>Основные данные профиля</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Имя</Label>
              <Input
                id="name"
                value={userData?.name || ''}
                onChange={handleNameChange}
                placeholder="Введите ваше имя"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lifecycle">Этап жизни</Label>
              <Select value={userData?.lifecycleStage || ''} onValueChange={handleLifecycleStageChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите этап жизни" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pregnancy">Беременность</SelectItem>
                  <SelectItem value="postpartum">Послеродовой период</SelectItem>
                  <SelectItem value="childcare">Уход за ребенком</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Bell className="h-6 w-6 text-primary" />
              <div>
                <CardTitle>Уведомления</CardTitle>
                <CardDescription>Настройки уведомлений</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Напоминания о симптомах</Label>
                <p className="text-sm text-muted-foreground">
                  Ежедневные напоминания вести журнал симптомов
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Уведомления от AI</Label>
                <p className="text-sm text-muted-foreground">
                  Полезные советы и рекомендации
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Экстренные уведомления</Label>
                <p className="text-sm text-muted-foreground">
                  Важные медицинские предупреждения
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>Конфиденциальность</CardTitle>
              <CardDescription>Управление данными и безопасностью</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Анонимная аналитика</Label>
              <p className="text-sm text-muted-foreground">
                Помочь улучшить приложение, отправляя анонимные данные об использовании
              </p>
            </div>
            <Switch />
          </div>
          <Separator />
          <div className="space-y-2">
            <Label>Экспорт данных</Label>
            <p className="text-sm text-muted-foreground">
              Скачайте копию всех ваших данных
            </p>
            <Button variant="outline" size="sm">
              Экспортировать данные
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-red-200">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Trash2 className="h-6 w-6 text-red-500" />
            <div>
              <CardTitle className="text-red-600">Опасная зона</CardTitle>
              <CardDescription>Необратимые действия</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-red-600">Удалить все данные</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Это действие удалит все ваши данные, включая журнал симптомов, 
                сообщения с AI и настройки. Это действие нельзя отменить.
              </p>
              <Button variant="destructive" onClick={handleResetData}>
                <Trash2 className="mr-2 h-4 w-4" />
                Удалить все данные
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
