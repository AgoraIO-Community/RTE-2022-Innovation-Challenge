import { Fastboard, useFastboard } from "@netless/fastboard-react";
import React from "react";
import { get_uid } from "../utils/common";
// import './index.less';

// import { getRoomTokenOne } from "../utils/NetApi";

export default function Board(props: any) {

    const app = useFastboard(() => ({
        sdkConfig: {
          appIdentifier: "ss4WoMf_EeqfCXcv33LmiA/izfIC88inXYJKw",
          region: "cn-hz",
        },
        // joinRoom: {
        //   uid: get_uid(),
        //   uuid: "ca6072e00b6e11ed8f73c3ac3bcce546",
        //   roomToken: "NETLESSROOM_YWs9VWtNUk92M1JIN2I2Z284dCZleHBpcmVBdD0xNjYxMjcyNTk5MDU3Jm5vbmNlPWNhODdmODEwLTBiNmUtMTFlZC04OWQxLTNmZjQ1Mzc3YzYxNyZyb2xlPTEmc2lnPTM0YzkzNzRlMzVjNWI2YzBiZGViMzA3M2JhMTRjNGM1YzY5MzNmMWZjOTI0MzM3ZWEyZTE2ZWMzMzQ3YTE2YmYmdXVpZD1jYTYwNzJlMDBiNmUxMWVkOGY3M2MzYWMzYmNjZTU0Ng"
        // },
        joinRoom: {
          uid: get_uid(),
          uuid: props.roomUUID,
          roomToken: props.roomToken
        },
      }));


    return (
      props.boardInit ? <Fastboard app={props.app} /> : null
    )
  }

// export default class Board extends React.Component {
//     constructor(props: {} | Readonly<{}>) {
//         super(props);
//         this.state = {
//             show: false,
//             uuid: "",
//             roomToken: "",
//         };
//     }

//     render() {
//         const uuid1 = "a14fc2c2-07e0-4943-b61b-e98c108608a2";
//         const uuid2 = "a6da52d6-d4d3-42bf-a7f9-47f544865160";

//         const uuid = uuid1;

//         getRoomTokenOne(uuid).then((roomToken) => {
//             this.setState({
//                 roomToken: `${roomToken}`,
//                 uuid: uuid,
//                 show: true
//             });
//         });
//         const app = useFastboard(() => ({
//             sdkConfig: {
//                 appIdentifier: "ss4WoMf_EeqfCXcv33LmiA/izfIC88inXYJKw",
//                 region: "cn-hz",
//             },
//             // joinRoom: {
//             //   uid: get_uid(),
//             //   uuid: "ca6072e00b6e11ed8f73c3ac3bcce546",
//             //   roomToken: "NETLESSROOM_YWs9VWtNUk92M1JIN2I2Z284dCZleHBpcmVBdD0xNjYxMjcyNTk5MDU3Jm5vbmNlPWNhODdmODEwLTBiNmUtMTFlZC04OWQxLTNmZjQ1Mzc3YzYxNyZyb2xlPTEmc2lnPTM0YzkzNzRlMzVjNWI2YzBiZGViMzA3M2JhMTRjNGM1YzY5MzNmMWZjOTI0MzM3ZWEyZTE2ZWMzMzQ3YTE2YmYmdXVpZD1jYTYwNzJlMDBiNmUxMWVkOGY3M2MzYWMzYmNjZTU0Ng"
//             // },
//             joinRoom: {
//                 uid: get_uid(),
//                 uuid: uuid,
//                 roomToken: this.state.roomToken
//             },
//         }));
//         return (
//             // 
//             this.state.show ? <Fastboard app={app} /> : null
//         );
//     }
// }