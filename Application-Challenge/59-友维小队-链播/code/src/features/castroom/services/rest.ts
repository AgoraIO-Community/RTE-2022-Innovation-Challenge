import { rest } from "@/common/api";
import { updateMongoItem } from "@/common/meteor/meteor-mongo";
import { CastRooms } from "../deps";

export const getCastRoomTypes = () => rest.sequence("castroom/prop", "types")

export const updateRoom = (id: string, nd: any) => updateMongoItem(CastRooms, id, { $set: nd })