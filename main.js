"use strict";


const {
    app,
    BrowserWindow,
    dialog,
    ipcMain
} = require("electron");

const path =
    require("path");

const {
    autoUpdater
} = require("electron-updater");

ipcMain.handle(
    "app:getVersion",
    () => {

        return app.getVersion();

    }
);


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
                preload: path.join(
                    __dirname,
                    "preload.cjs"
                ),
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


/*
    Controlla se esiste una nuova versione
    pubblicata su GitHub Releases.
*/
function checkForUpdates() {

    console.log(
        "Avvio controllo aggiornamenti..."
    );


    autoUpdater.on(
        "checking-for-update",
        () => {

            console.log(
                "Controllo disponibilità aggiornamenti..."
            );

        }
    );


    autoUpdater.on(
        "update-available",
        async (info) => {

            console.log(
                "AGGIORNAMENTO DISPONIBILE:",
                info.version
            );


            const result =
                await dialog.showMessageBox({
                    type: "info",

                    title:
                        "Aggiornamento disponibile",

                    message:
                        "È disponibile una nuova versione di Packing List.",

                    detail:
                        "Versione installata: " +
                        app.getVersion() +
                        "\n" +
                        "Nuova versione: " +
                        info.version,

                    buttons: [
                        "Aggiorna",
                        "Annulla"
                    ],

                    defaultId: 0,

                    cancelId: 1
                });


            if (
                result.response === 0
            ) {

                console.log(
                    "Avvio download aggiornamento..."
                );

                autoUpdater.downloadUpdate();

            }

        }
    );


    autoUpdater.on(
        "update-not-available",
        (info) => {

            console.log(
                "Nessun aggiornamento disponibile.",
                info.version
            );

        }
    );


    autoUpdater.on(
        "download-progress",
        (progress) => {

            console.log(
                "Download aggiornamento:",
                Math.round(
                    progress.percent
                ) + "%"
            );

        }
    );


    autoUpdater.on(
        "update-downloaded",
        async (info) => {

            console.log(
                "AGGIORNAMENTO SCARICATO:",
                info.version
            );


            const result =
                await dialog.showMessageBox({
                    type: "info",

                    title:
                        "Aggiornamento pronto",

                    message:
                        "L'aggiornamento è stato scaricato.",

                    detail:
                        "Packing List verrà riavviato per completare " +
                        "l'installazione della versione " +
                        info.version +
                        ".",

                    buttons: [
                        "Riavvia e aggiorna",
                        "Più tardi"
                    ],

                    defaultId: 0,

                    cancelId: 1
                });


            if (
                result.response === 0
            ) {

                autoUpdater.quitAndInstall();

            }

        }
    );


    autoUpdater.on(
        "error",
        (error) => {

            console.error(
                "ERRORE AUTO-UPDATE:",
                error
            );


            dialog.showErrorBox(
                "Errore aggiornamento",
                error.message
            );

        }
    );


    autoUpdater.checkForUpdates();

}


/*
    Avvio dell'applicazione.
*/
app.whenReady().then(
    () => {

        createMainWindow();


        /*
            Controlliamo gli aggiornamenti
            dopo l'avvio dell'applicazione.
        */
        checkForUpdates();


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


/*
    Su Windows e Linux l'applicazione
    viene chiusa quando non esistono
    più finestre aperte.
*/
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