"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { CalendarIcon, Sparkles } from 'lucide-react';
import { format } from 'date-fns';

import { useAppData } from '@/hooks/use-app-data';
import type { LifeCycleStage } from '@/lib/types';
import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

const onboardingSchema = z.object({
  name: z.string().min(2, 'Имя должно содержать не менее 2 символов.'),
  lifecycleStage: z.enum(['pregnancy', 'postpartum', 'childcare'], { required_error: 'Пожалуйста, выберите ваш текущий этап.' }),
  date: z.date({ required_error: 'Пожалуйста, выберите дату.' }),
});

export function Onboarding() {
  const router = useRouter();
  const { setUserData } = useAppData();
  const [step, setStep] = useState(1);

  const form = useForm<z.infer<typeof onboardingSchema>>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      name: '',
    },
  });

  const lifecycleStage = form.watch('lifecycleStage');

  const onSubmit = (values: z.infer<typeof onboardingSchema>) => {
    const userData = {
      name: values.name,
      lifecycleStage: values.lifecycleStage,
      dueDate: values.lifecycleStage === 'pregnancy' ? values.date.toISOString() : undefined,
      birthDate: values.lifecycleStage !== 'pregnancy' ? values.date.toISOString() : undefined,
      language: 'ru' as const,
    };
    setUserData(userData);
    router.push('/dashboard');
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-secondary p-4">
      <Card className="w-full max-w-lg shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Sparkles className="h-8 w-8" />
          </div>
          <CardTitle className="text-3xl font-headline">Добро пожаловать в PeriBloom</CardTitle>
          <CardDescription>Ваш надежный партнер на пути материнства</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {step === 1 && (
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Как вас зовут?</FormLabel>
                        <FormControl>
                          <Input placeholder="Например, Мария" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lifecycleStage"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Какой у вас сейчас этап?</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-2"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="pregnancy" />
                              </FormControl>
                              <FormLabel className="font-normal">Беременность</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="postpartum" />
                              </FormControl>
                              <FormLabel className="font-normal">Послеродовой период</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="childcare" />
                              </FormControl>
                              <FormLabel className="font-normal">Уход за ребенком</FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>
                          {lifecycleStage === 'pregnancy'
                            ? 'Предполагаемая дата родов'
                            : 'Дата рождения ребенка'}
                        </FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Выберите дату</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                lifecycleStage === 'pregnancy' ? date < new Date() : date > new Date()
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              <CardFooter className="flex justify-end p-0 pt-4">
                {step === 1 && (
                  <Button type="button" onClick={() => setStep(2)} disabled={!form.watch('name') || !form.watch('lifecycleStage')}>
                    Далее
                  </Button>
                )}
                {step === 2 && (
                   <div className="flex w-full justify-between">
                     <Button type="button" variant="ghost" onClick={() => setStep(1)}>
                       Назад
                     </Button>
                     <Button type="submit">Начать</Button>
                   </div>
                )}
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
