import { OrbitControls, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useState } from "react";

const initialPosition = {
  xPosition: 2,
  yPosition: 2,
  zPosition: 20,
};

const dummyHeatmap = [];
for (let i = 0; i < 150; i++) {
  const xValue = 6 - Math.random() * 12;
  const yValue = Math.random() * 3 + 6;
  const zValue = Math.random() * 4 + 2;
  const resultX = 6 - Math.random() * 12;
  const resultY = 1;
  const resultZ = 0 - Math.random() * 20;
  dummyHeatmap.push({
    position: [
      [xValue, yValue, zValue],
      [resultX, resultY, resultZ],
    ],
    color: Math.random() < 0.8 ? "yellow" : "red",
  });
}

const MyElement3D = () => {
  const [select, setSelect] = useState(null);

  return (
    <>
      <directionalLight position={[1, 1, 1]} />

      <OrbitControls />

      {dummyHeatmap.map((item, index) => (
        <mesh
          position={item.position[0]}
          key={index}
          onClick={() => setSelect(index === select ? null : index)}>
          <capsuleGeometry args={[0.5, 0, 16, 32]} />

          <meshBasicMaterial
            transparent
            opacity={item.color === "red" ? 0.6 : 0.3}
            color={item.color}
          />
        </mesh>
      ))}
      {dummyHeatmap.map((item, index) => (
        <mesh
          position={item.position[1]}
          key={index}
          onClick={() => setSelect(index === select ? null : index)}>
          <capsuleGeometry args={[0.5, 0, 16, 32]} />

          <meshBasicMaterial
            transparent
            opacity={item.color === "red" ? 0.6 : 0.3}
            color={item.color}
          />
        </mesh>
      ))}
      <axesHelper scale={10} />
    </>
  );
};

export default MyElement3D;
