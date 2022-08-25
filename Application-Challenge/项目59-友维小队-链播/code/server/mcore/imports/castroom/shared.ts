import { MongoCollection } from "../core/shared";
import { CastRoom, CastRoomRecord, CastRoomUserFavor } from "./types";
import { CacheLevel, DBItemArchedBase } from "../core/types";
import { getColName } from "../core/db";
export * from "./types";

export const CastRoomRecordArchs = new MongoCollection<
    DBItemArchedBase<CastRoomRecord>
>(getColName("castroom_rocords_archs"), {
    cache: CacheLevel.Hard,
});

export const CastRoomRecords = new MongoCollection<CastRoomRecord>(
    getColName("castroom_records")
);

export const CastRooms = new MongoCollection<CastRoom>(getColName("castrooms"));
export const CastRoomFavors = new MongoCollection<CastRoomUserFavor>(getColName("castroom_favors"));
