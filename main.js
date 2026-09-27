"use strict";

const {
    app,
    BrowserWindow
} = require("electron");

const path =
    require("path");


function createMainWindow() {

    const mainWindow =
        new BrowserWindow({

            width: 1400,

            height: 900,

            minWidth: 1100,

            minHeight: 700,

            icon: path.join(
                __dirname,
                "assets",
                "image",
                "KAPL.ico"
            ),

            webPreferences: {

                contextIsolation: true,

                nodeIntegration: false

            }

        });


    mainWindow.loadFile(
        path.join(
            __dirname,
            "index.html"
        )
    );

}


app.whenReady().then(
    () => {

        createMainWindow();


        app.on(
            "activate",
            () => {

                if (
                    BrowserWindow
                        .getAllWindows()
                        .length === 0
                ) {

                    createMainWindow();

                }

            }
        );

    }
);


app.on(
    "window-all-closed",
    () => {

        if (
            process.platform !== "darwin"
        ) {

            app.quit();

        }

    }
);