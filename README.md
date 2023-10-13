# Ekos UI manipulation

Manipulate the Ekos UI in the browser with TypeScript

## Quick install
### Requirements
- npm
- TypeScript
- Puppeteer
- dotenv

### Steps
**For TS UI manipulation scripts**
1. Clone repo
```bash
git clone https://github.com/simlal/ekos-UI-manipulation.git
cd ekos-UI-manipulation
```
2. (Optional) TS install

```bash
npm install -g typescript
```

3. tsconfig init + mods

```bash
touch tsconfig.json
# Include these in the tsconfig.json
```
```JSON
{
  "compilerOptions": {
    /* Language and Environment */
    "target": "ES2016",
    "lib": ["DOM", "DOM.ITERABLE", "ES2016"],
    /* Modules */
    "module": "commonjs",
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    /* Type Checking */
    "strict": true,
    "skipLibCheck": true
  }
}
```
**For puppeteer scripts**
```bash
npm install puppeteer dotenv
```
Put your Ekos credentials in a .env file
```bash
touch .env
# Include these in the .env file
```
```bash
EKOS_USERNAME=your_username
EKOS_PASSWORD=your_password
```

## Quick usage for TS UI manipulation scripts
1. Transpile to .js and use utility functions
```bash
tsc --project tsconfig.json
```

2. Login to Ekos pro and go to:
    i. On navbar -> Reporting
    ii. Then All Reports

3. Pre-filter reports or pass an argument to `copyAndEditReports` to search for a given string in the reportName

4. Open console and copy paste transpiled .js code

5. Call the the entry point function to loop through all currently loaded reports and make the modifications
```javascript
// To copy the firstLocationFV01 to secondLocationFV01
copyEditMultipleReports("firstLocationFV01", "secondLocationFV01")
```

## Fetching reports with puppeteer
1. Create a `data` folder inside root dir
2. Modify the queries and report names in `fetchReports.js` to your liking
3. Run the script with `node fetchReports.js` to fetch all reports and save them in the `data` folder. You should see the browser running in `headless: false` mode.

