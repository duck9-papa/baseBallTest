export const dataPoints = [];
for (let i = 0; i < 200; i++) {
  const x = Math.ceil(Math.random() * 150);
  const y = Math.ceil(Math.random() * 100);
  let data = {
    coordinates: [x, y],
  };
  if (x < 75 && x > 50) {
    if (data.coordinates[1] > 0 && data.coordinates[1] < 50) {
      if (Math.ceil(Math.random() * 100) > 70) {
        dataPoints.push(data);
      }
    } else {
      dataPoints.push(data);
    }
  }
}

export const secondDataPoints = [];
for (let i = 0; i < 500; i++) {
  const x = Math.ceil(Math.random() * 150);
  const y = Math.ceil(Math.random() * 100);
  let data = {
    coordinates: [x, y],
  };
  if (x < 75 && x > 50) {
    if (data.coordinates[1] > 50 && data.coordinates[1] < 100) {
      if (Math.ceil(Math.random() * 100) > 70) {
        secondDataPoints.push(data);
      }
    } else {
      secondDataPoints.push(data);
    }
  }
}

export const scatterData = [];
for (let i = 0; i < 500; i++) {
  const x = Math.random() * 10;
  const y = Math.random() * 10;
  let data = {
    x,
    y,
    select:
      Math.random() * 10 > 9 ? "red" : Math.random() * 10 < 1 ? "yellow" : null,
  };

  scatterData.push(data);
}
