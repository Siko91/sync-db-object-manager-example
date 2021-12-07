import { FakeDbModel, FakeDbType } from "../mocks/FakeDbModel";
import { LiveObjectStateManager } from "../utils/LiveObjectManager";

export async function incrementBy3(
  manager: LiveObjectStateManager<FakeDbType>
): Promise<void> {
  const promise1 = manager.getWriteAccess((obj) => {
    obj.counter = obj.counter + 1;
  });
  const promise2 = manager.getWriteAccess((obj) => {
    obj.counter = obj.counter + 1;
  });
  const promise3 = manager.getWriteAccess((obj) => {
    obj.counter = obj.counter + 1;
  });

  // the 3 increments are happening concurrently

  await Promise.all([promise1, promise2, promise3]);
}

export async function callConcurrentIncrements(
  manager: LiveObjectStateManager<FakeDbType>,
  count: number
): Promise<void> {
  const concurrentPromises: Promise<void>[] = [];

  for (let i = 0; i < count; i++) {
    concurrentPromises.push(
      manager.getWriteAccess((obj) => {
        obj.counter = obj.counter + 1;
      })
    );
  }

  await Promise.all(concurrentPromises);
}

export async function incrementEachManagerNTimes(
  managers: {
    id: string;
    manager: LiveObjectStateManager<FakeDbType>;
  }[],
  count: number
): Promise<void> {
  const promises: Promise<void>[] = [];
  for (const i of managers) {
    const promiseForManager = callConcurrentIncrements(i.manager, count);
    promises.push(promiseForManager);
  }
  await Promise.all(promises);
}
