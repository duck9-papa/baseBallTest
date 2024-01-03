import { Line, useGLTF, Tube } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useControls } from "leva";
import * as THREE from "three";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dummy from "./dummyBallData";

// 초기 속도, 가속도, 시간
const VCalculator = (initial, acceleration, time) => {
  return initial + acceleration * time;
};

const Baseball = ({ data = dummy }) => {
  const TimeCalculator = useCallback((row, Y) => {
    return (
      (-row.VY0 - Math.sqrt(Math.pow(row.VY0, 2) - 2 * row.AY * (row.Y0 - Y))) /
      row.AY
    );
  }, []);

  //

  const refMesh = useRef();
  const cylinderRef = useRef();
  const [select, setSelect] = useState(1);

  const dataRow = useMemo(() => {
    return data[select - 1];
  }, [data, select]);
  const basePosition = useMemo(
    () => [dataRow.Y0, dataRow.Z0, dataRow.X0],
    [dataRow]
  );

  const initialPoints = [
    new THREE.Vector3(basePosition[0], basePosition[1] + 0.5, basePosition[2]),
    new THREE.Vector3(basePosition[0], basePosition[1] + 0.5, basePosition[2]),
  ];

  const [count, setCount] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [points, setPoints] = useState(initialPoints);

  // 수식의 y축이 캔버스의 X축 수식의 Z축이 캔버스의 Y축 수식의X축이 캔버스의 Z축 [Y,Z,X] 형식으로 포지션 값 추가
  const dataPoints = useMemo(() => {
    let arr = [];
    for (let i = 50; i >= 0; i--) {
      const elapsedTime = TimeCalculator(dataRow, i);

      const xSpeed = VCalculator(dataRow.VX0, dataRow.AX, elapsedTime);

      const zSpeed = VCalculator(dataRow.VZ0, dataRow.AZ, elapsedTime);

      const xValue = dataRow.X0 + xSpeed * elapsedTime;
      const zValue = dataRow.Z0 + zSpeed * elapsedTime;
      arr.push([i, zValue, xValue]);
    }
    return arr;
  }, [dataRow, TimeCalculator]);
  console.log(dataPoints);
  const { targetX, targetY, targetZ, SZ_WIDTH, SZ_FRONT, SZ_SIDE, BALL_SPEED } =
    useControls({
      targetX: { value: 0, max: 20, min: -20, step: 0.01 },
      targetY: { value: 5, max: 20, min: -20, step: 0.01 },
      targetZ: { value: 0, max: 20, min: -20, step: 0.01 },
      SZ_WIDTH: { value: 1, max: 3, min: 0.5, step: 0.01 },
      SZ_FRONT: { value: 0, max: 3, min: -3, step: 0.01 },
      SZ_SIDE: { value: 0, max: 3, min: -3, step: 0.01 },
      BALL_SPEED: { value: 32, max: 128, min: 1, step: 1 },
    });

  const Ball = useGLTF("/models/baseball.glb");

  useFrame((_, delta) => {
    camera.lookAt(targetX, targetY, targetZ);

    Ball.scene.rotateY(delta * (playing ? 6 : 2));
    if (playing) {
      if (dataPoints[count + 1]) {
        const [currentX, currentY, currentZ] = dataPoints[count];
        const [nextX, nextY, nextZ] = dataPoints[count + 1];

        const maxima = Math.max(
          ...[
            Math.abs(nextX - currentX),
            Math.abs(nextY - currentY),
            Math.abs(nextZ - currentZ),
          ]
        );
        const xCheck = nextX - currentX >= 0;
        const yCheck = nextY - currentY >= 0;
        const zCheck = nextZ - currentZ >= 0;
        const xCoefficient = Math.abs(nextX - currentX) / maxima || 0;
        const yCoefficient = Math.abs(nextY - currentY) / maxima || 0;
        const zCoefficient = Math.abs(nextZ - currentZ) / maxima || 0;

        let xValue =
          Ball.scene.position.x +
          Number(`${!xCheck ? "-" : "+"}${delta * BALL_SPEED * xCoefficient}`);
        let yValue =
          Ball.scene.position.y +
          Number(`${!yCheck ? "-" : "+"}${delta * BALL_SPEED * yCoefficient}`);
        let zValue =
          Ball.scene.position.z +
          Number(`${!zCheck ? "-" : "+"}${delta * BALL_SPEED * zCoefficient}`);

        const xPosition =
          (xCheck && xValue > nextX) || (!xCheck && xValue < nextX)
            ? nextX
            : xValue;
        const yPosition =
          (yCheck && yValue > nextX) || (!yCheck && yValue < nextY)
            ? nextY
            : yValue;
        const zPosition =
          (zCheck && zValue > nextZ) || (!zCheck && zValue < nextZ)
            ? nextZ
            : zValue;
        if (
          (xCheck && Ball.scene.position.x >= nextX) ||
          (!xCheck &&
            Ball.scene.position.x <= nextX &&
            ((yCheck && Ball.scene.position.y >= nextY) ||
              (!yCheck && Ball.scene.position.y <= nextY)) &&
            ((zCheck && Ball.scene.position.z >= nextZ) ||
              (!zCheck && Ball.scene.position.z <= nextZ)))
        ) {
          setCount(pre => pre + 1);
          setPoints(pre => [
            ...pre,
            new THREE.Vector3(nextX, nextY + 0.5, nextZ),
          ]);
        } else {
          Ball.scene.position.x = xPosition;
          Ball.scene.position.y = yPosition;
          Ball.scene.position.z = zPosition;
        }
      } else {
        setTimeout(() => {
          setCount(0);
          setPoints(initialPoints);
          setPlaying(false);
          Ball.scene.position.x = basePosition[0];
          Ball.scene.position.y = basePosition[1];
          Ball.scene.position.z = basePosition[2];
        }, 500);
      }
    }
  });

  const { camera } = useThree();
  const SZ_HEIGHT = useMemo(() => {
    return dataRow.TOP_SZ - dataRow.BOTTOM_SZ;
  }, [dataRow]);
  const curveRef = useRef();
  useEffect(() => {
    Ball.scene.position.x = basePosition[0];
    Ball.scene.position.y = basePosition[1];
    Ball.scene.position.z = basePosition[2];

    Ball.scene.scale.x = 0.01;
    Ball.scene.scale.y = 0.01;
    Ball.scene.scale.z = 0.01;
    Ball.scene.receiveShadow = false;
    Ball.scene.castShadow = true;
  }, [Ball.scene, curveRef, basePosition]);

  const curve = useMemo(() => {
    const curveMemo = new THREE.CatmullRomCurve3(
      points,
      false,
      "catmullrom",
      0.5
    );

    return curveMemo;
  }, [points]);

  const linePoints =
    useMemo(() => {
      return curve.getPoints(50);
    }, [curve]) || [];

  const selectMeshs = useMemo(() => {
    let arr = [];
    for (let i = 1; i < 11; i++) {
      const y = Math.ceil(i / 2);
      const z = i % 2 === 0 ? 8 : 7;
      const position = [0, y, z];

      arr.push(
        <mesh
          key={`${i}meshKey`}
          position={position}
          scale={[0.5, 0.5, 0.5]}
          onClick={() => setSelect(i)}>
          <boxGeometry />
          <lineBasicMaterial
            transparent
            opacity={0.8}
            color={select === i ? "red" : "white"}
          />
        </mesh>
      );
    }
    return arr;
  }, [select]);

  return (
    <>
      <Line points={linePoints} color={"#0095d3"} lineWidth={30} />

      <directionalLight
        ref={refMesh}
        intensity={1}
        position={[40, 10, 0]}
        target-position={[40, 5, 0]}
      />
      <ambientLight intensity={2} />

      <mesh
        ref={cylinderRef}
        position={[SZ_FRONT, 3, SZ_SIDE]}
        rotation={[0, 110 * (180 / Math.PI), 0]}>
        <cylinderGeometry args={[SZ_WIDTH, SZ_WIDTH, SZ_HEIGHT, 6, 1]} />
        <lineBasicMaterial
          transparent
          opacity={0.2}
          color={"black"}
          wireframe
        />
      </mesh>
      <primitive object={Ball.scene} />
      {selectMeshs}
      {!playing && (
        <mesh
          position={[0, 3, 9]}
          scale={[0.5, 0.5, 0.5]}
          onClick={() => setPlaying(true)}>
          <boxGeometry />
          <lineBasicMaterial
            transparent
            opacity={0.2}
            color={"black"}
            wireframe
          />
        </mesh>
      )}
    </>
  );
};

export default Baseball;
