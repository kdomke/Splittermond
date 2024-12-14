import fs from 'fs';

const authToken = process.env.AUTH_TOKEN
const pathToSystemJson = process.env.SYSTEM_JSON_PATH
const isDryRun = process.env.DRY_RUN === 'true'

//DO NOT BLEED THE TOKEN INTO THE LOGS
console.log(`Inputs: pathToSystemJson: ${pathToSystemJson}, isDryRun: ${isDryRun}, authToken: ${authToken.length >0 ? '******':''}`)
const systemJson = JSON.parse(fs.readFileSync(pathToSystemJson, 'utf-8'));

const  body = {
    "id": "splittermond",
    "dry-run": isDryRun,
    "release": {
        "version": systemJson.version,
        "manifest": systemJson.manifest,
        "notes": `https://github.com/SplittermondFoundry/splittermond/releases/tag/v${systemJson.version}`,
        "copmatibility": systemJson.compatibility
    }
}
console.debug("Request body", body);

const response = await fetch("https://api.foundryvtt.com/_api/packages/release_version/", {
    headers: {
        'Content-Type': 'application/json',
        'Authorization': authToken
    },
    method: "POST",
    body: JSON.stringify(body)
});
const responseData = await response.json().then(data => {console.debug(data); return data})