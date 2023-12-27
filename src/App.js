import React, { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

import { scatterData, secondDataPoints } from "./Data.js";
import dummyArr from "./dummyHeatmap.jsx";
import L from "leaflet";
import HeatmapLayer from "react-leaflet-heatmap-layer";
import { Map, ImageOverlay } from "react-leaflet";
import "./App.css";
import { dataPoints } from "./Data.js";
import "leaflet/dist/leaflet.css";
import { styled, keyframes } from "styled-components";

import { FaVolleyballBall } from "react-icons/fa";
import axios from "axios";

import ThreeObject from "./Three";
import { Canvas, Camera, useThree } from "@react-three/fiber";
import Coat3D from "./Coat3D.jsx";
import MyElement3D from "./MyElement3D.jsx";
import AnimationElement from "./Components/AnimationElement.jsx";
import AnimationCoat from "./AnimationCoat.jsx";

const showView = keyframes`
from{
transform: scaleY(0);
}
to{
  transform: scaleY(1);
}
`;

const moveServe = (locationX, locationY, targetX, targetY) => keyframes`

0%{scale:1}

10%{
  scale:0.5
}
20%{scale:1}
30%{
  scale:0.5
}
40%{scale:1}

70%{
  left: ${locationX}%;
  top: ${locationY}%;
}

100%{
  left: ${targetX}%;
  top: ${targetY}%;
  
}

`;

const spreadBall = keyframes`
from{
scale: 0.5;
opacity: 0.5;
}to{
scale: 2.5;
opacity: 0;

}
`;

const moveBall = (locationX, locationY, targetX, targetY) => keyframes`
from{
  left: ${locationX}%;
  top: ${locationY}%;
}
to{
  left: ${targetX}%;
  top: ${targetY}%;
}
`;

const SpreadInnerCircle = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: white;
  opacity: 0.5;
  position: absolute;
  animation-name: ${p => (p.count < p.location.length ? spreadBall : null)};
  animation-duration: 0.5s;
  animation-timing-function: ease-out;
  animation-fill-mode: forwards;
`;
const SpreadOutterCircle = styled.div`
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background-color: white;
  opacity: 0.5;
  position: absolute;
  animation-name: ${p => (p.count < p.location.length ? spreadBall : null)};
  animation-duration: 0.5s;
  animation-timing-function: ease-out;
  animation-fill-mode: forwards;
`;

const BallContainer = styled.div`
  display: flex;
  position: relative;
  justify-content: center;
  align-items: center;
  background-color: white;
  width: 25px;
  height: 25px;
  border-radius: 50%;
  position: absolute;
  ${p => `left:${p.locationX || 0}%;top:${p.locationY || 0}%;`}
  translate: -50% -50%;
  animation-name: ${p => {
    if (p.play) {
      return p.action === "serve"
        ? moveServe(p.locationX, p.locationY, p.targetX, p.targetY)
        : moveBall(p.locationX, p.locationY, p.targetX, p.targetY);
    }
  }};
  animation-duration: ${p => (p.action === "serve" ? "1.8s" : "1s")};
  animation-timing-function: ease-out;
  animation-fill-mode: forwards;
`;

const Ball = styled(FaVolleyballBall)`
  width: 20px;
  height: 20px;
  z-index: 2;
`;

const InfoContainer = styled.div`
  position: absolute;
  left: 30px;
  border: 1px solid black;
  display: flex;
  z-index: 2;
  justify-content: space-evenly;
  align-items: center;
  width: 200px;
  height: 100px;
  background-color: white;
  border-radius: 12px;
  font-size: 12px;
  animation-name: ${p => showView};
  animation-duration: 0.5s;
  animation-timing-function: ease-out;
  animation-fill-mode: forwards;
`;

const InfoRightContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 10px;
`;

var bounds = [
  [100, 0],
  [0, 150],
];

const App = () => {
  const [select, setSelect] = useState(null);

  const [rally, setRally] = useState([]);
  const [playing, setPlaying] = useState(false);

  return (
    <>
      <div
        style={{
          width: "1200px",
          height: "600px",
          margin: "auto",
          border: "1px solid black",
        }}>
        <Canvas
          shadows
          frameloop="demand"
          camera={{
            fov: 60,
            far: 100,
            position: [-15, 15, 5],
          }}>
          <Coat3D position={[0, 0, 0]} />
          <MyElement3D />
        </Canvas>
      </div>
      <div
        style={{
          width: "1400px",
          height: "600px",
          margin: "auto",
          border: "1px solid black",
          display: "flex",
          flexDirection: "row",
          gap: "50px",
        }}>
        <div
          style={{
            width: "1200px",
            height: "100%",
          }}>
          <Canvas camera={{ fov: 60, far: 80, position: [-20, 25, 10] }}>
            <AnimationCoat />
            <AnimationElement
              playing={playing}
              setPlaying={setPlaying}
              rally={rally}
            />
          </Canvas>
        </div>
        <div
          style={{
            display: "flex",
            height: "100%",
            width: "150px",
            flexDirection: "column",
            overflowY: "scroll",
            overflowX: "hidden",
          }}>
          {dummyArr.map((item, index) => (
            <div
              style={{
                width: "100px",
                minHeight: "50px",
                border: "1px solid black",
                cursor: "pointer",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
                textAlign: "center",
                background: select === index ? "pink" : null,
              }}
              key={index}
              onClick={() => {
                if (!playing) {
                  setSelect(index);
                  setRally(item);
                }
              }}>
              <div>{index + 1}번 랠리</div>
              <div>{item.length} 액션</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ width: "1200px", height: "100px" }}></div>
    </>
  );
};

export default App;
