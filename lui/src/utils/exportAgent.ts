import * as THREE from 'three';
import { VRM, VRMUtils } from '@pixiv/three-vrm';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

export const exportAgentAsVRM = async (agent: NimbusAgent): Promise<Blob> => {
  const loader = new GLTFLoader();
  const gltf = await loader.loadAsync(agent.avatar.modelUrl);
  const vrm = await VRM.from(gltf);

  // Apply customization
  vrm.scene.scale.setScalar(agent.avatar.height / 1.8);
  vrm.scene.traverse((child) => {
    if (child instanceof THREE.Mesh && child.material) {
      const colorMap: Record<string, number> = {
        light: 0xffe0bd,
        medium: 0xd2b48c,
        dark: 0x8d5524,
      };
      child.material.color.setHex(colorMap[agent.avatar.skinTone] || 0xd2b48c);
    }
  });

  // Export as VRM
  const exporter = new THREE.GLTFExporter();
  const vrmBlob = await new Promise<Blob>((resolve) => {
    exporter.parse(
      vrm.scene,
      (gltf) => {
        const blob = new Blob([JSON.stringify(gltf)], { type: 'model/gltf+json' });
        resolve(blob);
      },
      (error) => {
        console.error('Error exporting VRM:', error);
        resolve(new Blob());
      },
      { binary: false }
    );
  });

  return vrmBlob;
};
