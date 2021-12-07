import justClone from "just-clone";
import { simulateWait } from "../utils/timing";

export type FakeDbType = {
  _id: string;
  name: string;
  counter: number;
  save: () => Promise<FakeDbType>;
};

export const FakeDbModel = {
  __counters: [
    { _id: "1", name: "counter 1", counter: 0 },
    { _id: "2", name: "counter 2", counter: 0 },
  ],
  __nextId: 3,

  create: async function create(createInfo: {
    name: string;
    counter: number;
  }): Promise<FakeDbType> {
    await simulateWait();
    const _id = this.__nextId.toString();
    this.__nextId++;
    FakeDbModel.__counters.push({ _id, ...createInfo });
    return await this.findById(_id);
  },

  find: async function find(): Promise<FakeDbType[]> {
    await simulateWait();
    const clones: Partial<FakeDbType>[] = justClone<Partial<FakeDbType>[]>(
      FakeDbModel.__counters
    );
    for (const clone of clones) {
      clone.save = () => FakeDbModel.updateOne(clone._id!, clone);
    }
    return clones as FakeDbType[];
  },

  findById: async function findById(id: string): Promise<FakeDbType> {
    await simulateWait();
    let index = NaN;
    for (let i = 0; i < FakeDbModel.__counters.length; i++) {
      if (FakeDbModel.__counters[i]._id === id) {
        index = i;
        break;
      }
    }
    if (isNaN(index)) throw new Error("no record with id : " + id);

    const clone: Partial<FakeDbType> = justClone<Partial<FakeDbType>>(
      FakeDbModel.__counters[index]
    );
    clone.save = () => FakeDbModel.updateOne(clone._id!, clone);
    return clone as FakeDbType;
  },

  updateOne: async function updateOne(
    id: string,
    updatedObject: Partial<FakeDbType>
  ): Promise<FakeDbType> {
    await simulateWait();

    let index = NaN;
    for (let i = 0; i < FakeDbModel.__counters.length; i++) {
      if (FakeDbModel.__counters[i]._id === id) {
        index = i;
        break;
      }
    }

    if (isNaN(index)) throw new Error("no record with id : " + id);

    await simulateWait();

    FakeDbModel.__counters[index] = {
      ...FakeDbModel.__counters[index],
      ...updatedObject,
    };

    const clone: Partial<FakeDbType> = justClone<Partial<FakeDbType>>(
      FakeDbModel.__counters[index]
    );
    clone.save = () => FakeDbModel.updateOne(clone._id!, clone);
    return clone as FakeDbType;
  },
};
