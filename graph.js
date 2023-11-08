const dimensions = { height: 300, width: 300, radius: 150 };
const center = { x: dimensions.width / 2 + 5, y: dimensions.height / 2 + 5 };
const svg = d3
  .select(".canvas")
  .append("svg")
  .attr("width", dimensions.width + 150)
  .attr("height", dimensions.height + 150);

const graph = svg
  .append("g")
  .attr("transform", `translate(${center.x}, ${center.y})`);

// creating the radian values for each item in the data
const pie = d3
  .pie()
  .sort(null)
  .value((d) => d.cost);

// creating the arc path (wedge) for each radian item that is created above
const arcPath = d3
  .arc()
  .outerRadius(dimensions.radius)
  .innerRadius(dimensions.radius / 2);

// adding ordinal scales to provide unique color for each category
const color = d3.scaleOrdinal(d3["schemeSet3"]);

// update function
const update = (data) => {
  //update color scale domain
  color.domain(data.map((d) => d.name));

  // join enhanced (pie) data to path elements
  const paths = graph.selectAll("path").data(pie(data));

  // handle the exit selection
  paths
    .exit()
    .transition()
    .duration(3000)
    .attrTween("d", arcTweenExit)
    .remove();

  // handle current DOM path updates
  paths
    .attr("class", "arc")
    .attr("d", arcPath)
    .attr("stroke", "#fff")
    .attr("stroke-width", 3)
    .attr("fill", (d) => color(d.data.name));

  // update the append selection to the dom
  paths
    .enter()
    .append("path")
    .attr("class", "arc")
    .attr("stroke", "#fff")
    .attr("stroke-width", 3)
    .attr("fill", (d) => color(d.data.name))
    .transition()
    .duration(3000)
    .attrTween("d", arcTweenEnter);
};

// data array and firestore
let data = [];

db.collection("expenses").onSnapshot((res) => {
  res.docChanges().forEach((change) => {
    const doc = { ...change.doc.data(), id: change.doc.id };
    switch (change.type) {
      case "added":
        data.push(doc);
        break;
      case "modified":
        const index = data.findIndex((item) => item.id === doc.id);
        data[index] = doc;
        break;
      case "removed":
        data = data.filter((item) => item.id !== doc.id);
        break;
      default:
        break;
    }
  });
  update(data);
});

const arcTweenEnter = (d) => {
  let i = d3.interpolate(d.endAngle, d.startAngle);
  return function (t) {
    d.startAngle = i(t);
    return arcPath(d);
  };
};

const arcTweenExit = (d) => {
  let i = d3.interpolate(d.startAngle, d.endAngle);
  return function (t) {
    d.startAngle = i(t);
    return arcPath(d);
  };
};
