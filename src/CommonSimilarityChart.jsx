// react import
import { VictoryChart, VictoryPolarAxis, VictoryBar } from "victory";

/**
 *
 * @param data : Array of Object ( { label: string, value: number } )
 * @param colorScale : Array of string [string, ...]
 *
 */

const CommonSimilarityChart = ({ data, colorScale }) => {
  return (
    <VictoryChart polar>
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

export default CommonSimilarityChart;
