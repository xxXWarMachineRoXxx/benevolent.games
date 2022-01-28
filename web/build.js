import { prepareTransformer } from "./utils/prepare-transformer.js";
import styleCss from "./templates/style.css.js";
import indexHtml from "./templates/index.html.js";
import humanoidHtml from "./templates/humanoid.html.js";
import heartbeatHtml from "./templates/heartbeat.html.js";
import thumbHtml from "./templates/thumb.html.js";
const options = {
    debug: process.argv.includes("debug")
};
const transform = prepareTransformer("./x/");
await transform("style.css", styleCss());
await transform("index.html", indexHtml(options));
await transform("thumb.html", thumbHtml(options));
await transform("humanoid.html", humanoidHtml(options));
await transform("heartbeat.html", heartbeatHtml(options));
//# sourceMappingURL=build.js.map