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
  const [port, setPort] = useState<any>(null);
  const [rawData, setRawData] = useState('');
  const [debugMode, setDebugMode] = useState(false);
  const [reader, setReader] = useState<any>(null);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [shouldStopReading, setShouldStopReading] = useState(false);
  
  useEffect(() => {
    if ('serial' in navigator) {
      setIsSupported(true);
    }
    
    // Проверяем, было ли устройство подключено ранее
    const wasConnected = localStorage.getItem('iot-device-connected');
    if (wasConnected === 'true') {
      setIsReconnecting(true);
      setError('Устройство было отключено при переходе на другую страницу. Нажмите "Подключить устройство" для переподключения.');
    } else {
      // Если устройство не было подключено ранее, сбрасываем состояние переподключения
      setIsReconnecting(false);
    }

    // Обработка закрытия страницы
    const handleBeforeUnload = () => {
      if (isConnected) {
        localStorage.setItem('iot-device-connected', 'true');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isConnected]);

  const handleConnect = async () => {
    try {
      setError('');
      setIsReconnecting(false);
      
      if (!('serial' in navigator)) {
        setError('Web Serial API не поддерживается в этом браузере');
        return;
      }

      const newPort = await navigator.serial.requestPort();
      await newPort.open({ baudRate: 9600 });
      
      setPort(newPort);
      setIsConnected(true);
      localStorage.setItem('iot-device-connected', 'true');
      setShouldStopReading(false);
      
      // Начинаем чтение данных
      readData(newPort);
      
    } catch (err: any) {
      console.error('Ошибка подключения:', err);
      setError(`Не удалось подключиться к устройству: ${err.message}`);
    }
  };

  const readData = async (newPort: any) => {
    try {
      const textDecoder = new TextDecoderStream();
      const readableStreamClosed = newPort.readable.pipeTo(textDecoder.writable);
      const reader = textDecoder.readable.getReader();
      setReader(reader);

      while (newPort.readable && !shouldStopReading) {
        try {
          const { value, done } = await reader.read();
          
          if (done) {
            console.log('Поток чтения завершен');
            break;
          }
          
          if (value) {
            const data = value.trim();
            setRawData(data);
            
            try {
              const parsedData = JSON.parse(data);
              console.log('Текущие данные:', parsedData);
              
              // Обрабатываем данные в зависимости от формата
              if (parsedData.temperature !== undefined && parsedData.humidity !== undefined) {
                // Формат: {"temperature": 22.5, "humidity": 45.2, "sound_ao": 63, "sound_do": 1}
                const soundLevel = parsedData.sound_ao !== undefined ? parsedData.sound_ao : 'N/A';
                setDeviceData({
                  temp: `${parsedData.temperature}°C`,
                  humidity: `${parsedData.humidity}%`,
                  sound: soundLevel !== 'N/A' ? `${soundLevel} dB` : 'N/A'
                });
              } else if (parsedData.temp !== undefined && parsedData.humidity !== undefined) {
                // Альтернативный формат
                setDeviceData({
                  temp: `${parsedData.temp}°C`,
                  humidity: `${parsedData.humidity}%`,
                  sound: parsedData.sound || 'N/A'
                });
              }
            } catch (parseError) {
              console.warn('Ошибка парсинга JSON:', parseError);
              console.log('Сырые данные от Arduino:', data);
            }
          }
        } catch (readError) {
          if (!shouldStopReading) {
            console.error('Ошибка чтения:', readError);
          }
          break;
        }
      }
    } catch (err) {
      console.error('Ошибка в readData:', err);
    }
  };

  const handleDisconnect = async () => {
    console.log("🧭 Начинаем отключение устройства...");
    setIsDisconnecting(true);
    setShouldStopReading(true);
    setIsConnected(false);
    
    try {
      if (reader) {
        try {
          console.log("⏸️ Прерываем чтение...");
          await reader.cancel();
        } catch (e) {
          console.warn("reader.cancel() вернул ошибку:", e);
        }
        try {
          reader.releaseLock();
        } catch (e) {
          console.warn("reader.releaseLock() не удалось:", e);
        }
      }
      if (port) {
        try {
          console.log("🔒 Закрываем порт...");
          await port.close();
        } catch (e) {
          console.warn("port.close() не удалось:", e);
        }
      }
    } catch (err) {
      console.error("⚠️ Глобальная ошибка при отключении:", err);
    }
    
    // Сброс состояний
    setDeviceData({ temp: 'N/A', humidity: 'N/A', sound: 'N/A' });
    setRawData('');
    setError('');
    setReader(null);
    setPort(null);
    localStorage.removeItem('iot-device-connected');
    console.log('✅ Устройство корректно отключено');
    
    // Сбрасываем флаги
    setTimeout(() => {
      setIsDisconnecting(false);
      setShouldStopReading(false);
    }, 200);
  };

  if (!isSupported) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold font-headline">IoT Монитор</h2>
          <p className="text-muted-foreground">Мониторинг данных с Arduino датчиков</p>
        </div>
        <Alert>
          <AlertTitle>Web Serial API не поддерживается</AlertTitle>
          <AlertDescription>
            Ваш браузер не поддерживает Web Serial API. Пожалуйста, используйте Chrome, Edge или другой поддерживаемый браузер.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold font-headline">IoT Монитор</h2>
          <p className="text-muted-foreground">Мониторинг данных с Arduino датчиков</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setDebugMode(!debugMode)}
          >
            {debugMode ? 'Скрыть отладку' : 'Показать отладку'}
          </Button>
          {isConnected ? (
            <Button
              variant="destructive"
              onClick={handleDisconnect}
              disabled={isDisconnecting}
            >
              {isDisconnecting ? 'Отключение...' : 'Отключить устройство'}
            </Button>
          ) : (
            <Button
              onClick={handleConnect}
              disabled={isReconnecting}
            >
              {isReconnecting ? 'Переподключение...' : 'Подключить устройство'}
            </Button>
          )}
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Ошибка</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Температура</CardTitle>
            <Thermometer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{deviceData.temp}</div>
            <p className="text-xs text-muted-foreground">
              Температура окружающей среды
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Влажность</CardTitle>
            <Waves className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{deviceData.humidity}</div>
            <p className="text-xs text-muted-foreground">
              Относительная влажность воздуха
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Уровень шума</CardTitle>
            <Ear className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{deviceData.sound}</div>
            <p className="text-xs text-muted-foreground">
              Уровень звука в помещении
            </p>
          </CardContent>
        </Card>
      </div>

      {debugMode && (
        <Card>
          <CardHeader>
            <CardTitle>Панель отладки</CardTitle>
            <CardDescription>
              Текущие данные: {JSON.stringify(deviceData)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm">
                <strong>Сырые данные от Arduino:</strong> {rawData || 'Нет данных'}
              </p>
              <p className="text-sm">
                <strong>Ожидаемый формат JSON:</strong> {"{\"temperature\":22.5,\"humidity\":45.2,\"soundLevel\":35.8}"}
              </p>
              <p className="text-xs text-muted-foreground">
                Проверьте консоль браузера (F12) для подробных логов
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
