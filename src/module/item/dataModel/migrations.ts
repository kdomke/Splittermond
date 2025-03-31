export function migrateFrom0_12_11(source:unknown){
    if(!!source && typeof source === "object" && ("modifier" in source) && typeof(source.modifier) === "string"){
        const keep = source.modifier.split(",")
            .map(mod => mod.trim())
            .filter(mod => !mod.startsWith("susceptibility"));
        const change = source.modifier.split(",")
            .map(mod => mod.trim())
            .filter(mod => mod.startsWith("susceptibility"))
            .map(mod => {
                const damageType = mod.split(" ")?.[0]?.split(".")?.[1] ?? ""
                const newValue = -1 * parseInt(mod.split(" ")?.[1] || "1")
                return `resistance.${damageType} ${newValue}`
            });
        source.modifier = [...keep, ...change].join(", ");
    }
    return source;
}

export function migrateFrom0_12_13(source:unknown){
    if(!!source && typeof source === "object" && ("modifier" in source) && typeof(source.modifier) === "string"){
        const keep = source.modifier.split(",")
            .map(mod => mod.trim())
            .filter(mod => !mod.includes("/"));
        const change = source.modifier.split(",")
            .map(mod => mod.trim())
            .filter(mod => mod.includes("/"))
            .map(mod => {
                const path = mod.split("/")?.[0].trim() ?? "";
                const value = /\S+(?=\s*$)/.exec(mod)?.[0].trim() ?? "";
                const emphasis = /(?<=\/).*?(?=\S+\s*$)/.exec(mod)?.[0].trim() ?? ""
                return `${path} emphasis="${emphasis}" ${value}`
            });
        source.modifier = [...keep, ...change].join(", ");
    }

    //We need to enforce that boolean values are actually boolean values. Otherwise they might behave weirdly when displayed
    if(!!source && typeof source === "object" && "equipped" in source){
        source.equipped = !!source.equipped;
    }
    if(!!source && typeof source === "object" && "multiSelectable" in source){
        source.multiSelectable= !!source.multiSelectable;
    }
    if(!!source && typeof source === "object" && "onCreationOnly" in source){
        source.onCreationOnly= !!source.onCreationOnly;
    }
    if(!!source && typeof source === "object" && "isGrandmaster" in source){
        source.isGrandmaster= !!source.isGrandmaster;
    }
    if(!!source && typeof source === "object" && "isManeuver" in source){
        source.isManeuver= !!source.isManeuver;
    }
    if(!!source && typeof source === "object" && "prepared" in source){
        source.prepared= !!source.prepared;
    }
    if(!!source && typeof source === "object" && "active" in source){
        source.active= !!source.active;
    }
    return source;
}