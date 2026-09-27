"use strict";

const {
    contextBridge,
    ipcRenderer
} = require("electron");


contextBridge.exposeInMainWorld(
    "productionAPI",
    {

        getAppVersion:
            () => ipcRenderer.invoke(
                "app:getVersion"
            )

    }
);