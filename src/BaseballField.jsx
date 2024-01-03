import { OrbitControls, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";

const BaseballField = ({ position = [10, 0, -20] }) => {
  const refMesh = useRef();

  const Field = useGLTF("/models/baseball_field.glb");
  useEffect(() => {
    Field.scene.position.x = 135;
    Field.scene.position.z = 32;
    Field.scene.scale.z = 0.14;
    Field.scene.scale.x = 0.14;
    Field.scene.scale.y = 0.14;
    Field.scene.receiveShadow = false;
    Field.scene.castShadow = true;
  }, [Field.scene]);

  return (
    <>
      {/* <directionalLight position={[2, 10, 2]} />
      <directionalLight position={[-2, -2, -2]} /> */}

      {/* <axesHelper scale={5} /> */}
      <primitive object={Field.scene} />

      <OrbitControls />
    </>
  );
};

export default BaseballField;
