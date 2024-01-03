import { Box, OrbitControls, useGLTF } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useControls } from "leva";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useState } from "react";
const YReturn = action => {
  if (action === "ready") {
    return 1;
  }
  if (action.includes("x")) {
    return 6;
  }
  if (action.includes("q")) {
    return 5;
  }
  if (action.includes("s")) {
    return 3;
  }
  if (action.includes("a")) {
    return 7;
  }

  return 2;
};

const dummyRally = [
  {
    teamId: "KRPMAM01",
    teamName: "우리카드",
    mainAction: "ready",
    locationX: 14.0,
    locationY: 75.78,
  },
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
  {
    teamId: "KRPMEQ01",
    teamName: "삼성화재",
    mainAction: "z",
    locationX: 51,
    locationY: 250,
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

const MyElement3D = ({ rally, playing, setPlaying }) => {
  const rallyConvert = useMemo(() => {
    const dummy = [];
    for (let i = 0; i < rally.length; i++) {
      const xValue = Number(((rally[i].locationY / 100) * 20).toFixed(2));
      const zValue = Number(-((rally[i].locationX / 100) * 40).toFixed(2));
      const yValue = YReturn(rally[i].mainAction);

      if (i === 0) {
        dummy.push({
          position: [xValue, 1.5, zValue],
          mainAction: "ready",
        });
      }

      dummy.push({
        position: [xValue, yValue, zValue],
        mainAction: rally[i].mainAction,
      });
      if (i === rally.length - 1) {
        dummy.push({
          position: [xValue > 10 ? 30 : -10, 0, zValue],
          mainAction: "out",
        });
      }
    }
    return dummy;
  }, [rally]);
  const initialPosition = useMemo(
    () => ({
      xPosition: rallyConvert?.[0]?.position?.[0],
      yPosition: rallyConvert?.[0]?.position?.[1],
      zPosition: rallyConvert?.[0]?.position?.[2],
    }),
    [rallyConvert]
  );

  const [{ xPosition, yPosition, zPosition }, setPosition] =
    useState(initialPosition);

  useEffect(() => {
    setPlaying(false);
    setPosition(initialPosition);
    setRallyIndex(0);
  }, [initialPosition, setPlaying]);

  const { camera } = useThree();

  const [rallyIndex, setRallyIndex] = useState(0);
  const VolleyBall = useGLTF("/models/ball.glb");

  useFrame((state, delta) => {
    camera.lookAt(10, 0, -20);

    VolleyBall.scene.rotateX(delta);
    VolleyBall.scene.rotateY(delta);

    if (playing && rallyConvert[rallyIndex + 1]) {
      const [currentX, currentY, currentZ] = rallyConvert[rallyIndex].position;
      const [nextX, nextY, nextZ] = rallyConvert[rallyIndex + 1].position;
      const currentAction = rallyConvert[rallyIndex]?.mainAction;
      const nextAction = rallyConvert[rallyIndex + 1]?.mainAction;
      const actionCoefficient =
        currentAction?.includes("q") || currentAction?.includes("x")
          ? 2
          : nextAction?.includes("out")
            ? 3
            : 1;
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

      const xValue =
        xPosition +
        Number(
          `${!xCheck ? "-" : "+"}${
            delta * 16 * xCoefficient * actionCoefficient
          }`
        );
      const yValue =
        yPosition +
        Number(
          `${!yCheck ? "-" : "+"}${
            delta * 16 * yCoefficient * actionCoefficient
          }`
        );
      const zValue =
        zPosition +
        Number(
          `${!zCheck ? "-" : "+"}${
            delta * 16 * zCoefficient * actionCoefficient
          }`
        );
      setPosition({ xPosition: xValue, yPosition: yValue, zPosition: zValue });

      VolleyBall.scene.position.x = xValue;
      VolleyBall.scene.position.y = yValue;
      VolleyBall.scene.position.z = zValue;

      if (
        ((xCheck && xPosition >= nextX) || (!xCheck && xPosition <= nextX)) &&
        ((yCheck && yPosition >= nextY) || (!yCheck && yPosition <= nextY)) &&
        ((zCheck && zPosition >= nextZ) || (!zCheck && zPosition <= nextZ))
      ) {
        setRallyIndex(pre => pre + 1);
        setPosition({ xPosition: nextX, yPosition: nextY, zPosition: nextZ });
      }
    } else {
      if (rallyIndex + 1 === rallyConvert?.length)
        setTimeout(() => {
          setPlaying(false);
          setPosition(initialPosition);
          setRallyIndex(0);
          VolleyBall.scene.position.x = initialPosition.xPosition;
          VolleyBall.scene.position.y = initialPosition.yPosition;
          VolleyBall.scene.position.z = initialPosition.zPosition;
        }, 500);
    }
  });

  const PlayingBall = () => {
    if (!playing) setPlaying(true);
    setRallyIndex(0);
  };

  useEffect(() => {
    VolleyBall.scene.traverse(item => {});

    VolleyBall.scene.scale.x = 0.02;
    VolleyBall.scene.scale.y = 0.02;
    VolleyBall.scene.scale.z = 0.02;
    VolleyBall.scene.position.x = initialPosition.xPosition;
    VolleyBall.scene.position.y = initialPosition.yPosition;
    VolleyBall.scene.position.z = initialPosition.zPosition;
  }, [VolleyBall.scene, initialPosition]);

  return (
    <>
      <directionalLight position={[1, 1, 1]} />
      <ambientLight color={"#FFFFFF"} />
      <OrbitControls />

      <primitive object={VolleyBall.scene} onClick={PlayingBall} />
      {/* <mesh
        ref={meshRef}
        position={[xPosition, yPosition, zPosition]}
        onClick={PlayingBall}>
        <capsuleGeometry args={[1, 0, 4, 16]} />
        <meshStandardMaterial emissive={"black"} wireframe />
      </mesh> */}
      {/* <mesh ref={secondRef} position={[xPosition, yPosition, zPosition]}></mesh> */}
    </>
  );
};

export default MyElement3D;
