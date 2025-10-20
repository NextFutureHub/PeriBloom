"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { CalendarIcon, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

import { useAppData } from '@/hooks/use-app-data';
import { useTranslation } from '@/hooks/use-translation';
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
  const navigate = useNavigate();
  const { setUserData } = useAppData();
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const totalSteps = 3;

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
      navigate('/app/dashboard');
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-secondary p-4">
      <Card className="w-full max-w-lg shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Sparkles className="h-8 w-8" />
          </div>
                 <CardTitle className="text-3xl font-headline">{t('onboarding.title')}</CardTitle>
                 <CardDescription>{t('onboarding.subtitle')}</CardDescription>
          
          {/* Индикатор прогресса */}
          <div className="flex justify-center mt-4 space-x-2">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div
                key={i}
                className={`h-2 w-8 rounded-full transition-colors duration-300 ${
                  i + 1 <= step ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
                 <p className="text-sm text-muted-foreground mt-2">
                   {t('onboarding.progress', { current: step, total: totalSteps })}
                 </p>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {step === 1 && (
                <div className="space-y-6">
                         <div className="text-center mb-6">
                           <h3 className="text-xl font-semibold mb-2">{t('onboarding.step1.title')}</h3>
                           <p className="text-muted-foreground">{t('onboarding.step1.subtitle')}</p>
                         </div>
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('common.name')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('onboarding.step1.placeholder')} {...field} className="text-center text-lg" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                         <div className="text-center mb-6">
                           <h3 className="text-xl font-semibold mb-2">{t('onboarding.step2.title')}</h3>
                           <p className="text-muted-foreground">{t('onboarding.step2.subtitle')}</p>
                         </div>
                  <FormField
                    control={form.control}
                    name="lifecycleStage"
                    render={({ field }) => (
                      <FormItem className="space-y-4">
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-3"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                              <FormControl>
                                <RadioGroupItem value="pregnancy" />
                              </FormControl>
                                     <FormLabel className="font-normal text-base">{t('onboarding.step2.pregnancy')}</FormLabel>
                                   </FormItem>
                                   <FormItem className="flex items-center space-x-3 space-y-0 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                                     <FormControl>
                                       <RadioGroupItem value="postpartum" />
                                     </FormControl>
                                     <FormLabel className="font-normal text-base">{t('onboarding.step2.postpartum')}</FormLabel>
                                   </FormItem>
                                   <FormItem className="flex items-center space-x-3 space-y-0 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                                     <FormControl>
                                       <RadioGroupItem value="childcare" />
                                     </FormControl>
                                     <FormLabel className="font-normal text-base">{t('onboarding.step2.childcare')}</FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                         <div className="text-center mb-6">
                           <h3 className="text-xl font-semibold mb-2">
                             {lifecycleStage === 'pregnancy' ? t('onboarding.step3.pregnancy.title') : t('onboarding.step3.other.title')}
                           </h3>
                           <p className="text-muted-foreground">
                             {lifecycleStage === 'pregnancy'
                               ? t('onboarding.step3.pregnancy.subtitle')
                               : t('onboarding.step3.other.subtitle')
                             }
                           </p>
                         </div>
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="text-center">
                          {lifecycleStage === 'pregnancy'
                            ? t('onboarding.step3.pregnancy.label')
                            : t('onboarding.step3.other.label')}
                        </FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal text-lg py-6",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP", { locale: ru })
                                      ) : (
                                        <span>{t('onboarding.step3.placeholder')}</span>
                                      )}
                                <CalendarIcon className="ml-auto h-5 w-5 opacity-50" />
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

              <CardFooter className="flex justify-between p-0 pt-4">
                {step === 1 && (
                         <Button
                           type="button"
                           onClick={() => setStep(2)}
                           disabled={!form.watch('name')}
                           className="w-full"
                         >
                           {t('common.next')}
                         </Button>
                )}
                {step === 2 && (
                  <>
                    <Button type="button" variant="ghost" onClick={() => setStep(1)}>
                      {t('common.back')}
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setStep(3)}
                      disabled={!form.watch('lifecycleStage')}
                    >
                      {t('common.next')}
                    </Button>
                  </>
                )}
                {step === 3 && (
                  <>
                    <Button type="button" variant="ghost" onClick={() => setStep(2)}>
                      {t('common.back')}
                    </Button>
                    <Button type="submit" disabled={!form.watch('date')}>
                      {t('common.start')}
                    </Button>
                  </>
                )}
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
