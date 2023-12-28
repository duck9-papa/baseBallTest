import { Line, OrbitControls, useGLTF, useHelper } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useControls } from "leva";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

const LINE_NB_POINTS = 42;
const basePosition = [40, 5, 0];
const initialPoints = [
  new THREE.Vector3(...basePosition),
  new THREE.Vector3(...basePosition),
];

const Baseball = ({ position = [10, 0, -20] }) => {
  const refMesh = useRef();
  const cylinderRef = useRef();
  const [orbitHeight, setOrbitHeight] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [points, setPoints] = useState(initialPoints);
  const [radius, setRadius] = useState(0);

  const { cameraX, cameraY, cameraZ, targetX, targetY, targetZ } = useControls({
    cameraX: { value: -5, max: 10, min: -10, step: 0.01 },
    cameraY: { value: 5, max: 10, min: -10, step: 0.01 },
    cameraZ: { value: 10, max: 10, min: -10, step: 0.01 },
    targetX: { value: 0, max: 10, min: -10, step: 0.01 },
    targetY: { value: 5, max: 10, min: -10, step: 0.01 },
    targetZ: { value: 0, max: 10, min: -10, step: 0.01 },
  });

  const Ball = useGLTF("/models/baseball.glb");

  useFrame((_, delta) => {
    camera.lookAt(targetX, targetY, targetZ);
    camera.position.x = cameraX;
    camera.position.y = cameraY;
    camera.position.z = cameraZ;
    Ball.scene.rotateY(delta * 2);
    if (playing) {
      const [currentX, currentY, currentZ] = basePosition;
      const [nextX, nextY, nextZ] = [1, 5.5, 0];
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

      const xValue = Number(
        `${!xCheck ? "-" : "+"}${delta * 16 * xCoefficient}`
      );
      const yValue = Number(
        `${!yCheck ? "-" : "+"}${delta * 16 * yCoefficient}`
      );
      const zValue = Number(
        `${!zCheck ? "-" : "+"}${delta * 16 * zCoefficient}`
      );

      if (
        (xCheck && Ball.scene.position.x >= nextX) ||
        (!xCheck && Ball.scene.position.x <= nextX)
        //   &&
        // ((yCheck && Ball.scene.position.y >= nextY) ||
        //   (!yCheck && Ball.scene.position.y <= nextY)) &&
        // ((zCheck && Ball.scene.position.z >= nextZ) ||
        //   (!zCheck && Ball.scene.position.z <= nextZ))
      ) {
        setTimeout(() => {
          Ball.scene.position.x = basePosition[0];
          Ball.scene.position.y = basePosition[1];
          Ball.scene.position.z = basePosition[2];
          setPlaying(false);
          setPoints(initialPoints);
        }, 1000);
      } else {
        const randomX = Math.random() * delta * 4;
        const randomY = Number(
          (Math.random() < 0.5 ? "-" : "+") + Math.random() * delta * 4
        );
        const randomZ = Number(
          (Math.random() < 0.5 ? "-" : "+") + Math.random() * delta * 4
        );

        // Ball.scene.position.x += xValue;
        // Ball.scene.position.y += yValue;
        // Ball.scene.position.z += zValue;
        Ball.scene.position.x += xValue;
        Ball.scene.position.y += randomY;
        Ball.scene.position.z += randomZ;
        setPoints(pre => [
          ...pre,
          new THREE.Vector3(
            Ball.scene.position.x + xValue,
            Ball.scene.position.y + randomY + 0.5,
            Ball.scene.position.z + randomZ
          ),
        ]);
      }
    }
  });

  console.log(radius);

  const { camera } = useThree();
  useEffect(() => {
    Ball.scene.position.x = 40;
    Ball.scene.position.y = 5;
    Ball.scene.position.z = 0;

    Ball.scene.scale.x = 0.01;
    Ball.scene.scale.y = 0.01;
    Ball.scene.scale.z = 0.01;
    Ball.scene.receiveShadow = false;
    Ball.scene.castShadow = true;

    Ball.scene.traverse(item => {
      if (item.isMesh) {
        const geomBbox = item.geometry.boundingBox;
        const max = geomBbox.max;
        const min = geomBbox.min;

        setRadius(Math.abs(max.y - min.y) / 2);
      }
    });
  }, [Ball.scene]);

  const { scene } = useThree();
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
      return curve.getPoints(500);
    }, [curve]) || [];

  return (
    <>
      <Line
        points={linePoints}
        color={"#2C36E3"}
        opacity={1}
        transparent
        lineWidth={30}
      />
      <directionalLight
        ref={refMesh}
        intensity={1}
        position={[40, 10, 0]}
        target-position={[40, 5, 0]}
      />
      <ambientLight intensity={0.5} />
      {/* {orbitHeight && (
        <mesh position={[40, 5, 0]} rotation={[0, 0, 120 * (180 / Math.PI)]}>
          <cylinderGeometry args={[1, 1, orbitHeight, 32, 32]} />
          <meshBasicMaterial transparent opacity={0.5} color={"blue"} />
        </mesh>
      )} */}
      <mesh
        ref={cylinderRef}
        position={[0, 5, 0]}
        rotation={[0, 135 * (180 / Math.PI), 0]}>
        <cylinderGeometry args={[1, 1, 2, 5, 1]} />
        <lineBasicMaterial
          transparent
          opacity={0.2}
          color={"white"}
          wireframe
        />
      </mesh>
      <primitive object={Ball.scene} />
      {!playing && (
        <mesh
          position={[0, 5, 5]}
          scale={[0.5, 0.5, 0.5]}
          onClick={() => setPlaying(true)}>
          <boxGeometry />
          <meshBasicMaterial />
        </mesh>
      )}
    </>
  );
};

export default Baseball;
