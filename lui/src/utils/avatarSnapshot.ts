import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

export const getAvatarSnapshot = async (avatar: AvatarCustomization): Promise<string> => {
  return new Promise((resolve) => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(100, 100); // Small size for avatar thumbnail

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(0, 1, 1);
    scene.add(directionalLight);

    if (avatar.modelUrl) {
      const loader = new GLTFLoader();
      loader.load(
        avatar.modelUrl,
        (gltf) => {
          const model = gltf.scene;
          scene.add(model);
          model.position.set(0, 0, 0);

          camera.position.z = 2;
          renderer.render(scene, camera);

          const snapshot = renderer.domElement.toDataURL('image/png');
          resolve(snapshot);
        },
        undefined,
        (error) => {
          console.error('Error loading avatar for snapshot:', error);
          resolve(''); // Fallback to empty string
        }
      );
    } else {
      resolve(''); // No model, return empty string
    }
  });
};
