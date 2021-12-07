import { clonePrototype } from "clone";
import { simulateWait } from "../utils/timing";

export type FakeDbType = {
  _id: string;
  name: string;
  counter: number;
};

let __rows = [
  { _id: "1", name: "counter 1", counter: 0 },
  { _id: "2", name: "counter 2", counter: 0 },
];
let __nextId = 3;

export function getRowsSync() {
  return clonePrototype(__rows);
} 

export const FakeDbModel = {
  create: async function create(createInfo: {
    name: string;
    counter: number;
  }): Promise<FakeDbType> {
    await simulateWait();
    const _id = __nextId.toString();
    __nextId++;
    __rows.push({ _id, ...createInfo });
    return await this.findById(_id);
  },

  find: async function find(): Promise<FakeDbType[]> {
    await simulateWait();
    const clones: Partial<FakeDbType>[] = clonePrototype<Partial<FakeDbType>[]>(
      __rows
    );
    return clones as FakeDbType[];
  },

  findById: async function findById(id: string): Promise<FakeDbType> {
    await simulateWait();
    let index = NaN;
    for (let i = 0; i < __rows.length; i++) {
      if (__rows[i]._id === id) {
        index = i;
        break;
      }
    }
    if (isNaN(index)) throw new Error("no record with id : " + id);

    const clone: Partial<FakeDbType> = clonePrototype<Partial<FakeDbType>>(
      __rows[index]
    );
    return clone as FakeDbType;
  },

  updateOne: async function updateOne(
    id: string,
    updatedObject: {
      name?: string;
      counter?: number;
    }
  ): Promise<void> {

    const operationId = Math.random().toString().split('.')[1].substr(0, 5);

    console.log(`[${operationId}] [info] Starting save operation...`);
    await simulateWait();

    let index = NaN;
    for (let i = 0; i < __rows.length; i++) {
      if (__rows[i]._id === id) {
        index = i;
        break;
      }
    }

    if (isNaN(index)) throw new Error("no record with id : " + id);

    await simulateWait();

    __rows[index].name = updatedObject.name || __rows[index].name;
    __rows[index].counter = updatedObject.counter || __rows[index].counter;

    console.log(`[${operationId}] [info] Saved #${index} [${__rows[index].name}] with counter ${__rows[index].counter}`);
  },
};
