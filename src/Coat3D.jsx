import { OrbitControls } from "@react-three/drei";

const Coat3D = ({ position = [10, 0, -20] }) => {
  return (
    <>
      <directionalLight position={[-2, -2, -2]} />

      <directionalLight position={[2, 10, 2]} />

      <OrbitControls />
      <mesh position={position}>
        <boxGeometry args={[20, 1, 40]} />
        <meshStandardMaterial color="orange" />
      </mesh>
    </>
  );
};

export default Coat3D;
