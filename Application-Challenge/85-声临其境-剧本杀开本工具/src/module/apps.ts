import { apps, register } from "@netless/fastboard";
import Dice from "./dice";
import DiceIcon from "../../src/assets/dice.png"
import TimeCountIcon from "../../src/assets/timecount.png"
import Countdown from "@netless/app-countdown"
// import Plyr from "@netless/app-plyr"
// import TicTacToe from "./TicTacToe";

export const registering = () => {
    register({
        kind: "Dice",
        appOptions: {
            // 打开这个选项显示 debug 工具栏
            debug: false,
        },
        src: Dice,
    });

    apps.clear()

    apps.push(
        {
            kind: "Dice",
            label: "骰子",
            icon: DiceIcon,
            onClick: (fastboard: any) => {
                fastboard.manager.addApp({
                    src: Dice,
                    kind: "Dice",
                    options: {
                        title: "骰子",
                    },
                });
            },
        }
    );
    apps.push(
        {
            kind: "Countdown",
            label: "计时器",
            icon: TimeCountIcon,
            onClick: (fastboard: any) => {
                fastboard.manager.addApp({
                    src: Countdown,
                    kind: "Countdown",
                    options: {
                        title: "计时器",
                    },
                });
            },
        }
    );
}