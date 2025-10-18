import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Bot, Send, Trash2, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import React from 'react';

import { useAppData } from "@/hooks/use-app-data";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAIResponse } from "./ai-assistant/actions";
import { Skeleton } from "@/components/ui/skeleton";

const chatSchema = z.object({
  query: z.string().min(1, "Сообщение не может быть пустым"),
});

export default function AIAssistantPage() {
  const { userData, aiMessages, addAIMessage, clearAIChat } = useAppData();
  const [isThinking, setIsThinking] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  const form = useForm<z.infer<typeof chatSchema>>({
    resolver: zodResolver(chatSchema),
    defaultValues: { query: "" },
  });

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [aiMessages]);


  const onSubmit = async (values: z.infer<typeof chatSchema>) => {
    const userMessage = {
      id: new Date().toISOString(),
      role: 'user' as const,
      content: values.query,
    };
    addAIMessage(userMessage);
    form.reset();
    setIsThinking(true);

    if (userData) {
        const result = await getAIResponse({
            lifecycleStage: userData.lifecycleStage,
            query: values.query
        });

        const aiResponse = {
            id: new Date().toISOString() + 'ai',
            role: 'assistant' as const,
            content: result.success ? result.response : result.error || 'An error occurred',
        };
        addAIMessage(aiResponse);
    }
    setIsThinking(false);
    setTimeout(scrollToBottom, 100);
  };

  return (
    <div className="flex h-[calc(100vh-theme(spacing.24))] flex-col">
      <div className="flex items-center justify-between pb-4">
        <h2 className="text-2xl font-semibold font-headline">AI Ассистент</h2>
        <Button variant="ghost" size="icon" onClick={clearAIChat} disabled={aiMessages.length === 0}>
            <Trash2 className="h-5 w-5"/>
            <span className="sr-only">Очистить чат</span>
        </Button>
      </div>

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

      <div className="mt-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-center gap-2">
            <FormField
              control={form.control}
              name="query"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input placeholder="Спросите что-нибудь..." {...field} disabled={isThinking} />
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
    </div>
  );
}
