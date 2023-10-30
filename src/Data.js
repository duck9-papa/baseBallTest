export const dataPoints = [];
for (let i = 0; i < 700; i++) {
  const x = Math.ceil(Math.random() * 150);
  const y = Math.ceil(Math.random() * 100);
  let data = {
    coordinates: [x, y],
  };
  if (x < 75 && x > 50) {
    if (data.coordinates[1] > 30 && data.coordinates[1] < 70) {
      if (Math.ceil(Math.random() * 100) > 50) {
        dataPoints.push(data);
      }
    } else {
      dataPoints.push(data);
    }
  }
}
