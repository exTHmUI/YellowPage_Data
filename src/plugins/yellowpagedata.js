import fs from "fs";
import yaml from "js-yaml";
import YPDataJS from "../YellowPageData.js";

import config from "../const/configuration.js"

const plugin = (file, _, cb) => {
    let avatarServer = config[0].avatar_server;

    const path = file.path;
    const data = fs.readFileSync(path, "utf8");
    const json = yaml.load(data);

    let YPData = YPDataJS();
    for (const [key, value] of Object.entries(json)) {
        YPData[key] = value;
    }
    while (avatarServer.endsWith("/")) {
        avatarServer = avatarServer.substr(0, avatarServer.length - 1);
    }

    YPData.avatar = avatarServer + "/" + path.replace(".yaml", ".png").substring(path.lastIndexOf("/", path.lastIndexOf("/") - 1) + 1);
    const contents = {
        version: Math.ceil(Date.now() / 1000),
        status: 0,
        data: [
            YPData
        ]
    };
    file.contents = Buffer.from(JSON.stringify(contents))
    cb(null, file)
}

export default plugin