"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';

import { useAppData } from '@/hooks/use-app-data';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const symptomSchema = z.object({
  symptom: z.string().min(2, 'Симптом должен содержать не менее 2 символов.'),
  severity: z.enum(['low', 'medium', 'high']),
  comment: z.string().optional(),
});

type SymptomFormProps = {
  setFormOpen: (isOpen: boolean) => void;
};

export function SymptomForm({ setFormOpen }: SymptomFormProps) {
  const { addSymptom } = useAppData();
  const form = useForm<z.infer<typeof symptomSchema>>({
    resolver: zodResolver(symptomSchema),
    defaultValues: {
      symptom: '',
      severity: 'low',
      comment: '',
    },
  });

  const onSubmit = (values: z.infer<typeof symptomSchema>) => {
    const now = new Date();
    addSymptom({
      ...values,
      date: now.toISOString(),
      time: format(now, 'HH:mm'),
    });
    setFormOpen(false);
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="symptom"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Симптом</FormLabel>
              <FormControl>
                <Input placeholder="Например, головная боль" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="severity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Степень тяжести</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите степень тяжести" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="low">Низкая</SelectItem>
                  <SelectItem value="medium">Средняя</SelectItem>
                  <SelectItem value="high">Высокая</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="comment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Комментарий</FormLabel>
              <FormControl>
                <Textarea placeholder="Добавьте детали, если необходимо" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <Button type="submit">Сохранить</Button>
        </div>
      </form>
    </Form>
  );
}
