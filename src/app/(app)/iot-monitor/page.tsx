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

  // Отдельный useEffect для очистки ресурсов при размонтировании
  useEffect(() => {
    return () => {
      if (reader) {
        try {
          reader.releaseLock();
        } catch (err) {
          // Игнорируем ошибки при очистке
        }
      }
      if (port) {
        try {
          port.close();
        } catch (err) {
          // Игнорируем ошибки при очистке
        }
      }
    };
  }, []); // Пустой массив зависимостей - выполняется только при размонтировании

  const handleConnect = async () => {
    if (!isSupported) {
      setError('Web Serial API не поддерживается в вашем браузере. Попробуйте Google Chrome.');
      return;
    }
    
    // Очищаем все ошибки и состояния при подключении
    setError('');
    setIsReconnecting(false);
    setIsDisconnecting(false);
    setShouldStopReading(false);
    
    try {
      // @ts-ignore
      const newPort = await navigator.serial.requestPort();
      await newPort.open({ baudRate: 9600 });
      
      setPort(newPort);
      setIsConnected(true);
      setIsReconnecting(false);
      setIsDisconnecting(false);
      setError(''); // Очищаем все ошибки при подключении
      localStorage.setItem('iot-device-connected', 'true');

      const textDecoder = new TextDecoderStream();
      const readableStreamClosed = newPort.readable.pipeTo(textDecoder.writable);
      const newReader = textDecoder.readable.getReader();
      setReader(newReader);
      
      let buffer = '';

      const readData = async () => {
        try {
          while (newPort.readable) {
            const { value, done } = await newReader.read();
            if (done) {
              break;
            }
            
            buffer += value;
            setRawData(buffer);
            
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';
            
            for (const line of lines) {
              const trimmedLine = line.trim();
              if (trimmedLine) {
                try {
                  const data = JSON.parse(trimmedLine);
                  setDeviceData({
                    temp: data.temperature || data.temp || 'N/A',
                    humidity: data.humidity || 'N/A',
                    sound: data.soundLevel || data.sound || data.noise || data.sound_ao || data.sound_do || 'N/A',
                  });
                } catch (e) {
                  console.log('Ошибка парсинга JSON:', trimmedLine);
                }
              }
            }
          }
        } catch (err) {
          // Показываем ошибку только если это не было намеренное отключение
          if (!isDisconnecting) {
            console.error('Ошибка чтения данных:', err);
            setIsConnected(false);
            setError('Потеряно соединение с устройством');
          }
        }
      };

      readData();
      
    } catch (err: any) {
      if (err.name !== 'NotFoundError') {
        setError('Не удалось подключиться к устройству: ' + err.message);
      }
      setIsConnected(false);
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

    setReader(null);
    setPort(null);
    setDeviceData({ temp: 'N/A', humidity: 'N/A', sound: 'N/A' });
    setRawData('');
    setError('');
    localStorage.removeItem('iot-device-connected');

    console.log('✅ Устройство корректно отключено');

    setTimeout(() => {
      setIsDisconnecting(false);
      setShouldStopReading(false);
    }, 200);
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
                {error && !isConnected && (
                    <Alert variant="destructive" className="mt-4">
                        <AlertTitle>Ошибка</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <div className="mt-6 text-center space-x-4">
                    <Button 
                        onClick={handleConnect} 
                        disabled={!isSupported || isConnected}
                        variant={isConnected ? "secondary" : "default"}
                    >
                        {isConnected ? 'Подключено' : 'Подключить устройство'}
                    </Button>
                    {isConnected && (
                        <Button 
                            onClick={handleDisconnect} 
                            variant="destructive"
                        >
                            Отключить
                        </Button>
                    )}
                    <Button 
                        onClick={() => setDebugMode(!debugMode)} 
                        variant="outline"
                        size="sm"
                    >
                        {debugMode ? 'Скрыть отладку' : 'Показать отладку'}
                    </Button>
                    {isReconnecting && !isConnected && (
                        <Button 
                            onClick={handleConnect} 
                            variant="default"
                            size="sm"
                        >
                            Переподключить
                        </Button>
                    )}
                </div>

                {isConnected && (
                    <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2">
                            <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-green-800 font-medium">Устройство подключено и передает данные</span>
                        </div>
                    </div>
                )}

                {isReconnecting && !isConnected && (
                    <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center gap-2">
                            <div className="h-3 w-3 bg-yellow-500 rounded-full animate-pulse"></div>
                            <span className="text-yellow-800 font-medium">Требуется переподключение устройства</span>
                        </div>
                    </div>
                )}

                {isDisconnecting && (
                    <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                        <div className="flex items-center gap-2">
                            <div className="h-3 w-3 bg-orange-500 rounded-full animate-pulse"></div>
                            <span className="text-orange-800 font-medium">Отключение устройства...</span>
                        </div>
                    </div>
                )}

                <div className="mt-8 grid gap-6 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Температура</CardTitle>
                            <Thermometer className="h-5 w-5 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {deviceData.temp !== 'N/A' ? `${deviceData.temp}°C` : 'N/A'}
                            </div>
                            {deviceData.temp !== 'N/A' && (
                                <p className="text-xs text-muted-foreground mt-1">
                                    {parseFloat(deviceData.temp) < 18 ? 'Холодно' : 
                                     parseFloat(deviceData.temp) > 24 ? 'Жарко' : 'Комфортно'}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Влажность</CardTitle>
                            <Waves className="h-5 w-5 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {deviceData.humidity !== 'N/A' ? `${deviceData.humidity}%` : 'N/A'}
                            </div>
                            {deviceData.humidity !== 'N/A' && (
                                <p className="text-xs text-muted-foreground mt-1">
                                    {parseFloat(deviceData.humidity) < 30 ? 'Сухо' : 
                                     parseFloat(deviceData.humidity) > 60 ? 'Влажно' : 'Нормально'}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Уровень шума</CardTitle>
                            <Ear className="h-5 w-5 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {deviceData.sound !== 'N/A' ? `${deviceData.sound} дБ` : 'N/A'}
                            </div>
                            {deviceData.sound !== 'N/A' && (
                                <p className="text-xs text-muted-foreground mt-1">
                                    {parseFloat(deviceData.sound) < 40 ? 'Тихо' : 
                                     parseFloat(deviceData.sound) > 70 ? 'Громко' : 'Нормально'}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>
                 <div className="mt-6 flex items-center justify-center gap-3">
                    <p>Индикатор состояния микроклимата:</p>
                    <div className={cn("h-6 w-6 rounded-full", climateStatus.color)}></div>
                    <p className="font-semibold">{climateStatus.text}</p>
                </div>

                {debugMode && (
                    <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                        <h3 className="text-lg font-semibold mb-3">Панель отладки</h3>
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm font-medium text-gray-700">Текущие данные:</p>
                                <pre className="text-xs bg-white p-2 rounded border overflow-auto">
                                    {JSON.stringify(deviceData, null, 2)}
                                </pre>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-700">Сырые данные от Arduino:</p>
                                <pre className="text-xs bg-white p-2 rounded border overflow-auto max-h-32">
                                    {rawData || 'Нет данных'}
                                </pre>
                            </div>
                            <div className="text-xs text-gray-600">
                                <p>Проверьте консоль браузера (F12) для подробных логов</p>
                                <p>Поддерживаемые поля для звука: soundLevel, sound, noise, sound_ao, sound_do</p>
                                <p>Текущий формат от Arduino: {"{"}"temperature":29.0,"humidity":14.0,"sound_ao":63,"sound_do":1{"}"}</p>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    </div>
  );
}
