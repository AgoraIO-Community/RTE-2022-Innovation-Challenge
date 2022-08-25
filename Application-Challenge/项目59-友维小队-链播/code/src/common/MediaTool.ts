export class MediaTool {
    constructor(private func: (...args: any[]) => void) {
        //
    }
    async playElement(el: HTMLMediaElement) {
        try {
            await el.play();
        } catch (error) {
            this.func(error, el);
            throw error;
        }
    }
}
