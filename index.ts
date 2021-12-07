import { createManagedObject, loadManagedObjects } from "./demos/init";
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
  const managersList = await loadManagedObjects();

  // very simple demo
  const manager1 = managersList[0].manager;
  const simplePromise1 = manager1.getWriteAccess((obj) => obj.counter++);
  const simplePromise2 = manager1.getWriteAccess((obj) => obj.counter++);
  const simplePromise3 = manager1.getWriteAccess((obj) => obj.counter++);
  await Promise.all([simplePromise1, simplePromise2, simplePromise3]); // counter changes from 0 to 3

  // add +1 manager => 3 managers
  managersList.push(
    await createManagedObject({
      counter: 10,
      name: "counter 3",
    })
  );

  // concurrent simple demo
  const triplePromise1 = incrementBy3(managersList[0].manager); // 3 -> 6
  const triplePromise2 = incrementBy3(managersList[1].manager); // 0 -> 3
  const triplePromise3 = incrementBy3(managersList[2].manager); // 10 -> 13
  await Promise.all([triplePromise1, triplePromise2, triplePromise3]);

  // heavy demo
  await incrementEachManagerNTimes(managersList, 1000); // end counts should be [1006, 1003, 1013]

  // 3 heavy demos running almost at once
  const heavyDemoPromise1 = incrementEachManagerNTimes(managersList, 100);
  const heavyDemoPromise2 = wait(20).then(() =>
    incrementEachManagerNTimes(managersList, 400)
  );
  const heavyDemoPromise3 = wait(50).then(() =>
    incrementEachManagerNTimes(managersList, 500)
  );
  await Promise.all([
    heavyDemoPromise1,
    heavyDemoPromise2,
    heavyDemoPromise3,
  ]); // end counts should be [2006, 2003, 2013]

  // Check results
  const dbCounts = getRowsSync().map((i) => i.counter);
  const liveCounts = [
    managersList[0].manager.getClone().counter,
    managersList[1].manager.getClone().counter,
    managersList[2].manager.getClone().counter,
  ];
  console.log("-------");
  console.log(" expected : [2006,2003,2013]");
  console.log(" db       : " + JSON.stringify(dbCounts));
  console.log(" live     : " + JSON.stringify(liveCounts));
}
