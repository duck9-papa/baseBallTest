import { OrbitControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

const MyElement3D = () => {
  const refMesh = useRef();

  //   useFrame((state, delta) => {
  //     refMesh.current.rotation.z += delta;
  //   });

  return (
    <>
      <directionalLight position={[1, 1, 1]} />

      <axesHelper scale={10} />
      <OrbitControls />
      <mesh ref={refMesh}>
        <boxGeometry />
        <meshStandardMaterial color="#e67e22" />
      </mesh>
    </>
  );
};

export default MyElement3D;
