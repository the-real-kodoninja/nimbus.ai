import React, { useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';

interface AvatarCustomization {
  modelUrl: string;
  textureUrl?: string;
  height: number;
  skinTone: 'light' | 'medium' | 'dark';
}

interface Props {
  avatar: AvatarCustomization;
  isTalking: boolean;
}

const AvatarModel: React.FC<{ avatar: AvatarCustomization; isTalking: boolean }> = ({ avatar, isTalking }) => {
  const { scene, animations } = useGLTF(avatar.modelUrl);
  const { actions } = useAnimations(animations, scene);
  const modelRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (!scene) return;

    // Apply customization
    scene.scale.setScalar(avatar.height / 1.8);
    scene.position.set(0, 0, 0);

    scene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        // Apply skin tone
        const colorMap: Record<string, number> = {
          light: 0xffe0bd,
          medium: 0xd2b48c,
          dark: 0x8d5524,
        };
        child.material.color.setHex(colorMap[avatar.skinTone] || 0xd2b48c);

        // Apply texture if provided
        if (avatar.textureUrl) {
          const textureLoader = new THREE.TextureLoader();
          textureLoader.load(avatar.textureUrl, (texture) => {
            child.material.map = texture;
            child.material.needsUpdate = true;
          });
        }
      }
    });

    // Handle animations
    if (isTalking && actions.talk) {
      actions.talk.play();
    } else if (actions.idle) {
      actions.idle.play();
    }

    return () => {
      Object.values(actions).forEach(action => action?.stop());
    };
  }, [avatar, isTalking, actions, scene]);

  return <primitive ref={modelRef} object={scene} />;
};

const VirtualSpace: React.FC<Props> = ({ avatar, isTalking }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Handle resize
    const handleResize = () => {
      if (mountRef.current) {
        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight;
        // Canvas size is managed by react-three/fiber
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div ref={mountRef} style={{ width: '100%', height: '400px' }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        style={{ width: '100%', height: '100%' }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[0, 1, 1]} intensity={0.5} />
        {avatar.modelUrl && <AvatarModel avatar={avatar} isTalking={isTalking} />}
        <OrbitControls />
      </Canvas>
    </div>
  );
};

export default VirtualSpace;