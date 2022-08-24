import { MongoCollection } from "../core/shared";
import { OnlineData } from "./types";
export * from "./types";
export const Users = Meteor.users as MongoCollection<Meteor.User>;

export const UserOnlineData = new MongoCollection<OnlineData>("user_onlines");
