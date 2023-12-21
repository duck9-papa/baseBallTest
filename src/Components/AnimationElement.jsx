import { Box, OrbitControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
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
    return 7;
  }
  return 3;
};

const dummyRally = [
  {
    teamId: "KRPMAM01",
    teamName: "우리카드",
    mainAction: "a",
    locationX: 14.0,
    locationY: 75.78,
  },
  {
    teamId: "KRPMEQ01",
    teamName: "삼성화재",
    mainAction: "f",
    locationX: 75.9,
    locationY: 18.44,
  },
  {
    teamId: "KRPMEQ01",
    teamName: "삼성화재",
    mainAction: "s",
    locationX: 57.05,
    locationY: 49.56,
  },
  {
    teamId: "KRPMEQ01",
    teamName: "삼성화재",
    mainAction: "q",
    locationX: 59.71,
    locationY: 66.89,
  },
  {
    teamId: "KRPMAM01",
    teamName: "우리카드",
    mainAction: "d",
    locationX: 24.95,
    locationY: 57.78,
  },
  {
    teamId: "KRPMAM01",
    teamName: "우리카드",
    mainAction: "s",
    locationX: 28.19,
    locationY: 44.44,
  },
  {
    teamId: "KRPMAM01",
    teamName: "우리카드",
    mainAction: "q",
    locationX: 33.71,
    locationY: 87.33,
  },
  {
    teamId: "KRPMEQ01",
    teamName: "삼성화재",
    mainAction: "d",
    locationX: 63.24,
    locationY: 68.44,
  },
  {
    teamId: "KRPMEQ01",
    teamName: "삼성화재",
    mainAction: "s",
    locationX: 72.48,
    locationY: 64.44,
  },
  {
    teamId: "KRPMEQ01",
    teamName: "삼성화재",
    mainAction: "q",
    locationX: 66.0,
    locationY: 14.89,
  },
  {
    teamId: "KRPMAM01",
    teamName: "우리카드",
    mainAction: "x",
    locationX: 48.76,
    locationY: 20.44,
  },
  {
    teamId: "KRPMAM01",
    teamName: "우리카드",
    mainAction: "d",
    locationX: 19.05,
    locationY: 79.56,
  },
  {
    teamId: "KRPMAM01",
    teamName: "우리카드",
    mainAction: "s",
    locationX: 34.0,
    locationY: 50.67,
  },
  {
    teamId: "KRPMAM01",
    teamName: "우리카드",
    mainAction: "q+",
    locationX: 32.95,
    locationY: 88.22,
  },
  {
    teamId: "KRPMEQ01",
    teamName: "삼성화재",
    mainAction: "x-",
    locationX: 51.24,
    locationY: 81.11,
  },
];
// y좌표가 0 일때 x 포지션이 0
// x좌표가 0일때 z 포지션이 0
// x좌표 => z포지션
// y좌표 => x포지션
// x좌표가 14일때 40의 14% 지점의 z포지션을 가진다 14 / 40 40 * 0.14    40 * (14/100)
const dummyHeatmap = [];
for (let i = 0; i < dummyRally.length; i++) {
  const xValue = Number(((dummyRally[i].locationY / 100) * 20).toFixed(2));
  const zValue = Number(-((dummyRally[i].locationX / 100) * 40).toFixed(2));
  const yValue = YReturn(dummyRally[i].mainAction);

  dummyHeatmap.push({
    position: [xValue, yValue, zValue],
    mainAction: dummyRally[i].mainAction,
  });
}

const initialPosition = {
  xPosition: dummyHeatmap[0].position[0],
  yPosition: dummyHeatmap[0].position[1],
  zPosition: dummyHeatmap[0].position[2],
};

const MyElement3D = () => {
  const [{ xPosition, yPosition, zPosition }, setPosition] =
    useState(initialPosition);

  const meshRef = useRef();
  const secondRef = useRef();
  const { camera } = useThree();

  const [play, setPlay] = useState(false);
  const [rallyIndex, setRallyIndex] = useState(0);

  useFrame((state, delta) => {
    camera.lookAt(10, 0, -20);
    if (play && dummyHeatmap[rallyIndex + 1]) {
      const [currentX, currentY, currentZ] = dummyHeatmap[rallyIndex].position;
      const [nextX, nextY, nextZ] = dummyHeatmap[rallyIndex + 1].position;
      // check = 현재 인덱스 포지션이 타겟 포지션보다 작은지
      const xCheck = nextX - currentX >= 0;
      const yCheck = nextY - currentY >= 0;
      const zCheck = nextZ - currentZ >= 0;
      const maxima = Math.max(
        ...[
          Math.abs(nextX - currentX),
          Math.abs(nextY - currentY),
          Math.abs(nextZ - currentZ),
        ]
      );
      const xCoefficient = Math.abs(nextX - currentX) / maxima || 0;
      const yCoefficient = Math.abs(nextY - currentY) / maxima || 0;
      const zCoefficient = Math.abs(nextZ - currentZ) / maxima || 0;

      //  x 좌표 0~100 => z포지션 -40~0
      //  y 좌표 0~100 => x포지션 0~20
      // currentX = 10 , nextX = 9.73
      // currentY = 3, nextY = 3
      // currentZ = -31, nextZ = -25, zCheck = false 델타가 음수로 가야함

      const xValue =
        xPosition +
        Number(`${!xCheck ? "-" : "+"}${delta * 24 * xCoefficient}`);
      const yValue =
        yPosition +
        Number(`${!yCheck ? "-" : "+"}${delta * 24 * yCoefficient}`);
      const zValue =
        zPosition +
        Number(`${!zCheck ? "-" : "+"}${delta * 24 * zCoefficient}`);
      setPosition({ xPosition: xValue, yPosition: yValue, zPosition: zValue });

      if (
        ((xCheck && xPosition >= nextX) || (!xCheck && xPosition <= nextX)) &&
        ((yCheck && yPosition >= nextY) || (!yCheck && yPosition <= nextY)) &&
        ((zCheck && zPosition >= nextZ) || (!zCheck && zPosition <= nextZ))
      ) {
        setRallyIndex(pre => pre + 1);
        setPosition({ xPosition: nextX, yPosition: nextY, zPosition: nextZ });
      }
    } else {
      if (rallyIndex === dummyHeatmap.length - 1)
        setTimeout(() => {
          setPlay(false);
          setPosition(initialPosition);
          setRallyIndex(0);
        }, 2000);
    }
  });

  const PlayingBall = () => {
    setPlay(true);
    setRallyIndex(0);
  };

  useEffect(() => {
    secondRef.current.geometry = meshRef.current.geometry;
  }, [xPosition, yPosition, zPosition]);

  return (
    <>
      <directionalLight position={[1, 1, 1]} />

      <OrbitControls />
      <mesh position={[xPosition, yPosition, zPosition]}></mesh>
      <mesh
        ref={meshRef}
        position={[xPosition, yPosition, zPosition]}
        onClick={PlayingBall}>
        <capsuleGeometry args={[1, 0, 16, 64]} />
        <meshStandardMaterial color="white" />
      </mesh>
      <mesh ref={secondRef} position={[xPosition, yPosition, zPosition]}>
        <meshStandardMaterial emissive={"red"} wireframe />
      </mesh>
    </>
  );
};

export default MyElement3D;
