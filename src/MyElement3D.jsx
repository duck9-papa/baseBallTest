import { Box, OrbitControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useControls } from "leva";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useState } from "react";

const MyBox = props => {
  const geom = new THREE.BoxGeometry();
  return <mesh {...props} geometry={geom}></mesh>;
};

const initialPosition = {
  xPosition: 2,
  yPosition: 2,
  zPosition: 20,
};

const dummyHeatmap = [];
for (let i = 0; i < 80; i++) {
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
    color: Math.random() < 0.8 ? "green" : "red",
  });
}

const MyElement3D = () => {
  const { capRadius } = useControls({
    capRadius: { value: 1, min: 1, max: 20, step: 0.01 },
  });

  const [{ xPosition, yPosition, zPosition }, setPosition] =
    useState(initialPosition);

  const [play, setPlay] = useState(false);
  const [yReverse, setYRevse] = useState(false);
  const [select, setSelect] = useState(null);
  useFrame((state, delta) => {
    if (play) {
      const deltaValue = !yReverse
        ? Math.floor(11 - yPosition) * 2
        : yPosition / 2;
      const yValue = !yReverse ? yPosition + delta * 4 : yPosition - delta * 4;
      setPosition({
        xPosition: xPosition,
        yPosition: yValue <= 1 ? 1 : yValue,
        zPosition: zPosition - delta * 16,
      });
    }
    if (yPosition >= 6.5) {
      setYRevse(true);
    }
    if (xPosition <= -10 || zPosition <= -15) {
      setPlay(false);
      setPosition(initialPosition);
      setYRevse(false);
    }
    // if (!play) {
    //   setPlay(true);
    // }
  });

  const PlayingBall = () => {
    setPlay(true);
  };

  return (
    <>
      <directionalLight position={[1, 1, 1]} />

      <OrbitControls />

      {dummyHeatmap.map((item, index) => (
        <mesh
          position={item.position[0]}
          key={index}
          onClick={() => setSelect(index === select ? null : index)}>
          <capsuleGeometry
            args={[
              index === select ? 1 : 0.5,
              0,
              index === select ? 16 : 2,
              index === select ? 32 : 8,
            ]}
          />
          <meshStandardMaterial
            emissive={index === select ? "blue" : item.color}
            wireframe
          />
        </mesh>
      ))}
      {dummyHeatmap.map((item, index) => (
        <mesh
          position={item.position[1]}
          key={index}
          onClick={() => setSelect(index === select ? null : index)}>
          <capsuleGeometry
            args={[
              index === select ? 1 : 0.5,
              0,
              index === select ? 16 : 2,
              index === select ? 32 : 8,
            ]}
          />
          <meshStandardMaterial
            emissive={index === select ? "blue" : item.color}
            wireframe
          />
        </mesh>
      ))}
      <axesHelper scale={10} />
    </>
  );
};

export default MyElement3D;
