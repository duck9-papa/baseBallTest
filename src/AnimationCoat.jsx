import { OrbitControls, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";

const AnimationCoat = ({ position = [10, 0, -20] }) => {
  const refMesh = useRef();

  //   useFrame((state, delta) => {
  //     refMesh.current.rotation.z += delta;
  //   });

  const Court = useGLTF("/models/volleyball.glb");
  useEffect(() => {
    Court.scene.position.x = position[0];
    Court.scene.position.z = position[2];
    Court.scene.scale.z = 1.3;
    Court.scene.scale.x = 1.1;
  }, [Court.scene]);

  return (
    <>
      <directionalLight position={[2, 10, 2]} />
      <directionalLight position={[-2, -2, -2]} />

      {/* <axesHelper scale={10} /> */}
      <primitive object={Court.scene} />
      <OrbitControls />
    </>
  );
};

export default AnimationCoat;
