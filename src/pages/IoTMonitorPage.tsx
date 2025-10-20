"use client";

import { useState, useEffect, useRef } from 'react';
import { Thermometer, Waves, Ear, Wifi, WifiOff, AlertTriangle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useSoftNotification } from '@/components/ui/soft-notification';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/use-translation';

export default function IoTMonitorPage() {
  const { t } = useTranslation();
  const [isSupported, setIsSupported] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const { showNotification, NotificationContainer } = useSoftNotification();
  const [deviceData, setDeviceData] = useState({ 
    temp: 'N/A', 
    humidity: 'N/A', 
    sound: 'N/A',
    timestamp: new Date().toLocaleTimeString()
  });
  const [error, setError] = useState('');
  const [rawData, setRawData] = useState('');
  const [debugMode, setDebugMode] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [shouldStopReading, setShouldStopReading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [lastUpdateTime, setLastUpdateTime] = useState<string>('');
  const [forceDisconnect, setForceDisconnect] = useState(false);
  
  const readerRef = useRef<any>(null);
  const portRef = useRef<any>(null);
  
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
      if (readerRef.current) {
        try {
          readerRef.current.releaseLock();
        } catch (err) {
          // Игнорируем ошибки при очистке
        }
      }
      if (portRef.current) {
        try {
          portRef.current.close();
        } catch (err) {
          // Игнорируем ошибки при очистке
        }
      }
    };
  }, []); // Пустой массив зависимостей - выполняется только при размонтировании

  const handleConnect = async () => {
    if (!isSupported) {
      setError('Web Serial API не поддерживается в вашем браузере. Попробуйте Google Chrome.');
      setConnectionStatus('error');
      return;
    }
    
    // Проверяем, не открыт ли уже порт
    if (portRef.current && portRef.current.readable) {
      console.log("⚠️ Порт уже открыт, сначала отключаем...");
      await handleDisconnect();
      // Ждем завершения отключения
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    setConnectionStatus('connecting');
    setError('');
    setIsReconnecting(false);
    setIsDisconnecting(false);
    setShouldStopReading(false);
    
    try {
      // @ts-ignore
      const newPort = await navigator.serial.requestPort();
      
      // Проверяем, не открыт ли порт
      if (newPort.readable) {
        console.log("⚠️ Порт уже открыт, закрываем перед повторным открытием...");
        try {
          await newPort.close();
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (e) {
          console.warn("Не удалось закрыть порт:", e);
        }
      }
      
      await newPort.open({ baudRate: 9600 });
      
      portRef.current = newPort;
      setIsConnected(true);
      setConnectionStatus('connected');
      setIsReconnecting(false);
      setIsDisconnecting(false);
      setError('');
      localStorage.setItem('iot-device-connected', 'true');
      showNotification('Устройство успешно подключено', 'success');

      const textDecoder = new TextDecoderStream();
      newPort.readable.pipeTo(textDecoder.writable);
      const newReader = textDecoder.readable.getReader();
      readerRef.current = newReader;
      
      let buffer = '';

      const readData = async () => {
        try {
          while (newPort.readable && !shouldStopReading) {
            const { value, done } = await newReader.read();
            if (done) {
              console.log('Поток чтения завершен');
              break;
            }
            
            if (value) {
              buffer += value;
              setRawData(buffer);
              setLastUpdateTime(new Date().toLocaleTimeString());
              
              const lines = buffer.split('\n');
              buffer = lines.pop() || '';
              
              for (const line of lines) {
                const trimmedLine = line.trim();
                if (trimmedLine) {
                  try {
                    const data = JSON.parse(trimmedLine);
                    console.log('Получены данные от Arduino:', data);
                    
                    const newData = {
                      temp: data.temperature || data.temp || 'N/A',
                      humidity: data.humidity || 'N/A',
                      sound: data.soundLevel || data.sound || data.noise || data.sound_ao || data.sound_do || 'N/A',
                      timestamp: new Date().toLocaleTimeString()
                    };
                    
                    setDeviceData(newData);
                    setLastUpdateTime(new Date().toLocaleTimeString());
                  } catch (e) {
                    console.log('Ошибка парсинга JSON:', trimmedLine);
                  }
                }
              }
            }
          }
        } catch (err) {
          if (!shouldStopReading && !isDisconnecting) {
            console.error('Ошибка чтения данных:', err);
            setConnectionStatus('error');
            setIsConnected(false);
            setError('Потеряно соединение с устройством');
          }
        }
      };

      readData();
      
    } catch (err: any) {
      console.error('Ошибка подключения:', err);
      setConnectionStatus('error');
      
      if (err.message && err.message.includes('already open')) {
        setError('Порт уже открыт. Попробуйте отключить устройство и подключить заново.');
      } else if (err.name !== 'NotFoundError') {
        setError('Не удалось подключиться к устройству: ' + err.message);
      }
      
      setIsConnected(false);
      
      // Принудительная очистка при ошибке
      portRef.current = null;
      readerRef.current = null;
    }
  };

  const handleDisconnect = async () => {
    console.log("🧭 Начинаем отключение устройства...");

    setConnectionStatus('disconnected');
    setIsDisconnecting(true);
    setShouldStopReading(true);
    setIsConnected(false);

    try {
      // Сначала останавливаем чтение
      if (readerRef.current) {
        try {
          console.log("⏸️ Прерываем чтение...");
          await readerRef.current.cancel();
        } catch (e) {
          console.warn("reader.cancel() вернул ошибку:", e);
        }

        try {
          readerRef.current.releaseLock();
        } catch (e) {
          console.warn("reader.releaseLock() не удалось:", e);
        }
      }

      // Затем закрываем порт
      if (portRef.current) {
        try {
          console.log("🔒 Закрываем порт...");
          await portRef.current.close();
          console.log("✅ Порт успешно закрыт");
        } catch (e) {
          console.warn("port.close() не удалось:", e);
        }
      }

      // Дополнительная очистка - ждем немного перед сбросом состояния
      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (err) {
      console.error("⚠️ Глобальная ошибка при отключении:", err);
    }

    // Сбрасываем все состояния
    readerRef.current = null;
    portRef.current = null;
    setDeviceData({ temp: 'N/A', humidity: 'N/A', sound: 'N/A', timestamp: '' });
    setRawData('');
    setError('');
    setLastUpdateTime('');
    localStorage.removeItem('iot-device-connected');

    console.log('✅ Устройство корректно отключено');
    showNotification('Устройство отключено', 'info');

    setTimeout(() => {
      setIsDisconnecting(false);
      setShouldStopReading(false);
    }, 500); // Увеличиваем время ожидания
  };

  const handleForceDisconnect = async () => {
    console.log("🔧 Принудительное отключение...");
    setForceDisconnect(true);
    
    try {
      // Принудительно закрываем все ресурсы
      if (readerRef.current) {
        try {
          readerRef.current.cancel();
        } catch (e) {
          console.warn("Force cancel reader:", e);
        }
        try {
          readerRef.current.releaseLock();
        } catch (e) {
          console.warn("Force release reader:", e);
        }
      }

      if (portRef.current) {
        try {
          await portRef.current.close();
        } catch (e) {
          console.warn("Force close port:", e);
        }
      }
    } catch (err) {
      console.error("Force disconnect error:", err);
    }

    // Полный сброс состояния
    readerRef.current = null;
    portRef.current = null;
    setIsConnected(false);
    setConnectionStatus('disconnected');
    setDeviceData({ temp: 'N/A', humidity: 'N/A', sound: 'N/A', timestamp: '' });
    setRawData('');
    setError('');
    setLastUpdateTime('');
    setIsDisconnecting(false);
    setShouldStopReading(false);
    setForceDisconnect(false);
    localStorage.removeItem('iot-device-connected');
    
    console.log('✅ Принудительное отключение завершено');
    showNotification('Принудительное отключение выполнено', 'info');
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
          <CardTitle>{t('iotMonitor.title')}</CardTitle>
          <CardDescription>{t('iotMonitor.subtitle')}</CardDescription>
        </CardHeader>
            <CardContent>
                {!isSupported && (
                    <Alert variant="destructive">
                        <AlertTitle>{t('iotMonitor.browserNotSupported')}</AlertTitle>
                        <AlertDescription>
                            {t('iotMonitor.browserNotSupportedDesc')}
                        </AlertDescription>
                    </Alert>
                )}
                {error && !isConnected && (
                    <Alert variant="destructive" className="mt-4">
                        <AlertTitle>{t('iotMonitor.error')}</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <div className="mt-6 space-y-4">
                    {/* Индикатор состояния подключения */}
                    <div className="flex items-center justify-center gap-2">
                        {connectionStatus === 'connected' && (
                            <div className="flex items-center gap-2 text-green-600">
                                <Wifi className="h-4 w-4" />
                                <span className="text-sm font-medium">{t('iotMonitor.connected')}</span>
                            </div>
                        )}
                        {connectionStatus === 'connecting' && (
                            <div className="flex items-center gap-2 text-blue-600">
                                <div className="h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-sm font-medium">{t('iotMonitor.connecting')}</span>
                            </div>
                        )}
                        {connectionStatus === 'error' && (
                            <div className="flex items-center gap-2 text-red-600">
                                <WifiOff className="h-4 w-4" />
                                <span className="text-sm font-medium">{t('iotMonitor.connectionError')}</span>
                            </div>
                        )}
                        {connectionStatus === 'disconnected' && (
                            <div className="flex items-center gap-2 text-gray-600">
                                <WifiOff className="h-4 w-4" />
                                <span className="text-sm font-medium">{t('iotMonitor.disconnected')}</span>
                            </div>
                        )}
                    </div>

                    {/* Кнопки управления */}
                    <div className="flex flex-wrap justify-center gap-2">
                        <Button 
                            onClick={handleConnect} 
                            disabled={!isSupported || isConnected || connectionStatus === 'connecting'}
                            variant={isConnected ? "secondary" : "default"}
                            className="min-w-[160px]"
                        >
                        {connectionStatus === 'connecting' ? t('iotMonitor.connecting') :
                         isConnected ? t('iotMonitor.connected') : t('iotMonitor.connectDevice')}
                        </Button>
                        
                        {isConnected && (
                            <Button 
                                onClick={handleDisconnect} 
                                variant="destructive"
                                disabled={isDisconnecting}
                                className="min-w-[120px]"
                            >
                                {isDisconnecting ? t('iotMonitor.deviceDisconnecting') : t('iotMonitor.disconnectDevice')}
                            </Button>
                        )}
                        
                        <Button 
                            onClick={() => setDebugMode(!debugMode)} 
                            variant="outline"
                            size="sm"
                        >
                            {debugMode ? t('iotMonitor.hideDebug') : t('iotMonitor.showDebug')}
                        </Button>
                        
                        {isReconnecting && !isConnected && (
                            <Button 
                                onClick={handleConnect} 
                                variant="default"
                                size="sm"
                            >
                                {t('iotMonitor.reconnect')}
                            </Button>
                        )}
                        
                        {(connectionStatus === 'error' || isDisconnecting) && (
                            <Button 
                                onClick={handleForceDisconnect} 
                                variant="outline"
                                size="sm"
                                disabled={forceDisconnect}
                            >
                                {forceDisconnect ? t('iotMonitor.forceDisconnect') + '...' : t('iotMonitor.forceDisconnect')}
                            </Button>
                        )}
                    </div>

                    {/* Информация о последнем обновлении */}
                    {lastUpdateTime && (
                        <div className="text-center text-sm text-muted-foreground">
                            {t('iotMonitor.lastUpdate')}: {lastUpdateTime}
                        </div>
                    )}
                </div>

                {isConnected && (
                    <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2">
                            <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-green-800 font-medium">{t('iotMonitor.deviceConnected')}</span>
                        </div>
                    </div>
                )}


                {isDisconnecting && (
                    <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                        <div className="flex items-center gap-2">
                            <div className="h-3 w-3 bg-orange-500 rounded-full animate-pulse"></div>
                            <span className="text-orange-800 font-medium">{t('iotMonitor.deviceDisconnecting')}</span>
                        </div>
                    </div>
                )}

                <div className="mt-8 grid gap-6 md:grid-cols-3">
                    <Card className={cn(
                        "transition-all duration-300",
                        deviceData.temp !== 'N/A' && parseFloat(deviceData.temp) > 24 && "border-red-200 bg-red-50"
                    )}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">{t('iotMonitor.temperature')}</CardTitle>
                            <div className="flex items-center gap-2">
                                <Thermometer className="h-5 w-5 text-muted-foreground" />
                                {deviceData.temp !== 'N/A' && parseFloat(deviceData.temp) > 24 && (
                                    <AlertTriangle className="h-4 w-4 text-red-500" />
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {deviceData.temp !== 'N/A' ? `${deviceData.temp}°C` : 'N/A'}
                            </div>
                            {deviceData.temp !== 'N/A' && (
                                <div className="flex items-center gap-2 mt-1">
                                    <Badge variant={
                                        parseFloat(deviceData.temp) < 18 ? "destructive" : 
                                        parseFloat(deviceData.temp) > 24 ? "destructive" : "default"
                                    }>
                                {parseFloat(deviceData.temp) < 18 ? t('iotMonitor.cold') :
                                 parseFloat(deviceData.temp) > 24 ? t('iotMonitor.hot') : t('iotMonitor.comfortable')}
                                    </Badge>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                    
                    <Card className={cn(
                        "transition-all duration-300",
                        deviceData.humidity !== 'N/A' && (parseFloat(deviceData.humidity) < 30 || parseFloat(deviceData.humidity) > 60) && "border-yellow-200 bg-yellow-50"
                    )}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">{t('iotMonitor.humidity')}</CardTitle>
                            <div className="flex items-center gap-2">
                                <Waves className="h-5 w-5 text-muted-foreground" />
                                {deviceData.humidity !== 'N/A' && (parseFloat(deviceData.humidity) < 30 || parseFloat(deviceData.humidity) > 60) && (
                                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {deviceData.humidity !== 'N/A' ? `${deviceData.humidity}%` : 'N/A'}
                            </div>
                            {deviceData.humidity !== 'N/A' && (
                                <div className="flex items-center gap-2 mt-1">
                                    <Badge variant={
                                        parseFloat(deviceData.humidity) < 30 ? "secondary" : 
                                        parseFloat(deviceData.humidity) > 60 ? "secondary" : "default"
                                    }>
                                {parseFloat(deviceData.humidity) < 30 ? t('iotMonitor.dry') :
                                 parseFloat(deviceData.humidity) > 60 ? t('iotMonitor.humid') : t('iotMonitor.normal')}
                                    </Badge>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                    
                    <Card className={cn(
                        "transition-all duration-300",
                        deviceData.sound !== 'N/A' && parseFloat(deviceData.sound) > 70 && "border-orange-200 bg-orange-50"
                    )}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">{t('iotMonitor.soundLevel')}</CardTitle>
                            <div className="flex items-center gap-2">
                                <Ear className="h-5 w-5 text-muted-foreground" />
                                {deviceData.sound !== 'N/A' && parseFloat(deviceData.sound) > 70 && (
                                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {deviceData.sound !== 'N/A' ? `${deviceData.sound} дБ` : 'N/A'}
                            </div>
                            {deviceData.sound !== 'N/A' && (
                                <div className="flex items-center gap-2 mt-1">
                                    <Badge variant={
                                        parseFloat(deviceData.sound) < 40 ? "default" : 
                                        parseFloat(deviceData.sound) > 70 ? "secondary" : "default"
                                    }>
                                {parseFloat(deviceData.sound) < 40 ? t('iotMonitor.quiet') :
                                 parseFloat(deviceData.sound) > 70 ? t('iotMonitor.loud') : t('iotMonitor.normal')}
                                    </Badge>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
                 <div className="mt-6 flex items-center justify-center gap-3">
                        <p>{t('iotMonitor.climateStatus')}:</p>
                    <div className={cn("h-6 w-6 rounded-full", climateStatus.color)}></div>
                    <p className="font-semibold">{climateStatus.text}</p>
                </div>

                {debugMode && (
                    <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                        <h3 className="text-lg font-semibold mb-3">{t('iotMonitor.debugPanel')}</h3>
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm font-medium text-gray-700">{t('iotMonitor.currentData')}:</p>
                                <pre className="text-xs bg-white p-2 rounded border overflow-auto">
                                    {JSON.stringify(deviceData, null, 2)}
                                </pre>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-700">{t('iotMonitor.rawData')}:</p>
                                <pre className="text-xs bg-white p-2 rounded border overflow-auto max-h-32">
                                    {rawData || 'Нет данных'}
                                </pre>
                            </div>
                            <div className="text-xs text-gray-600">
                                <p>{t('iotMonitor.checkConsole')}</p>
                                <p>{t('iotMonitor.supportedFields')}</p>
                                <p>{t('iotMonitor.currentFormat')}: {"{"}"temperature":29.0,"humidity":14.0,"sound_ao":63,"sound_do":1{"}"}</p>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
        
        {/* Мягкие уведомления */}
        <NotificationContainer />
    </div>
  );
}
