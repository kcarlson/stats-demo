const { EventEmitter } = require("events");

const randomValue0To1000 = () => Math.floor(Math.random() * 1000);

// Just some initial dummy stats to see what is going on
const currentStats = [
  {
    name: "dummy-01",
    value: undefined,
    min: undefined,
    max: undefined,
  },
  {
    name: "dummy-02",
    value: undefined,
    min: undefined,
    max: undefined,
  },
];

const getStats = () => ({
  stats: currentStats.map((i) => {
    const value = randomValue0To1000();
    // Upate ptrs
    i.min = Math.min(i.min ?? value, value);
    i.max = Math.max(i.max ?? value, value);

    return {
      ...i,
      value,
    };
  }),
});
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
      // Emit new stats with flag
      emitter.emit("stats", {
        ...getStats(),
        updated: true,
      });
      return true;
    },
    removeStats: ({ stats }) => {
      // Return false if any stat does not exist
      if (stats.some((i) => !currentStats.some((j) => i.name === j.name))) {
        return false;
      }
      stats.forEach((i) => {
        const index = currentStats.findIndex((j) => i.name === j.name);
        currentStats.splice(index, 1);
      });
      // Emit new stats with flag
      emitter.emit("stats", {
        ...getStats(),
        updated: true,
      });
      return true;
    },
  };
};
