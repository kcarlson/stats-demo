const { EventEmitter } = require("events");

const currentStats = [
  {
    name: "dummy-01",
    // Just get current timestamp
    value: Date.now(),
  },
  {
    name: "dummy-02",
    // Just get current timestamp
    value: Date.now() - 3,
  },
];

const getStats = () => {
  return {
    stats: currentStats.map((i) => ({
      ...i,
      value: Date.now() - (i.value ?? 0),
    })),
  };
};
module.exports = () => {
  console.log("dummy connector loaded");
  // Create an event emitter to emit stats
  const emitter = new EventEmitter();
  // Use basic interval to emit stats
  setInterval(() => {
    emitter.emit("stats", getStats());
  }, 1000);
  return {
    emitter,
    getStats,
    addStats: ({ stats }) => {
      // Return false if any stat already exists
      if (currentStats.some((i) => stats.some((j) => i.name === j.name))) {
        return false;
      }
      stats.forEach((i) =>
        currentStats.push({
          // Default value to now
          value: Date.now(),
          ...i,
        })
      );
      return true;
    },
  };
};
