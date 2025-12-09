import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/tickets";

type Cache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  var mongooseCache: Cache | undefined;
}

const globalAny: any = global;

if (!globalAny.mongooseCache) {
  globalAny.mongooseCache = { conn: null, promise: null } as Cache;
}

export async function connectToDB() {
  const cache = globalAny.mongooseCache as Cache;

  if (cache.conn) {
    return cache.conn;
  }

  if (!cache.promise) {
    cache.promise = mongoose
      .connect(MONGODB_URI)
      .then((m) => m)
      .catch((err) => {
        cache.promise = null;
        throw err;
      });
  }

  cache.conn = await cache.promise;
  return cache.conn;
}

export default connectToDB;
