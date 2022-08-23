import { Subject, debounceTime } from "rxjs";
import { useExecTree } from "@/common/ExecTree";
import { MediaTool } from "@/common/MediaTool";

let mt: MediaTool;

export const setupMediaTool = (tools: { showConfirm: any }) => {
    const list = [] as any[];
    const play$ = new Subject<void>();
    const t = useExecTree();
    t.add(
        play$.pipe(debounceTime(150)).subscribe(() => {
            tools.showConfirm("现在就开始播放视频吗？").then(() => {
                list.splice(0).forEach((item) => {
                    try {
                        item.play();
                    } catch (error) {
                        //
                    }
                });
            });
        })
    );
    mt = new MediaTool((err, el) => {
        if (err.message?.indexOf("user didn't interact") > -1) {
            play$.next();
            list.push(el);
        }
    });
};

export const useMediaTool = () => {
    return mt;
};
