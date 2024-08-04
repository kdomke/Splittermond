export function simplePropertyResolver(a,property){
    let member = a;
    property.split(".").forEach(prop => member = member[prop]);
    return member;
}