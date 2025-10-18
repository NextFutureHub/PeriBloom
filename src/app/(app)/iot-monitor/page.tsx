"use client";

import { useState, useEffect } from 'react';
import { Thermometer, Waves, Ear } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

export default function IoTMonitorPage() {
  const [isSupported, setIsSupported] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [deviceData, setDeviceData] = useState({ temp: 'N/A', humidity: 'N/A', sound: 'N/A' });
  const [error, setError] = useState('');
  
  useEffect(() => {
    if ('serial' in navigator) {
      setIsSupported(true);
    }
  }, []);

  const handleConnect = async () => {
    if (!isSupported) {
      setError('Web Serial API не поддерживается в вашем браузере. Попробуйте Google Chrome.');
      return;
    }
    setError('');
    
    try {
      // @ts-ignore
      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: 9600 });
      setIsConnected(true);

      const textDecoder = new TextDecoderStream();
      const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
      const reader = textDecoder.readable.getReader();

      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          reader.releaseLock();
          break;
        }
        try {
          const data = JSON.parse(value);
          setDeviceData({
            temp: data.temperature || 'N/A',
            humidity: data.humidity || 'N/A',
            sound: data.soundLevel || 'N/A',
          });
        } catch (e) {
          // Ignore parsing errors for incomplete data chunks
        }
      }
    } catch (err: any) {
      if (err.name !== 'NotFoundError') {
        setError('Не удалось подключиться к устройству: ' + err.message);
      }
      setIsConnected(false);
    }
  };
  
  const getClimateStatus = () => {
    const temp = parseFloat(deviceData.temp);
    if (isNaN(temp)) return { color: 'bg-gray-500', text: 'Неизвестно' };
    if (temp < 18 || temp > 24) return { color: 'bg-red-500', text: 'Тревожный' };
    return { color: 'bg-blue-500', text: 'Нормальный' };
  }

  const climateStatus = getClimateStatus();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>IoT Монитор Микроклимата</CardTitle>
                <CardDescription>Подключите ваше Arduino-устройство для мониторинга комнаты ребенка в реальном времени.</CardDescription>
            </CardHeader>
            <CardContent>
                {!isSupported && (
                    <Alert variant="destructive">
                        <AlertTitle>Браузер не поддерживается</AlertTitle>
                        <AlertDescription>
                            Для использования этой функции необходим браузер с поддержкой Web Serial API, например, Google Chrome.
                        </AlertDescription>
                    </Alert>
                )}
                {error && (
                    <Alert variant="destructive" className="mt-4">
                        <AlertTitle>Ошибка</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <div className="mt-6 text-center">
                    <Button onClick={handleConnect} disabled={!isSupported || isConnected}>
                        {isConnected ? 'Подключено' : 'Подключить устройство'}
                    </Button>
                </div>

                <div className="mt-8 grid gap-6 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Температура</CardTitle>
                            <Thermometer className="h-5 w-5 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{deviceData.temp}°C</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Влажность</CardTitle>
                            <Waves className="h-5 w-5 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{deviceData.humidity}%</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Уровень шума</CardTitle>
                            <Ear className="h-5 w-5 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{deviceData.sound}</div>
                        </CardContent>
                    </Card>
                </div>
                 <div className="mt-6 flex items-center justify-center gap-3">
                    <p>Индикатор состояния микроклимата:</p>
                    <div className={cn("h-6 w-6 rounded-full", climateStatus.color)}></div>
                    <p className="font-semibold">{climateStatus.text}</p>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
