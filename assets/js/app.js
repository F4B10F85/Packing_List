"use strict";


/*
|--------------------------------------------------------------------------
| Packing List
|--------------------------------------------------------------------------
|
| Punto di ingresso principale dell'applicazione.
|
*/


document.addEventListener(
    "DOMContentLoaded",
    initializeApplication
);


/*
|--------------------------------------------------------------------------
| Inizializzazione
|--------------------------------------------------------------------------
*/

function initializeApplication() {

    initializeNavigation();

    loadWorkspace("dashboard");

    setApplicationStatus(
        "Pronto",
        "success"
    );

}


/*
|--------------------------------------------------------------------------
| Navigazione
|--------------------------------------------------------------------------
*/

function initializeNavigation() {

    const navigationItems =
        document.querySelectorAll(
            ".navigation-item"
        );


    navigationItems.forEach(
        (navigationItem) => {

            navigationItem.addEventListener(
                "click",
                () => {

                    const workspace =
                        navigationItem.dataset.workspace;


                    if (!workspace) {

                        return;

                    }


                    setActiveNavigationItem(
                        navigationItem
                    );


                    loadWorkspace(
                        workspace
                    );

                }
            );

        }
    );

}


/*
|--------------------------------------------------------------------------
| Elemento di navigazione attivo
|--------------------------------------------------------------------------
*/

function setActiveNavigationItem(
    activeItem
) {

    const navigationItems =
        document.querySelectorAll(
            ".navigation-item"
        );


    navigationItems.forEach(
        (navigationItem) => {

            navigationItem.classList.remove(
                "active"
            );

        }
    );


    activeItem.classList.add(
        "active"
    );

}


/*
|--------------------------------------------------------------------------
| Caricamento workspace
|--------------------------------------------------------------------------
*/

function loadWorkspace(
    workspaceName
) {

    const workspace =
        document.getElementById(
            "workspace"
        );


    const pageTitle =
        document.getElementById(
            "page-title"
        );


    if (!workspace) {

        return;

    }


    const workspaceContent =
        getWorkspaceContent(
            workspaceName
        );


    workspace.innerHTML =
        workspaceContent;


    if (pageTitle) {

        pageTitle.textContent =
            getWorkspaceTitle(
                workspaceName
            );

    }

}


/*
|--------------------------------------------------------------------------
| Titoli workspace
|--------------------------------------------------------------------------
*/

function getWorkspaceTitle(
    workspaceName
) {

    const titles = {

        dashboard:
            "Dashboard",

        import:
            "Importazione",

        rules:
            "Regole",

        boxes:
            "BOX",

        control:
            "Controllo",

        result:
            "Packing List"

    };


    return (
        titles[workspaceName]
        || "Packing List"
    );

}


/*
|--------------------------------------------------------------------------
| Contenuto workspace
|--------------------------------------------------------------------------
*/

function getWorkspaceContent(
    workspaceName
) {

    switch (workspaceName) {

        case "dashboard":

            return getDashboardWorkspace();


        case "import":

            return getImportWorkspace();


        case "rules":

            return getRulesWorkspace();


        case "boxes":

            return getBoxesWorkspace();


        case "control":

            return getControlWorkspace();


        case "result":

            return getResultWorkspace();


        default:

            return getDashboardWorkspace();

    }

}


/*
|--------------------------------------------------------------------------
| Dashboard
|--------------------------------------------------------------------------
*/

function getDashboardWorkspace() {

    return `

        <div class="dashboard-grid">

            <div class="card stat-card">

                <div class="stat-label">
                    Articoli importati
                </div>

                <div class="stat-value">
                    0
                </div>

            </div>


            <div class="card stat-card">

                <div class="stat-label">
                    BOX disponibili
                </div>

                <div class="stat-value">
                    0
                </div>

            </div>


            <div class="card stat-card">

                <div class="stat-label">
                    Articoli elaborati
                </div>

                <div class="stat-value">
                    0
                </div>

            </div>


            <div class="card stat-card">

                <div class="stat-label">
                    Anomalie
                </div>

                <div class="stat-value">
                    0
                </div>

            </div>

        </div>


        <div class="card">

            <h2 class="card-title">
                Packing List
            </h2>

            <p class="card-description">
                Il sistema è pronto.
                Importa i dati per iniziare
                l'elaborazione delle BOX.
            </p>

        </div>

    `;

}


/*
|--------------------------------------------------------------------------
| Importazione
|--------------------------------------------------------------------------
*/

function getImportWorkspace() {

    return `

        <div class="card">

            <h2 class="card-title">
                Importazione dati
            </h2>

            <p class="card-description">
                Qui verranno caricati i dati
                necessari alla generazione
                della Packing List.
            </p>

        </div>

    `;

}


/*
|--------------------------------------------------------------------------
| Regole
|--------------------------------------------------------------------------
*/

function getRulesWorkspace() {

    return `

        <div class="card">

            <h2 class="card-title">
                Regole di assegnazione
            </h2>

            <p class="card-description">
                Qui verranno configurate le
                regole utilizzate per distribuire
                gli articoli nelle BOX.
            </p>

        </div>

    `;

}


/*
|--------------------------------------------------------------------------
| BOX
|--------------------------------------------------------------------------
*/

function getBoxesWorkspace() {

    return `

        <div class="card">

            <h2 class="card-title">
                Gestione BOX
            </h2>

            <p class="card-description">
                Qui verranno visualizzate
                e gestite le BOX generate
                dal sistema.
            </p>

        </div>

    `;

}


/*
|--------------------------------------------------------------------------
| Controllo
|--------------------------------------------------------------------------
*/

function getControlWorkspace() {

    return `

        <div class="card">

            <h2 class="card-title">
                Controllo elaborazione
            </h2>

            <p class="card-description">
                Qui verranno evidenziate
                anomalie, articoli non assegnati
                e situazioni da verificare.
            </p>

        </div>

    `;

}


/*
|--------------------------------------------------------------------------
| Risultato
|--------------------------------------------------------------------------
*/

function getResultWorkspace() {

    return `

        <div class="card">

            <h2 class="card-title">
                Packing List finale
            </h2>

            <p class="card-description">
                Qui verrà visualizzato il risultato
                finale dell'elaborazione.
            </p>

        </div>

    `;

}


/*
|--------------------------------------------------------------------------
| Stato applicazione
|--------------------------------------------------------------------------
*/

function setApplicationStatus(
    message,
    type = "success"
) {

    const status =
        document.getElementById(
            "application-status"
        );


    const indicator =
        document.getElementById(
            "application-status-indicator"
        );


    if (status) {

        status.textContent =
            message;

    }


    if (indicator) {

        indicator.style.background =
            getStatusColor(type);

    }

}


/*
|--------------------------------------------------------------------------
| Colore stato
|--------------------------------------------------------------------------
*/

function getStatusColor(
    type
) {

    const colors = {

        success:
            "var(--color-success)",

        warning:
            "var(--color-warning)",

        danger:
            "var(--color-danger)"

    };


    return (
        colors[type]
        || colors.success
    );

}
