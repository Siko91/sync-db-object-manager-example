import { createManagedCounter, loadManagedCounters } from "./demos/init";
import {
  incrementBy3,
  incrementEachManagerNTimes,
} from "./demos/concurrentIncrements";
import { wait } from "./utils/timing";
import { FakeDbModel, getRowsSync } from "./mocks/FakeDbModel";

main().catch((err) => {
  console.error(err);
  throw err;
});

async function main() {
  // loaded 2 managers
  let managers = await loadManagedCounters();

  // very simple demo
  await incrementBy3(managers["1"]); // 0 -> 3

  // +1 => 3 managers
  managers = {
    ...managers,
    ...(await createManagedCounter({
      counter: 10,
      name: "counter 3",
    })),
  };

  // simple demo
  await incrementBy3(managers["1"]); // 3 -> 6
  await incrementBy3(managers["2"]); // 0 -> 3
  await incrementBy3(managers["3"]); // 10 -> 13

  // heavy demo
  await incrementEachManagerNTimes(managers, 1000); // end counts should be [1006, 1003, 1013]

  // 2 heavy demos running almost at once
  const demoPromise1 = incrementEachManagerNTimes(managers, 100);
  const demoPromise2 = wait(20).then(() =>
    incrementEachManagerNTimes(managers, 400)
  );
  const demoPromise3 = wait(50).then(() =>
    incrementEachManagerNTimes(managers, 500)
  );
  await Promise.all([demoPromise1, demoPromise2, demoPromise3]); // end counts should be [2006, 2003, 2013]

  // Check results
  const dbCouns = getRowsSync().map((i) => i.counter);
  const liveCouns =  [
    managers["1"].getClone().counter,
    managers["2"].getClone().counter,
    managers["3"].getClone().counter,
  ];
  console.log("-------");
  console.log(" expected : [2006,2003,2013]");
  console.log(" db       : " + JSON.stringify(dbCouns));
  console.log(" live     : " + JSON.stringify(liveCouns));
}
