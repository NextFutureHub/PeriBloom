
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, Mail, Clock, Stethoscope, Heart, Baby } from 'lucide-react';

export default function ContactsPage() {
  const emergencyContacts = [
    {
      name: 'Скорая помощь',
      phone: '103',
      description: 'Экстренная медицинская помощь',
      icon: Stethoscope,
      emergency: true
    },
    {
      name: 'Поликлиника',
      phone: '+7 (XXX) XXX-XX-XX',
      description: 'Участковый врач',
      icon: Heart,
      emergency: false
    }
  ];

  const supportContacts = [
    {
      name: 'Горячая линия поддержки',
      phone: '+7 (800) XXX-XX-XX',
      email: 'support@peribloom.ru',
      description: 'Психологическая поддержка для матерей',
      icon: Heart
    },
    {
      name: 'Консультант по грудному вскармливанию',
      phone: '+7 (XXX) XXX-XX-XX',
      email: 'lactation@peribloom.ru',
      description: 'Помощь с кормлением ребенка',
      icon: Baby
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold font-headline">Контакты и поддержка</h2>
        <p className="text-muted-foreground">Важные контакты для получения помощи и поддержки</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">Экстренные контакты</CardTitle>
            <CardDescription>Немедленно обращайтесь в случае экстренных ситуаций</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {emergencyContacts.map((contact, index) => (
              <div key={index} className="flex items-center gap-4 p-4 rounded-lg border">
                <contact.icon className={`h-8 w-8 ${contact.emergency ? 'text-red-500' : 'text-primary'}`} />
                <div className="flex-1">
                  <h3 className="font-semibold">{contact.name}</h3>
                  <p className="text-sm text-muted-foreground">{contact.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Phone className="h-4 w-4" />
                    <span className="font-mono text-lg">{contact.phone}</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Поддержка и консультации</CardTitle>
            <CardDescription>Специализированная помощь и поддержка</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {supportContacts.map((contact, index) => (
              <div key={index} className="p-4 rounded-lg border">
                <div className="flex items-start gap-3">
                  <contact.icon className="h-6 w-6 text-primary mt-1" />
                  <div className="flex-1">
                    <h3 className="font-semibold">{contact.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{contact.description}</p>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        <span className="text-sm">{contact.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <span className="text-sm">{contact.email}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Режим работы</CardTitle>
          <CardDescription>Когда можно получить помощь</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-primary" />
              <div>
                <h4 className="font-semibold">Экстренные службы</h4>
                <p className="text-sm text-muted-foreground">24/7 - круглосуточно</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-primary" />
              <div>
                <h4 className="font-semibold">Консультации</h4>
                <p className="text-sm text-muted-foreground">Пн-Пт: 9:00-18:00, Сб: 10:00-16:00</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Полезная информация</CardTitle>
          <CardDescription>Дополнительные ресурсы</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-semibold mb-2">В случае сомнений</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Не стесняйтесь обращаться за помощью</li>
                <li>• Лучше перестраховаться</li>
                <li>• Ведите дневник симптомов</li>
                <li>• Доверяйте своей интуиции</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Подготовка к визиту</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Запишите все симптомы</li>
                <li>• Подготовьте вопросы</li>
                <li>• Возьмите медицинскую карту</li>
                <li>• Не забудьте документы</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
