# Example code for managing DB objects loaded in memory while avoiding race conditions

The code is in typescript. I used `ts-node index.ts` to run it.

The main code of interest is in the `./utils/LiveObjectManager.ts`

The `LiveObjectManager` class is meant to manage "live" objects.
A "live" object is an object that is always kept in memory (RAM) and which syncs the database with its state when it changes.

Benefits:

- Makes it impossible to lose data due to race conditions.
  
Drawbacks:

- While writing on a live object, you cannot perform ASYNC operations (if you do, you'll re-introduce the risk of race conditions)

## Constructor

```typescript
const databaseObject = await mongooseModel.findById("id of the object");
const manager = new LiveObjectManager<mongoose.Document>(
    databaseObject,
    async (objectClone) => await mongooseModel.updateOne(obj._id!, objectClone)
);
```

## Get ReadOnly Access

```typescript
// Cloning the object is a synchronous operation
const clone = manager.getClone();
```

## Write Access

```typescript
await manager.getWriteAccess((obj: mongooseDocument) => {
    obj.data = "adding some data to the object";
    obj.otherData = 42;
});

// the getWriteAccess method only accepts SYNC operations (no ASYNC)
// the getWriteAccess method will ensure that your object is saved after the modifications

// the getWriteAccess method does not return a result. To get the final result, you need to clone it again.
const clone = manager.getClone();
```

## Details

- The LiveObjectManager lets you modify the object (sync) only once at a time
- The LiveObjectManager writes data to the database only once at a time
- If the object was modified multiple times in a short period (sync), the LiveObjectManager may detect that and choose to only save the object to the DB once (async)
- The LiveObjectManager ensures that the DB is always in sync with the live object
- The LiveObjectManager ensures that (at least) your update is stored in the database when you `await` the `getWriteAccess` method
