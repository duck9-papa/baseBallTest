import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import HeatmapLayer from "react-leaflet-heatmap-layer";
import { Map, ImageOverlay } from "react-leaflet";
import "./App.css";
import { dataPoints } from "./Data.js";
import "leaflet/dist/leaflet.css";
import { styled, keyframes } from "styled-components";

import { FaVolleyballBall } from "react-icons/fa";

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
}20%{scale:1}
30%{
  scale:0.5
}40%{scale:1}
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
  const [play, setPlay] = useState(false);
  const [count, setCount] = useState(0);
  const [view, setView] = useState(false);
  const [ctx, setCtx] = useState(null);
  const [ballTeam, setBallTeam] = useState(null);
  const [spread, setSpread] = useState(false);

  const location = [
    { locationX: 10, locationY: 20, action: "serve" },
    { locationX: 80, locationY: 90, action: "receieve" },
    { locationX: 70, locationY: 65, action: "receieve" },
    { locationX: 60, locationY: 50, action: "receieve" },
    { locationX: 30, locationY: 60, action: "receieve" },
    { locationX: 40, locationY: 20, action: "receieve" },
    { locationX: 80, locationY: 90, action: "receieve" },
    { locationX: 80, locationY: 90, action: "receieve" },
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
      if (count === location.length - 2) {
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

  const canvasRef = useRef();

  return (
    <>
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          position: "relative",
        }}>
        <button
          style={{ width: "50px", height: "20px", margin: "auto 0" }}
          onClick={() => setData(dataPoints)}>
          button
        </button>
        {/* <Navbar /> */}
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
          {/* <div className="map-coat">d</div> */}
          <ImageOverlay url={require("./히트맵코트.png")} bounds={bounds} />
        </Map>
      </div>
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          position: "relative",
        }}>
        <button
          style={{ width: "50px", height: "20px", margin: "auto 0" }}
          onClick={() => setPlay(!play)}>
          play
        </button>
        <button
          style={{ width: "50px", height: "20px", margin: "auto 0" }}
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
          <canvas
            ref={canvasRef}
            style={{ position: "absolute" }}
            width={1050}
            height={450}></canvas>
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
                <img
                  width={50}
                  height={80}
                  src="https://img3.daumcdn.net/thumb/R658x0.q70/?fname=https://t1.daumcdn.net/news/202301/25/ilgansports/20230125145548916lbul.jpg"
                />

                <InfoRightContainer>
                  <span>강소휘</span>
                  <span>디그 실패</span>
                </InfoRightContainer>
              </InfoContainer>
            )}
          </BallContainer>
          <img draggable="false" src="/images/히트맵코트.png" alt="base" />
        </div>
      </div>
    </>
  );
};
export default App;
