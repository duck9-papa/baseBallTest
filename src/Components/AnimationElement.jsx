import { Box, OrbitControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useControls } from "leva";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useState } from "react";

const YReturn = action => {
  if (action.includes("x")) {
    return 8;
  }
  if (action.includes("q")) {
    return 10;
  }
  if (action.includes("a")) {
    return 5;
  }
  return 3;
};

const dummyRally = [
  {
    mainAction: "a",
    locationX: 14.48,
    locationY: 51.11,
  },
  {
    mainAction: "f",
    locationX: 76.57,
    locationY: 50.44,
  },
  {
    mainAction: "s",
    locationX: 63.33,
    locationY: 48.67,
  },
  {
    mainAction: "q+",
    locationX: 61.43,
    locationY: 90.44,
  },
  {
    mainAction: "x-",
    locationX: 48.57,
    locationY: 79.11,
  },
];

// y좌표가 0 일때 x 포지션이 -10
// x좌표가 0일때 z 포지션이 20
// x좌표 => z포지션
// y좌표 => x포지션

const initialPosition = {
  xPosition: -10,
  yPosition: 2,
  zPosition: 20,
};

const dummyHeatmap = [];
for (let i = 0; i < dummyRally.length; i++) {
  const xValue = Number(
    -10 + ((dummyRally[i].locationY / 20) * 100).toFixed(2)
  );
  const zValue = Number((20 - (dummyRally[i].locationX / 40) * 100).toFixed(2));
  const yValue = YReturn(dummyRally[i].mainAction);

  dummyHeatmap.push({
    position: [xValue, yValue, zValue],
    color: Math.random() < 0.8 ? "rgba(0,255,0,0.1)" : "rgba(255, 0, 0, 0.1)",
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
  });

  const PlayingBall = () => {
    setPlay(true);
  };

  return (
    <>
      <directionalLight position={[1, 1, 1]} />

      <OrbitControls />
      <mesh position={[10, 2, -20]} onClick={PlayingBall}>
        <capsuleGeometry args={[capRadius, 0, 16, 64]} />
        <meshStandardMaterial color="white" />
      </mesh>
      <mesh position={[xPosition, yPosition, zPosition]} onClick={PlayingBall}>
        <capsuleGeometry args={[capRadius, 0, 16, 64]} />
        <meshStandardMaterial color="white" />
      </mesh>
      <mesh position={[xPosition, yPosition, zPosition]}>
        <capsuleGeometry args={[capRadius, 0, 16, 64]} />
        <meshStandardMaterial emissive={"red"} wireframe />
      </mesh>
      {dummyHeatmap.map(i => {
        console.log(i);
        return (
          <>
            <mesh position={i.position} onClick={PlayingBall}>
              <capsuleGeometry args={[capRadius, 0, 16, 64]} />
              <meshStandardMaterial color="white" />
            </mesh>
            <mesh position={i.position}>
              <capsuleGeometry args={[capRadius, 0, 16, 64]} />
              <meshStandardMaterial emissive={"red"} wireframe />
            </mesh>
          </>
        );
      })}
      <axesHelper scale={10} />
    </>
  );
};

export default MyElement3D;
