import { FakeDbModel, FakeDbType } from "../mocks/FakeDbModel";
import { LiveObjectStateManager as LiveObjectManager } from "../utils/LiveObjectManager";

export async function loadManagedCounters(): Promise<{
  [key: string]: LiveObjectManager<FakeDbType>;
}> {
  const instances: FakeDbType[] = await FakeDbModel.find();
  const managers: { [key: string]: LiveObjectManager<FakeDbType> } = {};
  for (const i of instances) {
    const manager = new LiveObjectManager<FakeDbType>(i, saveToDb);
    managers[i._id] = manager;
  }
  return managers;
}

export async function createManagedCounter(creationData: {
  name: string;
  counter: number;
}): Promise<{ [key: string]: LiveObjectManager<FakeDbType> }> {
  const newInstance: FakeDbType = await FakeDbModel.create(creationData);
  const newManager = new LiveObjectManager<FakeDbType>(newInstance, saveToDb);
  return { [newInstance._id]: newManager };
}

async function saveToDb(obj: Partial<FakeDbType>): Promise<void> {
  await FakeDbModel.updateOne(obj._id!, obj);
  console.log(`[info] Saved [${obj.name}] with counter ${obj.counter}`);
}
