#Ekos UI manipulation

Manipulate the Ekos UI in the browser with TypeScript

## Quick install
### Requirements
- npm
- TypeScript

### Steps
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
    "lib": ["DOM", "ES2016"],
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
##Usage
Transpile to .js and use utility functions
```bash
tsc edit_components_utils.ts
```
For example, in a dashboard session copy paste the `selectDashboardComponents()` and `moveSelectedComponents(incrementValueTop, incrementValueLeft, dashboardComponents)` in the console the call the functions as necessary.


