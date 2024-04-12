const pubs: Publication[] = [
  {
    id: "PRGA-FPGA21",
    title: "PRGA: An Open-Source FPGA Research and Prototyping Framework",
    abstract: "...",
    venue: "FPGA",
    time: new Date(2021, 1),
    authors: [{ person: "angliz" }],
    notPncel: true,
  },
];

// for cross-reference
const pubsByID = pubs.reduce((g, pub) => {
  g.set(pub.id, pub);
  return g;
}, new Map<string, Publication>());

export default pubs;
