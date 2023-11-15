import { OrbitControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

const Coat3D = () => {
  const refMesh = useRef();

  //   useFrame((state, delta) => {
  //     refMesh.current.rotation.z += delta;
  //   });

  return (
    <>
      <directionalLight color={"blue"} position={[20, 0, 40]} />

      {/* <axesHelper scale={10} /> */}
      {/* <OrbitControls /> */}
      <mesh ref={refMesh} scale={[20, 0, 40]} position={[10, 0, 10]}>
        <boxGeometry />
        <meshStandardMaterial color="blue" />
      </mesh>
    </>
  );
};

export default Coat3D;
