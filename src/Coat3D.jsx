import { OrbitControls } from "@react-three/drei";
import { useRef } from "react";

const Coat3D = ({ position = [10, 0, -20] }) => {
  const refMesh = useRef();

  //   useFrame((state, delta) => {
  //     refMesh.current.rotation.z += delta;
  //   });

  return (
    <>
      <directionalLight position={[2, 10, 2]} />
      <directionalLight position={[-2, -2, -2]} />

      {/* <axesHelper scale={10} /> */}
      <OrbitControls />
      <mesh ref={refMesh} scale={[20, 1, 40]} position={position}>
        <boxGeometry />
        <meshStandardMaterial color="orange" />
      </mesh>
    </>
  );
};

export default Coat3D;
