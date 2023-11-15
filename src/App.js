import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  VictoryPolarAxis,
  VictoryChart,
  VictoryBar,
  VictoryLine,
  VictoryScatter,
  VictoryGroup,
  VictoryAxis,
  VictoryLabel,
  VictoryPie,
} from "victory";
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
import { Canvas } from "@react-three/fiber";
import Coat3D from "./Coat3D.jsx";
import MyElement3D from "./MyElement3D.jsx";

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
      gender: "M",

      rallySeq: 2,
      homeScore: 0,
      awayScore: 0,
      teamId: "KRPMEQ01",
      teamName: "삼성화재",
      mainAction: "a",
      locationX: 84.95,
      locationY: 30.0,
      createdTime: 1697522445356,
    },
    {
      competitionCode: "2324PL2",
      gender: "M",

      rallySeq: 2,
      homeScore: 0,
      awayScore: 0,
      teamId: "KRPMAM01",
      teamName: "우리카드",
      mainAction: "f",
      locationX: 24.95,
      locationY: 26.89,
      createdTime: 1697522445363,
    },
    {
      competitionCode: "2324PL2",
      gender: "M",

      rallySeq: 2,
      homeScore: 0,
      awayScore: 0,
      teamId: "KRPMAM01",
      teamName: "우리카드",
      mainAction: "s",
      locationX: 37.33,
      locationY: 54.67,
      createdTime: 1697522445370,
    },
    {
      competitionCode: "2324PL2",
      gender: "M",

      rallySeq: 2,
      homeScore: 0,
      awayScore: 0,
      teamId: "KRPMAM01",
      teamName: "우리카드",
      mainAction: "q",
      locationX: 37.24,
      locationY: 88.89,
      createdTime: 1697522445377,
    },
    {
      competitionCode: "2324PL2",
      gender: "M",

      rallySeq: 2,
      homeScore: 0,
      awayScore: 0,
      teamId: "KRPMEQ01",
      teamName: "삼성화재",
      mainAction: "d",
      locationX: 73.43,
      locationY: 17.78,
      createdTime: 1697522445383,
    },
    {
      competitionCode: "2324PL2",
      gender: "M",

      rallySeq: 2,
      homeScore: 0,
      awayScore: 0,
      teamId: "KRPMEQ01",
      teamName: "삼성화재",
      mainAction: "s",
      locationX: 73.33,
      locationY: 71.56,
      createdTime: 1697522445390,
    },
    {
      competitionCode: "2324PL2",
      gender: "M",

      rallySeq: 2,
      homeScore: 0,
      awayScore: 0,
      teamId: "KRPMEQ01",
      teamName: "삼성화재",
      mainAction: "q",
      locationX: 65.81,
      locationY: 13.56,
      createdTime: 1697522445397,
    },
    {
      competitionCode: "2324PL2",
      gender: "M",

      rallySeq: 2,
      homeScore: 1,
      awayScore: 0,
      teamId: "KRPMAM01",
      teamName: "우리카드",
      mainAction: "x+",
      locationX: 48.57,
      locationY: 15.78,
      createdTime: 1697522445406,
    },
    {
      competitionCode: "2324PL2",
      gender: "M",

      rallySeq: 2,
      homeScore: 0,
      awayScore: 0,
      teamId: "KRPMEQ01",
      teamName: "삼성화재",
      mainAction: "N+",
      locationX: 54.76,
      locationY: 20.22,
      createdTime: 1697522445413,
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

  const indistatsData =
    dummy.find(
      i =>
        i?.indiStatsId?.participantName === "마테이" &&
        i?.indiStatsId?.setNum === 0
    ) || {};

  const pie = chartCategory.map(i => ({
    label: i.codeName,
    value: indistatsData[i.code],
  }));

  // const lineObject = {1:10,2:}

  const colorScale = [
    "#056AA4",
    "#999273",
    "#FF3636",
    "#FEC669",
    "#102A86",
    "#C0CC66",
    "pink",
    "yellow",
  ];

  const multiData = [
    {
      data: [
        { label: "총 득점", value: 1 },
        { label: "공격 효율", value: 4 },
        { label: "서브 효율", value: 2 },
        { label: "세트 효율", value: 5 },
        { label: "리시브 효율", value: 7 },
        { label: "디그 효율", value: 6 },
        { label: "블로킹 효율", value: 2 },
        { label: "범실 합", value: 4 },
      ],
      lineColor: "#FF3636",
      innerColor: "#FF363633",
    },

    {
      data: [
        { label: "총 득점", value: 5 },
        { label: "공격 효율", value: 2 },
        { label: "서브 효율", value: 6 },
        { label: "세트 효율", value: 2 },
        { label: "리시브 효율", value: 9 },
        { label: "디그 효율", value: 10 },
        { label: "블로킹 효율", value: 6 },
        { label: "범실 합", value: 4 },
      ],
      lineColor: "#056AA4",
      innerColor: "#056AA433",
    },
  ];

  const points = useMemo(() => {
    const scatterData = [];
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * 10;
      const y = Math.random() * 10;
      let data = {
        x,
        y,
        select: Math.random() * 10 > 9,
      };
      scatterData.push(data);
    }
    return scatterData;
  }, []);

  const barDatas = useMemo(() => {
    let arr = [];
    for (let i = 1; i <= 100; i++) {
      arr.push(i);
    }
    return arr;
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
      {/* <Canvas>
        <Coat3D />
        <MyElement3D />
      </Canvas> */}
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          position: "relative",
        }}>
        <Button
          onClick={() => {
            setHeatmapPlay(true);
            setData(dataPoints);
          }}>
          Button
        </Button>
        <Button
          onClick={() => {
            setHeatmapCount(0);
            setHeatmapPlay(false);
            setData([]);
            setSecondData([]);
            secondsetHeatmapCount(0);
            secondsetHeatmapPlay(false);
          }}>
          reset
        </Button>

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
            intensityExtractor={m => changeCound(heatmapCount)}
          />
          {secondheatmapCount && (
            <HeatmapLayer
              points={secondData}
              longitudeExtractor={m => m.coordinates[0]}
              latitudeExtractor={m => m.coordinates[1]}
              intensityExtractor={m => changeCound(secondheatmapCount)}
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
        }}>
        <Button onClick={() => setPlay(!play)}>play</Button>
        <Button
          onClick={() => {
            setPlay(false);
            setCount(0);
            setView(false);
            setSpread(false);
          }}>
          reset
        </Button>
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
      </div>
      {/* <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          position: "relative",
        }}>
        <div style={{ width: "500px" }}>
          <CommonMultiCircleChart dataList={multiData} />
        </div>

        <div style={{ backgroundColor: "#F3F6F8" }}>
          <CommonSimilarityChart
            data={pie}
            colorScale={colorScale}
            maxima={100}
          />
        </div>
        <div>
          {
            <CommonScatterChart
              dataList={scatterData}
              // yLabel={"yLabel"}
              // xLabel={"xLabel"}
            />
          }
        </div>
      </div>
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          position: "relative",
          // backgroundColor: "#d9d9d9",
        }}>
        <CommonCircle value={60} />

        <div>
          <VictoryChart height={500}>
            <VictoryAxis
              domain={{ x: [0, 100] }}
              tickFormat={() => ""}
              style={{ axis: { stroke: "none" } }}
            />
            <VictoryAxis
              dependentAxis
              domain={{ y: [-100, 100] }}
              style={{ axis: { stroke: "none" } }}
            />
            <VictoryBar
              barWidth={5}
              data={barDatas}
              domain={{ x: [0, 100], y: [-100, 100] }}
              y={d =>
                d < 90
                  ? (((d * Math.random()) % 10) % 2) * 50
                  : -(((d * Math.random()) % 10) % 2) * 10
              }
              style={{
                data: {
                  fill: ({ datum }) => (datum._y > 0 ? "green" : "red"),
                },
              }}
            />
          </VictoryChart>
          <VictoryChart>
            <VictoryAxis
              tickFormat={() => ""}
              dependentAxis
              style={{ axis: { stroke: "none" } }}
            />

            <VictoryBar
              horizontal
              style={{
                data: { fill: "#c43a31" },
              }}
              labels={({ datum }) => datum.y}
              data={[
                { x: "a", y: 2 },
                { x: "b", y: 2 },
                { x: "c", y: 3 },
              ]}
            />
            <VictoryAxis
              style={{
                ticks: { stroke: "none", size: -120 },
                tickLabels: { stroke: "white" },
              }}
            />
          </VictoryChart>
        </div>
      </div> */}
    </>
  );
};

export default App;

const CommonCircleChart = ({ data, lineColor, innerColor }) => {
  const highlightIndex = {};
  const graphData = data.map((item, index) => {
    if (item.hightlight) {
      highlightIndex[index] = true;
    }
    return {
      x: item.label,
      y: item.value,
    };
  });

  return (
    <VictoryChart polar domain={{ y: [0, 10] }}>
      <VictoryPolarAxis
        labelPlacement="vertical"
        style={{
          axis: { stroke: "none", fill: "#F3F6F8" },
          tickLabels: {
            fontSize: "12px",
            fontWeight: d => highlightIndex[d.index] && "700",
          },
        }}
      />
      {graphData.map((_, index) => {
        const axisAngle = Number((360 / graphData.length) * (index + 1));

        return (
          <VictoryPolarAxis
            key={`${index}axisKey`}
            dependentAxis
            axisAngle={axisAngle}
            style={{
              axis: { stroke: "white", strokeWidth: 4 },
            }}
            tickFormat={() => null}
          />
        );
      })}
      <VictoryLine
        data={graphData}
        style={{
          data: {
            stroke: lineColor || "#FF3636",
            fill: innerColor || "#FF363633",
            strokeWidth: 1,
          },
        }}
      />
      <VictoryScatter
        data={graphData}
        size={3}
        style={{
          data: { fill: lineColor || "#FF3636" },
        }}
      />
    </VictoryChart>
  );
};

const CommonMultiCircleChart = ({ dataList = [], maxima }) => {
  const axisData = dataList?.[0]?.data || [];

  return (
    <VictoryChart polar domain={maxima && { y: [0, maxima] }}>
      <VictoryPolarAxis
        labelPlacement="vertical"
        style={{
          axis: { stroke: "none", fill: "#F3F6F8" },
          tickLabels: {
            fontSize: "12px",
            // fontWeight: d => highlightIndex[d.index] && "700",
          },
        }}
      />
      {axisData.map((_, index) => {
        const axisAngle = Number((360 / axisData.length) * (index + 1));

        return (
          <VictoryPolarAxis
            key={`${index}axisKey`}
            dependentAxis
            axisAngle={axisAngle}
            style={{
              axis: { stroke: "white", strokeWidth: 4 },
            }}
            tickFormat={() => null}
          />
        );
      })}
      {dataList.map((item, index) => {
        const graphData = item.data.map(i => ({
          x: i?.label,
          y: i?.value,
        }));
        const lineColor = item.lineColor;
        const innerColor = item.innerColor;

        return (
          <VictoryGroup key={`${index}lineKey`}>
            <VictoryLine
              data={graphData}
              style={{
                data: {
                  stroke: lineColor || "#FF3636",
                  fill: innerColor || "#FF363633",
                  strokeWidth: 1,
                },
              }}
            />
            <VictoryScatter
              data={graphData}
              size={3}
              style={{
                data: { fill: lineColor || "#FF3636" },
              }}
            />
          </VictoryGroup>
        );
      })}
    </VictoryChart>
  );
};

const CommonSimilarityChart = ({ data, colorScale, maxima }) => {
  return (
    <VictoryChart polar domain={maxima && { y: [0, maxima] }}>
      <VictoryPolarAxis
        labelPlacement="vertical"
        style={{ axis: { fill: "white", stroke: "none" } }}
      />

      <VictoryBar
        polar
        data={data.map(i => ({ x: i.label, y: i.value }))}
        style={{
          data: {
            fill: ({ index }) => colorScale[index],
          },
        }}
      />
      {data.map((_, index) => {
        const axisAngle = Number((360 / data.length) * (index + 1));

        return (
          <VictoryPolarAxis
            key={`${index}axisKey`}
            dependentAxis
            axisAngle={axisAngle - 180 / data.length}
            style={{
              axis: { stroke: "#F3F6F8", strokeWidth: 3 },
            }}
            tickFormat={() => null}
          />
        );
      })}
    </VictoryChart>
  );
};

const CommonScatterChart = ({ dataList, yLabel, xLabel, xDomain, yDomain }) => {
  const selectPoints = dataList.filter(i => i.select);
  const commonPoints = dataList.filter(i => !i.select);

  return (
    <VictoryChart>
      <VictoryAxis
        label={xLabel || ""}
        axisLabelComponent={<VictoryLabel angle={360} dx={200} />}
        domain={xDomain}
        style={{ axis: { stroke: "#9A9C9F" } }}
      />
      <VictoryAxis
        dependentAxis
        domain={yDomain}
        axisLabelComponent={<VictoryLabel angle={360} dy={-120} />}
        tickComponent={<VictoryLabel y={20} style={{ stroke: "red" }} />}
        label={yLabel || ""}
        style={{ axis: { stroke: "#9A9C9F" } }}
      />
      <VictoryGroup>
        {commonPoints.map((d, i) => (
          <VictoryScatter
            key={`${i}commonScatterKey`}
            size={4}
            data={[d]}
            style={{
              data: { fill: "#D3E5FF" },
            }}
          />
        ))}
        {selectPoints.map((d, i) => (
          <VictoryScatter
            key={`${i}selectPoints`}
            size={4}
            data={[d]}
            style={{
              data: { fill: d.select },
            }}
          />
        ))}
      </VictoryGroup>
    </VictoryChart>
  );
};

const CommonCircle = ({ value, color, suffix }) => {
  const pieData = [
    { x: 1, y: value || 0 },
    { x: 2, y: 100 - value || 0 },
  ];

  return (
    <div style={{ width: "100px", height: "100px", position: "relative" }}>
      <VictoryChart width={200} height={200}>
        <VictoryAxis
          tickFormat={() => ""}
          style={{ axis: { stroke: "none" } }}
        />
        <VictoryAxis
          tickFormat={() => ""}
          dependentAxis
          style={{ axis: { stroke: "none" } }}
        />
        <VictoryPie
          data={pieData}
          labels={() => ""}
          innerRadius={80}
          colorScale={[color || "red", "#F3F6F8"]}
          style={{ labels: { fontSize: "60px" } }}
        />
      </VictoryChart>
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          translate: "-50% -50%",
          fontSize: "12px",
          fontWeight: "700",
        }}>
        {value + (suffix || "%")}
      </div>
    </div>
  );
};

const Button = styled.div`
  width: 100px;
  height: 50px;
  margin: auto 50px;
  border-radius: 12px;
  background: #d9d9d9;
  border: none;
  cursor: pointer;
  outline: none;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 700;

  &:hover {
    opacity: 0.7;
  }
`;

const changeCound = count => {
  return count < 60 ? 0.05 * count : 3 - (count - 60) * 0.05;
};
