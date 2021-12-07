import { clonePrototype } from "clone";

export class LiveObjectStateManager<T> {
  private instance: T;
  private wrappedWriteOperation: () => Promise<void>;

  currentWriteOperation?: Promise<void>;
  queueForNextWriteOperation: { resolve: () => void; reject: () => void }[] =
    [];

  constructor(
    instance: T,
    writeOperation: (cloneOfInstance: Partial<T>) => Promise<any>
  ) {
    this.instance = instance;
    this.wrappedWriteOperation = this.wrapWrite(writeOperation);
  }
  wrap(
    writeOperation: (cloneOfInstance: Partial<T>) => Promise<any>
  ): () => Promise<void> {
    throw new Error("Method not implemented.");
  }

  public getClone(): Partial<T> {
    const clone = clonePrototype<Partial<T>>(this.instance);
    return clone;
  }

  public async getWriteAccess(
    nonAsyncOperation: (object: T) => void
  ): Promise<void> {
    const result: any = nonAsyncOperation(this.instance);
    if (result instanceof Promise || result?.then || result?.catch) {
      throw new Error(
        "It is forbidden to use the 'getAccess' method with an Async function"
      );
    }

    return await this.awaitNextWriteOperation();
  }

  public async awaitNextWriteOperation(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.queueForNextWriteOperation.push({ resolve, reject });
      if (this.currentWriteOperation === undefined) {
        this.currentWriteOperation = this.wrappedWriteOperation();
      }
    });
  }

  private wrapWrite(
    writeOperation: (cloneOfInstance: Partial<T>) => Promise<any>
  ): () => Promise<void> {
    const wrappedWriteOperation = async () => {
      const responsesToGive = [...this.queueForNextWriteOperation];
      this.queueForNextWriteOperation = [];
      const clone = clonePrototype<Partial<T>>(this.instance);
      try {
        await writeOperation(clone);
        for (const { resolve } of responsesToGive) {
          resolve();
        }
      } catch (error) {
        for (const { reject } of responsesToGive) {
          reject();
        }
      } finally {
        this.currentWriteOperation = undefined;

        if (this.queueForNextWriteOperation.length > 0) {
          // calling the same function again for the next few promises waiting in queue
          this.currentWriteOperation = wrappedWriteOperation();
        }
      }
    };
    return wrappedWriteOperation;
  }
}
