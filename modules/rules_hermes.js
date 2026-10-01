"use strict";


const PACKING_RULES_HERMES = {

    BOX_MAX_HELMETS: 6

};


function getHelmetBoxCapacity(
    row
) {

    return PACKING_RULES_HERMES
        .BOX_MAX_HELMETS;

}


function getGroupBoxCapacity(
    group
) {

    return PACKING_RULES_HERMES
        .BOX_MAX_HELMETS;

}


window.PackingListRulesHermes = {

    getHelmetBoxCapacity,

    getGroupBoxCapacity,

    constants:
        PACKING_RULES_HERMES

};