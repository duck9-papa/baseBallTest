import { Line, useGLTF, Tube, Text } from "@react-three/drei";
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
  const [previousTube, setPreviousTube] = useState(null);
  // 수식의 y축이 캔버스의 X축 수식의 Z축이 캔버스의 Y축 수식의X축이 캔버스의 Z축 [Y,Z,X] 형식으로 포지션 값 추가
  const dataPoints = useMemo(() => {
    let arr = [];
    for (let i = 50; i >= 0; i--) {
      const elapsedTime = TimeCalculator(dataRow, i);

      const xSpeed = VCalculator(dataRow.VX0, dataRow.AX, elapsedTime);
      const ySpeed = VCalculator(dataRow.VY0, dataRow.AY, elapsedTime);
      const zSpeed = VCalculator(dataRow.VZ0, dataRow.AZ, elapsedTime);

      const xValue = dataRow.X0 + xSpeed * elapsedTime;
      const yValue = dataRow.Y0 + ySpeed * elapsedTime;
      const zValue = dataRow.Z0 + zSpeed * elapsedTime;
      if (i > 30) {
        console.log(i, dataRow.Z0, zSpeed * elapsedTime, zValue);
      }
      arr.push([i, zValue, xValue]);
    }
    return arr;
  }, [dataRow, TimeCalculator]);
  // console.log(dataPoints, dataRow);
  const { targetX, targetY, targetZ, SZ_WIDTH, SZ_FRONT, SZ_SIDE, BALL_SPEED } =
    useControls({
      targetX: { value: 0, max: 20, min: -20, step: 0.01 },
      targetY: { value: 5, max: 20, min: -20, step: 0.01 },
      targetZ: { value: 0, max: 20, min: -20, step: 0.01 },
      SZ_WIDTH: { value: 1.8, max: 3, min: 0.5, step: 0.01 },
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
        // console.log(xCheck, yCheck, zCheck);
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
          (xCheck && xValue >= nextX) || (!xCheck && xValue <= nextX)
            ? nextX
            : xValue;
        const yPosition =
          (yCheck && yValue >= nextX) || (!yCheck && yValue <= nextY)
            ? nextY
            : yValue;
        const zPosition =
          (zCheck && zValue >= nextZ) || (!zCheck && zValue <= nextZ)
            ? nextZ
            : zValue;

        if (
          (xCheck && xPosition >= nextX) ||
          (!xCheck &&
            xPosition <= nextX &&
            ((yCheck && yPosition >= nextY) ||
              (!yCheck && yPosition <= nextY)) &&
            ((zCheck && zPosition >= nextZ) || (!zCheck && zPosition <= nextZ)))
        ) {
          setCount(pre => pre + 1);
          setPoints(pre => {
            const value = [
              ...pre,
              new THREE.Vector3(nextX, nextY + 0.5, nextZ),
            ];
            if (previousTube) {
              scene.remove(previousTube);
            }

            const path = new THREE.CatmullRomCurve3(value);
            const tubeGeometry = new THREE.TubeGeometry(
              path,
              value.length,
              0.8,
              10,
              false
            );
            const material = new THREE.MeshStandardMaterial({
              color: "white",
              transparent: true,
              opacity: 0.5,
              wireframe: true,
            });
            const mesh = new THREE.Mesh(tubeGeometry, material);
            scene.add(mesh);
            setPreviousTube(mesh);
            return value;
          });
          Ball.scene.position.x = nextX;
          Ball.scene.position.y = nextY;
          Ball.scene.position.z = nextZ;
        } else {
          Ball.scene.position.x = xValue;
          Ball.scene.position.y = yValue;
          Ball.scene.position.z = zValue;
        }
      } else {
        setTimeout(() => {
          if (previousTube) {
            scene.remove(previousTube);
          }
          setCount(0);
          setPoints(initialPoints);
          setPlaying(false);
          setPreviousTube(null);
          Ball.scene.position.x = basePosition[0];
          Ball.scene.position.y = basePosition[1];
          Ball.scene.position.z = basePosition[2];
        }, 500);
      }
    }
  });

  const { camera, scene } = useThree();
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

  useEffect(() => {
    const keyEvent = e => {
      switch (e.code) {
        case "ArrowRight":
          if (!playing) {
            setSelect(pre => (pre === data.length ? 1 : pre + 1));
          }

          break;
        case "ArrowLeft":
          if (!playing) {
            setSelect(pre => (pre === 1 ? data.length : pre - 1));
          }
          break;
        case "Space":
          if (!playing) {
            setPlaying(true);
          }
      }
    };

    document.addEventListener("keydown", keyEvent);

    return () => document.removeEventListener("keydown", keyEvent);
  }, [playing, data]);

  return (
    <>
      {/* <Line points={linePoints} color={"#0095d3"} lineWidth={30} /> */}

      <directionalLight
        ref={refMesh}
        intensity={1}
        position={[40, 10, 0]}
        target-position={[40, 5, 0]}
      />
      <ambientLight intensity={2} />

      <mesh ref={cylinderRef} position={[SZ_FRONT, 3, SZ_SIDE]}>
        <boxGeometry args={[SZ_WIDTH, SZ_HEIGHT, SZ_WIDTH]} />
        <lineBasicMaterial
          color={"black"}
          wireframe
          transparent
          opacity={0.3}
        />
      </mesh>

      <mesh position={[SZ_FRONT, 3, SZ_SIDE]}>
        <boxGeometry args={[SZ_WIDTH, SZ_HEIGHT, SZ_WIDTH]} />

        <meshStandardMaterial transparent opacity={0.5} color={"white"} />
      </mesh>

      <primitive object={Ball.scene} />
      <Text
        rotation={[0, 270 * (Math.PI / 180), 0]}
        position={[0, 5, 8]}
        onClick={() => {
          if (!playing) {
            setSelect(pre => (pre === 1 ? data.length : pre - 1));
          }
        }}>
        <meshBasicMaterial color={"black"} />
        {"<"}
      </Text>

      <Text rotation={[0, 270 * (Math.PI / 180), 0]} position={[0, 5, 9]}>
        <meshBasicMaterial color={"black"} />

        {select}
      </Text>
      <Text
        rotation={[0, 270 * (Math.PI / 180), 0]}
        position={[0, 5, 10]}
        onClick={() => {
          if (!playing) {
            setSelect(pre => (pre === data.length ? 1 : pre + 1));
          }
        }}>
        <meshBasicMaterial color={"black"} />

        {">"}
      </Text>
      {!playing && (
        <mesh
          position={[0, 3, 9]}
          scale={[1, 1, 1]}
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
