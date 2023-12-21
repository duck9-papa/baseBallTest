import React, { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

import { scatterData, secondDataPoints } from "./Data.js";

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
  const [data, setData] = useState([]);
  const [secondData, setSecondData] = useState([]);
  const [play, setPlay] = useState(false);
  const [count, setCount] = useState(0);
  const [view, setView] = useState(false);
  const [heatmapPlay, setHeatmapPlay] = useState(false);
  const [heatmapCount, setHeatmapCount] = useState(0);

  const [secondheatmapPlay, secondsetHeatmapPlay] = useState(false);
  const [secondheatmapCount, secondsetHeatmapCount] = useState(0);

  const [ballTeam, setBallTeam] = useState(null);
  const [spread, setSpread] = useState(false);
  const [dummy, setDummy] = useState([]);

  const chartCategory = [
    { code: "offenSuccessRate", codeName: "공격 성공률" },
    { code: "backSuccessRate", codeName: "후위 성공률" },
    { code: "cquickSuccessRate", codeName: "퀵오픈 성공률" },
    { code: "openSuccessRate", codeName: "오픈 성공률" },
    { code: "serveSuccessRate", codeName: "서브 성공률" },
  ];

  const location = [
    {
      competitionCode: "2324PL2",
      action: "serve",

      locationX: 84.95,
      locationY: 30.0,
    },
    {
      locationX: 24.95,
      locationY: 26.89,
    },
    {
      locationX: 37.33,
      locationY: 54.67,
    },
    {
      locationX: 37.24,
      locationY: 88.89,
    },
    {
      locationX: 73.43,
      locationY: 17.78,
    },
    {
      locationX: 73.33,
      locationY: 71.56,
    },
    {
      locationX: 65.81,
      locationY: 13.56,
    },
    {
      locationX: 48.57,
      locationY: 15.78,
    },
    {
      locationX: 54.76,
      locationY: 20.22,
    },
  ];

  useEffect(() => {
    try {
      if (location[count].locationX < 50) {
        setBallTeam("home");
      } else {
        setBallTeam("away");
      }
    } finally {
      if (play && count < location.length - 1) {
        setTimeout(
          () => {
            setCount(count + 1);
          },
          count === 0 ? 3000 : 2000
        );
      }
      if (count === location.length - 1) {
        setView(true);
      }
    }
  }, [play, count]);

  useEffect(() => {
    if (play && !count) {
      setTimeout(() => {
        setSpread(true);
      }, 2000);
    }
    if (count) {
      setSpread(false);
      setTimeout(
        () => {
          setSpread(true);
        },
        count === 0 ? 2000 : 1200
      );
    }
  }, [count, play]);

  useEffect(() => {
    const indistats = async () => {
      const data = await axios
        .post("http://223.130.136.167:8080/api/stats/selectindistatslist", {
          indiStatsId: { gameCode: "2324PL2M003" },
        })
        .then(r => r.data.data);

      setDummy(data);
    };
    indistats();
  }, []);

  useEffect(() => {
    if (heatmapPlay && heatmapCount < 120) {
      setTimeout(() => {
        setHeatmapCount(pre => pre + 1);
      }, 50);
    }
    if (heatmapCount >= 60) {
      setSecondData(secondDataPoints);
      secondsetHeatmapPlay(true);
    }
  }, [heatmapCount, heatmapPlay]);

  useEffect(() => {
    if (secondheatmapPlay && secondheatmapCount < 60) {
      setTimeout(() => {
        secondsetHeatmapCount(pre => pre + 1);
      }, 50);
    }
  }, [secondheatmapPlay, secondheatmapCount]);

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
          width: "1200px",
          height: "600px",
          margin: "auto",
          border: "1px solid black",
        }}>
        <Canvas camera={{ fov: 60, far: 80, position: [-20, 25, 10] }}>
          <Coat3D />
          <AnimationElement />
        </Canvas>
      </div>
      {/* <div
        style={{
          width: "1200px",
          height: "600px",
          margin: "auto",
          border: "1px solid black",
        }}>
        <ThreeObject />
      </div> */}
      {/* <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          position: "relative",
        }}>
        <
        

          onClick={() => {
            setHeatmapPlay(true);
            setData(dataPoints);
          }}>
          button
        </button>
        <button
          onClick={() => {
            setHeatmapCount(0);
            setHeatmapPlay(false);
            setData([]);
            setSecondData([]);
            secondsetHeatmapCount(0);
            secondsetHeatmapPlay(false);
          }}>
          reset
        </button>

        <Map
          className="map-container"
          crs={L.CRS.Simple}
          bounds={bounds}
          maxZoom={5}
          draggable={false}
          dragging={false}
          doubleClickZoom={false}
          tab={false}
          scrollWheelZoom={false}
          keyboard={false}
          attributionControl={false}
          zoomControl={false}>
          <HeatmapLayer
            points={data}
            longitudeExtractor={m => m.coordinates[0]}
            latitudeExtractor={m => m.coordinates[1]}
            intensityExtractor={m => 3}
          />
          {secondheatmapCount && (
            <HeatmapLayer
              points={secondData}
              longitudeExtractor={m => m.coordinates[0]}
              latitudeExtractor={m => m.coordinates[1]}
              intensityExtractor={m => 3}
            />
          )}

          <ImageOverlay url={require("./히트맵코트.png")} bounds={bounds} />
        </Map>
      </div>
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          position: "relative",
          marginTop: "100px",
        }}>
        <button onClick={() => setPlay(!play)}>play</button>
        <button
          onClick={() => {
            setPlay(false);
            setCount(0);
            setView(false);
            setSpread(false);
          }}>
          reset
        </button>
        <div
          style={{
            width: "1050px",
            height: "450px",
            position: "relative",
          }}>
          <BallContainer
            play={play}
            action={location[count]?.action}
            locationX={location[count]?.locationX}
            locationY={location[count]?.locationY}
            targetX={location?.[count + 1]?.locationX}
            targetY={location?.[count + 1]?.locationY}>
            {spread && (
              <>
                <SpreadInnerCircle count={count} location={location} />
                <SpreadOutterCircle count={count} location={location} />
              </>
            )}
            <Ball />
            {view && (
              <InfoContainer>
                <InfoRightContainer>
                  <span>한성정</span>
                  <span>블로킹 성공</span>
                </InfoRightContainer>
              </InfoContainer>
            )}
          </BallContainer>
          <img draggable="false" src="/images/히트맵코트.png" alt="base" />
        </div>
      </div> */}
    </>
  );
};

export default App;
