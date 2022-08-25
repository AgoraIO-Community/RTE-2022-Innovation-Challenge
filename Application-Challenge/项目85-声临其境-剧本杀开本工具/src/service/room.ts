import axios from "axios";
import request from "../utils/request";


const roomManagerRequest = axios.create({
  baseURL: 'https://admin.thwj.tejiayun.com/',
  timeout: 2000,
});

export declare interface RoomInfo {
  uuid: string, // room 的uuid
  teamUUID: string,
  appUUID: string,
  isRecord: boolean,
  isBan: boolean,
  createdAt: string,
  limit: number
}

export declare interface RoomParam {
  uuid: string, // room 的uuid
  roomToken: string
}

export const Role = {
  Admin: "admin",
  Writer: "writer",
  Reader: "reader"
}

const default_lifespan = 3600 * 12;



export declare interface ThwjResopnse<T> {
  errno: number
  errmsg: string,
  data: T
}

export declare interface RoomRolesInfo {
  id: string,
  uid: string,
  roomId: string,
  roleId: string
  isRoomAdmin: boolean
}

/*
role:string="admin|writer|reader"
{
    "uuid":"f0b79a601ae911ed9f7d8590b0255a6b",
    "roomToken":"NETLESSROOM_YWs9WlBKVzgtZ1luWnRvZlhVeiZleHBpcmVBdD0xNjYwMzg2MzU5MDEzJm5vbmNlPTE2NjAzODI3NTkwMTMwMCZyb2xlPTAmc2lnPWQ4MDQ0NTUyMTdhMTViNGZjNmNiMzIzOTU0MWNmYzU0NTRiOGQ1OTk0MDIzY2E0ZmI0YWQ3NGQ2M2M5MjRlNTgmdXVpZD1mMGI3OWE2MDFhZTkxMWVkOWY3ZDg1OTBiMDI1NWE2Yg"
}
*/

/*
{
    "uuid": "81f025401ae711ed857671280b14c673", // room 的uuid
    "teamUUID": "GT9jcAsqEe2h3gGzQbAihw",
    "appUUID": "fQMzaWge4PL5IQ",
    "isRecord": true,
    "isBan": false,
    "createdAt": "2022-08-13T09:08:33.872Z",
    "limit": 0
}
*/

class Room {
  /**
   * 创建房间
   * @param role 
   * @returns 
   */
  createRoom(role: string) {
    return new Promise<RoomParam>((reslove, reject) => {
      this.getSDKToken(role).then((sdkToken) => {
        this.createRoomWithToken(sdkToken).then((roomInfo) => {
          const uuid = roomInfo.uuid;
          this.getRoomToken(uuid, sdkToken, role).then((roomToken) => {
            reslove({ uuid: uuid, roomToken: roomToken });
          });
        })
      })
    });
  }

  joinRoom(role: string, uuid: string) {
    return new Promise<RoomParam>((reslove, reject) => {
      this.getSDKToken(role).then((sdkToken) => {
        this.getRoomToken(uuid, sdkToken, role).then((roomToken) => {
          reslove({ uuid: uuid, roomToken: roomToken });
        });
      })
    });
  }

  getSDKToken(role: string) {
    return new Promise<string>((reslove, reject) => {
      request({
        method: 'post',
        url: '/v5/tokens/teams',
        data: {
          "accessKey": "ZPJW8-gYnZtofXUz",
          "secretAccessKey": "yI5N9oE7YA0sP4GUZjn__ARiFpzQD7cV",
          "lifespan": default_lifespan,
          "role": role
        },
        headers: {
          "region": "cn-hz"
        }
      }).then(function (response: any) {
        reslove(response.data);
      });
    });
  }

  getRoomToken(uuid: string, sdkToken: string, role: string) {
    return new Promise<string>((reslove, reject) => {
      request({
        method: 'post',
        url: `/v5/tokens/rooms/${uuid}`,
        data: {
          // "accessKey": "ZPJW8-gYnZtofXUz",
          "lifespan": default_lifespan,
          "role": role
        },
        headers: {
          "token": sdkToken,
          "region": "cn-hz"
        }
      }).then(function (response: any) {
        reslove(response.data);
      });
    });
  }

  createRoomWithToken(token: string) {
    return new Promise<RoomInfo>((reslove, reject) => {
      request({
        method: 'post',
        url: '/v5/rooms',
        headers: {
          // "token":"NETLESSSDK_YWs9WlBKVzgtZ1luWnRvZlhVeiZub25jZT0xNmY1MGY4MC0xYWU3LTExZWQtOWI1MC1kOWRhMDQ1MjEzNDYmcm9sZT0wJnNpZz0xZjhlZDM3OGQwMWJkN2ZiYTk2ZDIzOGFhZjRkMDNhNmE5Y2Q3MmUyN2IzYjllMWU2MDljOGVmNmY0OTFlZGI4",
          "token": token,
          "Content-Type": "application/json",
          "region": "cn-hz"
        }
      }).then(function (response: any) {
        reslove(response.data);
      });
    });
  }

  bindRole(uid: string, roleId: string, roomId: string, isRoomAdmin: string) {
    return new Promise<RoomInfo>((reslove, reject) => {
      let data = new FormData();
      data.append('uid', uid);
      data.append('roleId', roleId);
      data.append('roomId', roomId);
      data.append('isRoomAdmin', isRoomAdmin);
      roomManagerRequest({
        method: 'post',
        url: '/playroom/bindRole',
        data: data
      }).then(function (response: any) {
        reslove(response.data);
      });
    });
  }

  queryRolesByRoomId(roomId: string) {
    return new Promise<Array<RoomRolesInfo>>((reslove, reject) => {
      roomManagerRequest({
        method: 'get',
        url: '/playroom/roles',
        params: {
          roomId: roomId,
        }

      }).then(function (response: any) {
        const res = response.data as ThwjResopnse<Array<RoomRolesInfo>>;
        reslove(res.data);
      });
    });
  }
}


export default new Room();