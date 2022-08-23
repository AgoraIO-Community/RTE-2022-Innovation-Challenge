import { getColName, MongoCollection } from "./db";
import { CacheLevel, IFileStored } from "./types";
export { MongoCollection } from "./db";
export * from "./types";
export * from "./utils";

export const FileStore = new MongoCollection<IFileStored>(getColName("files"), {
  cache: CacheLevel.Hard,
});
