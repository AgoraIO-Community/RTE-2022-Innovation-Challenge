export interface UserProfileGenel {
  _id: string;
  name: string;
  avatar: string;
  role?: string;
  username?: string;
  id?: string;
}

declare module Meteor {
  interface User {
    phone: string;
  }
}

export interface User {
  _id: string;
  username: string;
  role: string;
  profile: {
    avatar: string;
    name: string;
  };
}

export interface OnlineData {
  _id?: string;
  userId: string;
  records: Array<{
    instance: string;
    connection: string;
    date: Date;
  }>;
  data?: any;
}

export const User_Methods = {
  Client_Signup: "user/signup",
  User_Profile: "user/profile",
};

export const User_Publishes = {
  After_Login: "user.logined",
};
