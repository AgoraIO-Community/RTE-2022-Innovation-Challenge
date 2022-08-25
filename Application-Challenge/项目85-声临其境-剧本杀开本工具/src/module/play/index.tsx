import type { NetlessApp } from "@netless/window-manager";
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./play";

const Play: NetlessApp = {
  config: {
    minwidth: 0.5,
    minheight: 1,
    width: (9 / 16) * 0.5,
    height: 0.5,
  },
  kind: "Play",
  setup(context: any) {
    const box = context.getBox();
    // @todo
    box._fixRatio$.setValue(true);
    const $content = document.createElement("div");
    $content.className = "play";
    box.mountContent($content);

    const root = createRoot($content);
    root.render(<App context={context} />);

    context.emitter.on("destroy", () => {
      root.unmount();
    });
  },
};

export default Play;
