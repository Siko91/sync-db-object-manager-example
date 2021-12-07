import { FakeDbModel, FakeDbType } from "../mocks/FakeDbModel";
import { LiveObjectStateManager as LiveObjectManager } from "../utils/LiveObjectManager";

export async function loadManagedObjects(): Promise<
  { id: string; manager: LiveObjectManager<FakeDbType> }[]
> {
  const instances: FakeDbType[] = await FakeDbModel.find();
  const managers: { id: string; manager: LiveObjectManager<FakeDbType> }[] = [];
  for (const i of instances) {
    const manager = new LiveObjectManager<FakeDbType>(
      i,
      async (obj) => await FakeDbModel.updateOne(obj._id!, obj)
    );
    managers.push({ id: i._id, manager });
  }
  return managers;
}

export async function createManagedObject(creationData: {
  name: string;
  counter: number;
}): Promise<{ id: string; manager: LiveObjectManager<FakeDbType> }> {
  const newInstance: FakeDbType = await FakeDbModel.create(creationData);
  const newManager = new LiveObjectManager<FakeDbType>(
    newInstance,
    async (obj) => await FakeDbModel.updateOne(obj._id!, obj)
  );
  return { id:newInstance._id, manager: newManager };
}
