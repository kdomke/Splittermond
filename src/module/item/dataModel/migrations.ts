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