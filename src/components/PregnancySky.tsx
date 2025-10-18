"use client";

import React, { useMemo, useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import * as THREE from 'three';

interface PregnancySkyProps {
  currentWeek: number;
  maxStars?: number;
  animate?: boolean;
}

interface StarFieldProps {
  currentWeek: number;
  maxStars: number;
  animate: boolean;
}

interface EarthProps {
  currentWeek: number;
  animate: boolean;
}

// Компонент звёздного поля
const StarField: React.FC<StarFieldProps> = ({ currentWeek, maxStars, animate }) => {
  const meshRef = useRef<THREE.Points>(null);

  // Генерируем позиции и размеры звёзд
  const { positions, sizes } = useMemo(() => {
    const positions = new Float32Array(maxStars * 3);
    const sizes = new Float32Array(maxStars);
    
    for (let i = 0; i < maxStars; i++) {
      // Случайные позиции в сфере
      const radius = 50 + Math.random() * 100;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
      
      // Размеры звёзд (от 0.2 до 1.0)
      sizes[i] = 0.2 + Math.random() * 0.8;
    }
    
    return { positions, sizes };
  }, [maxStars]);

  // Анимация мерцания
  useFrame((state) => {
    if (meshRef.current && animate) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.005;
      // Добавляем лёгкое мерцание через изменение масштаба
      const time = state.clock.elapsedTime;
      meshRef.current.scale.setScalar(1 + Math.sin(time * 2) * 0.1);
    }
  });

  // Вычисляем количество видимых звёзд
  const visibleStars = Math.floor((currentWeek / 40) * maxStars);
  const visiblePositions = positions.slice(0, visibleStars * 3);
  const visibleSizes = sizes.slice(0, visibleStars);

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[visiblePositions, 3]}
          count={visibleStars}
        />
        <bufferAttribute
          attach="attributes-size"
          args={[visibleSizes, 1]}
          count={visibleStars}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.3}
        color="#ffffff"
        transparent
        opacity={0.9}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        vertexColors={false}
      />
    </points>
  );
};

// Компонент бьющегося сердца
const Heart: React.FC<{ currentWeek: number; animate: boolean }> = ({ currentWeek, animate }) => {
  const meshRef = useRef<THREE.Group>(null);
  
  // Загружаем .obj модель сердца
  const heartModel = useLoader(OBJLoader, '/assets/models/heart.obj');
  
  // Размер сердца растёт с прогрессом беременности (30% от высоты экрана)
  const heartSize = useMemo(() => {
    const progress = currentWeek / 40;
    const baseSize = 0.3; // Базовый размер (30% от высоты экрана)
    return baseSize + progress * 0.2; // От 0.3 до 0.5
  }, [currentWeek]);

  // Анимация биения сердца
  useFrame((state) => {
    if (meshRef.current && animate) {
      const time = state.clock.elapsedTime;
      const heartbeat = 1 + Math.sin(time * 3) * 0.1; // Биение
      const pulse = 1 + Math.sin(time * 1.5) * 0.05; // Пульс
      meshRef.current.scale.setScalar(heartbeat * pulse * heartSize);
      meshRef.current.rotation.z = Math.sin(time * 0.5) * 0.1; // Лёгкое покачивание
    }
  });

  // Применяем красный материал и центрируем загруженную модель
  useEffect(() => {
    if (heartModel) {
      // Центрируем и масштабируем модель
      const box = new THREE.Box3().setFromObject(heartModel);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 0.5 / maxDim; // Уменьшаем нормализацию (было 2, стало 0.5)
      
      heartModel.position.sub(center);
      heartModel.scale.setScalar(scale);
      
      // Применяем красный материал
      heartModel.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.material = new THREE.MeshPhysicalMaterial({
            color: "#ff0000",
            metalness: 0.1,
            roughness: 0.2,
            emissive: "#ff0000",
            emissiveIntensity: 0.4,
            transparent: true,
            opacity: 1.0
          });
        }
      });
    }
  }, [heartModel]);

  // Fallback геометрия сердца, если .obj не загружается
  const fallbackHeartGeometry = useMemo(() => {
    const geometry = new THREE.SphereGeometry(1, 16, 16);
    
    // Деформируем сферу в форму сердца
    const positions = geometry.attributes.position.array;
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const y = positions[i + 1];
      const z = positions[i + 2];
      
      // Создаём форму сердца
      const heartX = x * (1 + Math.sin(y * 2) * 0.3);
      const heartY = y * (1 + Math.cos(x * 2) * 0.2);
      const heartZ = z * 0.8;
      
      positions[i] = heartX;
      positions[i + 1] = heartY;
      positions[i + 2] = heartZ;
    }
    
    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();
    
    return geometry;
  }, []);

  return (
    <group ref={meshRef} position={[0, 0, 0]}>
      {heartModel ? (
        <primitive 
          object={heartModel.clone()} 
          scale={[heartSize, heartSize, heartSize]}
          position={[0, 0, 0]}
        />
      ) : (
        <mesh geometry={fallbackHeartGeometry} scale={[heartSize, heartSize, heartSize]}>
          <meshPhysicalMaterial
            color="#ff0000"
            metalness={0.1}
            roughness={0.2}
            emissive="#ff0000"
            emissiveIntensity={0.4}
            transparent
            opacity={1.0}
          />
        </mesh>
      )}
      {/* Дополнительное освещение для сердца */}
      <pointLight position={[0, 0, 5]} intensity={1} color="#ff0000" />
    </group>
  );
};

// Простой компонент для отладки
const DebugInfo: React.FC<{ currentWeek: number }> = ({ currentWeek }) => {
  return (
    <div className="absolute top-4 left-4 text-white z-20">
      <p>Неделя: {currentWeek}</p>
      <p>Звёзд: {Math.floor((currentWeek / 40) * 1000)}</p>
    </div>
  );
};

// Компонент для обработки ошибок WebGL
const WebGLErrorHandler: React.FC = () => {
  const { gl } = useThree();
  
  useEffect(() => {
    const handleContextLost = (event: Event) => {
      console.warn('WebGL Context Lost, attempting to restore...');
      event.preventDefault();
    };

    const handleContextRestored = () => {
      console.log('WebGL Context Restored');
    };

    const canvas = gl.domElement;
    canvas.addEventListener('webglcontextlost', handleContextLost);
    canvas.addEventListener('webglcontextrestored', handleContextRestored);

    return () => {
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      canvas.removeEventListener('webglcontextrestored', handleContextRestored);
    };
  }, [gl]);

  return null;
};

// Fallback компонент без WebGL
const FallbackSky: React.FC<{ currentWeek: number }> = ({ currentWeek }) => {
  const progress = currentWeek / 40;
  const starCount = Math.floor(progress * 100);
  
  return (
    <div className="absolute inset-0 z-0 bg-gradient-to-b from-blue-900 to-purple-900">
      <style jsx>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes heartbeat {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        .star {
          animation: twinkle 2s infinite ease-in-out;
        }
        .heart-beat {
          animation: heartbeat 1.5s ease-in-out infinite;
        }
      `}</style>
      {/* CSS звёзды как fallback */}
      <div className="absolute inset-0">
        {Array.from({ length: starCount }, (_, i) => (
          <div
            key={i}
            className="star absolute bg-white rounded-full"
            style={{
              width: `${0.3 + Math.random() * 0.7}px`,
              height: `${0.3 + Math.random() * 0.7}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${1.5 + Math.random() * 2.5}s`,
              boxShadow: `0 0 ${1 + Math.random() * 3}px rgba(255, 255, 255, 0.9), 0 0 ${3 + Math.random() * 6}px rgba(255, 255, 255, 0.4)`,
              filter: 'blur(0.3px)'
            }}
          />
        ))}
      </div>
      
      {/* Центральное сердце */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div 
          className="heart"
          style={{
            width: '30vh', // 30% от высоты экрана
            height: '30vh',
            backgroundColor: '#ff0000',
            transform: `scale(${1 + progress * 0.2})`,
            animation: 'heartbeat 1.5s ease-in-out infinite',
            clipPath: 'polygon(50% 100%, 0% 50%, 0% 30%, 20% 30%, 50% 60%, 80% 30%, 100% 30%, 100% 50%)',
            boxShadow: '0 0 20px #ff0000, 0 0 40px #ff0000',
            filter: 'blur(1px)',
          }}
        />
      </div>

    </div>
  );
};

// Основной компонент
const PregnancySky: React.FC<PregnancySkyProps> = ({ 
  currentWeek, 
  maxStars = 1000, 
  animate = true 
}) => {
  const [key, setKey] = useState(0);
  const [webglSupported, setWebglSupported] = useState(true);
  
  // Адаптация под мобильные устройства
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const adjustedMaxStars = isMobile ? Math.min(maxStars, 500) : maxStars;

  // Проверка поддержки WebGL
  useEffect(() => {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    setWebglSupported(!!gl);
  }, []);

  // Перезагрузка компонента при ошибках
  useEffect(() => {
    const handleError = () => {
      console.log('Reloading PregnancySky component...');
      setKey(prev => prev + 1);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  // Если WebGL не поддерживается, показываем fallback
  if (!webglSupported) {
    return <FallbackSky currentWeek={currentWeek} />;
  }

  return (
    <div className="absolute inset-0 z-0 bg-gradient-to-b from-blue-900 to-purple-900">
      <Canvas
        key={key}
        camera={{ position: [0, 0, 10], fov: 75 }}
        style={{ background: 'transparent' }}
        onCreated={({ gl, camera }) => {
          gl.setClearColor(0x000000, 0);
          // Принудительно позиционируем камеру
          camera.position.set(0, 0, 10);
          camera.lookAt(0, 0, 0);
        }}
        onError={(error) => {
          console.error('Canvas error:', error);
          setKey(prev => prev + 1);
        }}
      >
        {/* Обработчик ошибок WebGL */}
        <WebGLErrorHandler />
        
        {/* Освещение */}
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={0.8} />
        <pointLight position={[-10, -10, -10]} intensity={0.4} />
        
        {/* Звёздное поле */}
        <StarField 
          currentWeek={currentWeek} 
          maxStars={adjustedMaxStars} 
          animate={animate} 
        />
        
        {/* Бьющееся сердце */}
        <Heart currentWeek={currentWeek} animate={animate} />
        
        {/* Орбитальные контролы (отключены по умолчанию) */}
        <OrbitControls 
          enableZoom={false} 
          enablePan={false} 
          enableRotate={false}
          autoRotate={animate}
          autoRotateSpeed={0.5}
        />
      </Canvas>
      
    </div>
  );
};

export default PregnancySky;
