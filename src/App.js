// import { useMemo } from "react";
// import "./App.css";
// import { styled } from "styled-components";
// import { useRef } from "react";
// import { useEffect } from "react";
// import { Map, Marker, Popup, TileLayer } from "react-leaflet";

// function App() {
//   const dummyHeatmapPoint = useMemo(() => {
//     let dummy = [];
//     for (let i = 0; i < 20000; i++) {
//       const locationX = Number((Math.random() * 100).toFixed(1));
//       const locationY = Number((Math.random() * 100).toFixed(1));
//       // if (locationX < 50) {
//       if (
//         locationX > 20 &&
//         locationX < 80 &&
//         locationY > 20 &&
//         locationY < 90
//       ) {
//         dummy.push({
//           locationX,
//           locationY,
//         });
//       }
//       // }
//     }
//     return dummy;
//   }, []);
//   const base = 8;

//   const searchPoint = useMemo(() => {
//     let data = [];
//     for (let i = 1; i <= 400; i++) {
//       let x = i;
//       let y = Math.ceil(i / 20);
//       if (x > 20) {
//         while (x > 20) {
//           x = x - 20;
//         }
//       }

//       data.push({
//         x,
//         y,
//         count: dummyHeatmapPoint.filter(j => {
//           const xCheck = j.locationX >= (x - 1) * 5 && j.locationX <= x * 5;
//           const yCheck = j.locationY >= (y - 1) * 5 && j.locationY <= y * 5;
//           if (xCheck && yCheck) {
//             return j;
//           }
//         }).length,
//       });
//     }
//     return data;
//   }, [dummyHeatmapPoint]);

//   const maxima = useMemo(
//     () => Math.max(...searchPoint.map(i => i.count)),
//     [searchPoint]
//   );

//   const circles = [
//     {
//       cx: 0,
//       cy: 50,
//       r: 50,
//     },
//     {
//       cx: 300,
//       cy: 300,
//       r: 50,
//     },
//     {
//       cx: 250,
//       cy: 450,
//       r: 50,
//     },
//     {
//       cx: 500,
//       cy: 450,
//       r: 50,
//     },
//   ];

//   const circles2 = [
//     {
//       cx: 110,
//       cy: 150,
//       r: 90,
//     },

//     {
//       cx: 250,
//       cy: 450,
//       r: 60,
//     },
//     {
//       cx: 200,
//       cy: 300,
//       r: 60,
//     },
//   ];
//   const metaBallData = useMemo(() => {
//     //
//     let arr = [];
//   }, [searchPoint]);

//   const metaballRef = useRef();
//   useEffect(() => {
//     const metaballObject = metaballRef.current;
//     if (metaballObject) {
//       const container = document.getElementById("metaballContainer");
//       const svg = container.getElementsByTagName("svg")[0];
//       const gradient = document.createElement("defs");
//       const radialGradient = document.createElement("radialGradient");
//       radialGradient.setAttribute("id", "yr");
//       radialGradient.setAttribute("cx", "50%");
//       radialGradient.setAttribute("cy", "50%");
//       radialGradient.setAttribute("r", "50%");
//       radialGradient.setAttribute("fx", "50%");
//       radialGradient.setAttribute("fy", "20%");

//       const stop1 = document.createElement("stop");
//       stop1.setAttribute("offset", "0%");
//       stop1.setAttribute("stop-color", "#ffc054");

//       const stop2 = document.createElement("stop");

//       stop1.setAttribute("offset", "100%");
//       stop1.setAttribute("stop-color", "#ff614b");

//       radialGradient.append(stop1, stop2);
//       gradient.append(radialGradient);
//       console.log(gradient);

//       // svg.append(gradient);
//       svg.insertBefore(gradient, svg.firstChild);
//       const id =
//         metaballRef?.current?._reactInternals?.child?.child?.child?.child
//           ?.memoizedProps?.id;

//       const metaball = document.getElementById(id);
//       metaball.setAttribute("fill", "red");
//     }
//   }, []);

//   return (
//     <>
//       <div></div>
//       <div
//         style={{
//           width: "100%",
//           height: "800px",
//           display: "flex",
//           justifyContent: "center",
//           alignItems: "center",
//           position: "relative",
//           // backdropFilter: "blur(5px)",
//         }}>
//         <div
//           id="metaballContainer"
//           style={{
//             width: "1050px",
//             height: "450px",
//             position: "relative",

//             // backdropFilter: "blur(5px)",
//           }}>
//           <img src="/images/히트맵코트.png" />

//           {/* {searchPoint.map((d, i) => {
//             const count = d.y < 15 && d.y > 9 ? d.count / 2 : d.count;

//             if (d.count && d.x > base && d.x < base + 3)
//               return (
//                 <div
//                   key={i}
//                   style={{
//                     position: "absolute",
//                     width: `${30 + d.count * 1}px`,
//                     height: `${30 + d.count * 1}px`,
//                     left: `${d.x * 5}%`,
//                     top: `${d.y * 5}%`,
//                     translate: "-100% -100%",
//                     borderRadius: "50%",
//                     backgroundColor: `rgba(${((count / maxima) * 255).toFixed(
//                       0
//                     )}, 56, 102, ${((count / maxima) * 1.5).toFixed(1)})`,
//                     opacity: count / (maxima * 1.3),
//                     backdropFilter: "blur(5px)",
//                   }}
//                 />
//               );
//             return;
//           })} */}
//         </div>
//       </div>
//     </>
//   );
// }

// export default App;

import React, { useEffect, useState } from "react";
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
`;

const InfoContainer = styled.div`
  position: absolute;
  left: 30px;
  border: 1px solid black;
  display: flex;

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
    if (play && count < location.length - 1) {
      setTimeout(
        () => {
          setCount(count + 1);
        },
        count === 0 ? 2000 : 1200
      );
    }
    if (count === location.length - 1) {
      setView(true);
    }
  }, [play, count]);

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
