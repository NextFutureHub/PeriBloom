"use client";

import { useState } from 'react';
import { Send, User, Bot } from 'lucide-react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAppData } from '@/hooks/use-app-data';
import type { Contact } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';

const chatSchema = z.object({
  message: z.string().min(1),
});

const mockResponses: Record<string, string[]> = {
  doc1: [
    "Здравствуйте! Все анализы в норме, не переживайте.",
    "Не забывайте принимать витамины.",
    "Следующий прием через 2 недели."
  ],
  psy1: [
    "Это нормально чувствовать тревогу. Давайте поговорим об этом.",
    "Попробуйте дыхательную практику, которую мы обсуждали.",
    "Как ваше настроение сегодня?",
  ],
  car1: [
    "Малыш сегодня хорошо спал и поел.",
    "Завтра принесите, пожалуйста, еще подгузников.",
    "Все в порядке, не волнуйтесь.",
  ],
};

export default function ContactsPage() {
  const { contacts, getChatMessages, addChatMessage, userData } = useAppData();
  const [selectedContact, setSelectedContact] = useState<Contact>(contacts[0]);

  const form = useForm<z.infer<typeof chatSchema>>({
    resolver: zodResolver(chatSchema),
    defaultValues: { message: "" },
  });

  const currentMessages = getChatMessages(selectedContact.id);

  const handleSendMessage = (values: z.infer<typeof chatSchema>) => {
    addChatMessage({ contactId: selectedContact.id, sender: 'me', content: values.message });
    form.reset();

    // Mock reply
    setTimeout(() => {
        const responses = mockResponses[selectedContact.id] || ["Okay."];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        addChatMessage({ contactId: selectedContact.id, sender: 'them', content: randomResponse });
    }, 1500);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 h-[calc(100vh-theme(spacing.24))] gap-6">
      <div className="md:col-span-1 flex flex-col border rounded-lg">
        <div className="p-4 border-b">
          <h3 className="text-xl font-semibold font-headline">Контакты</h3>
        </div>
        <ScrollArea>
          <div className="p-2 space-y-1">
            {contacts.map((contact) => (
              <button
                key={contact.id}
                onClick={() => setSelectedContact(contact)}
                className={cn(
                  'w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors',
                  selectedContact.id === contact.id ? 'bg-secondary' : 'hover:bg-muted/50'
                )}
              >
                <Avatar>
                  <AvatarImage src={contact.avatar} />
                  <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{contact.name}</p>
                  <p className="text-sm text-muted-foreground">{contact.role}</p>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      <div className="md:col-span-2 flex flex-col border rounded-lg">
        <div className="p-4 border-b flex items-center gap-3">
          <Avatar>
            <AvatarImage src={selectedContact.avatar} />
            <AvatarFallback>{selectedContact.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{selectedContact.name}</p>
            <p className="text-sm text-muted-foreground">{selectedContact.role}</p>
          </div>
        </div>

        <ScrollArea className="flex-1 p-4 bg-muted/20">
          <div className="space-y-6">
            {currentMessages.map((msg) => (
              <div key={msg.id} className={cn('flex items-start gap-3', msg.sender === 'me' && 'justify-end')}>
                {msg.sender === 'them' && (
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={selectedContact.avatar} />
                    <AvatarFallback>{selectedContact.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    'max-w-md rounded-lg p-3 text-sm',
                    msg.sender === 'me' ? 'bg-primary text-primary-foreground' : 'bg-background'
                  )}
                >
                  <p>{msg.content}</p>
                </div>
                {msg.sender === 'me' && (
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={`https://i.pravatar.cc/150?u=${userData?.name}`} />
                    <AvatarFallback>{userData?.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="p-4 border-t">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSendMessage)} className="flex items-center gap-2">
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input placeholder="Написать сообщение..." {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button type="submit" size="icon">
                <Send className="h-5 w-5" />
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
