const puppeteer = require("puppeteer");
const dotenv = require("dotenv");
const path = require("path")
const fs = require('fs');


const dotenvFile = path.join("..", ".env")
dotenv.config({path: dotenvFile})


// Puppeter driver config
const pptrLaunchParams = {
    product: "chrome",
    headless: false,
    viewPort: {
        width: 1080,
        height: 1024
    },
    downloadTimeout: 5000
}
const savePath = path.join(__dirname, "..", "data")

// Ekos related data
const ekosLoginUrl = "https://login.goekos.com/";

const reportNameQuerries = [
    "CQ data - brewInfo",
    "CQ - Ingredients (completed)",
    "CQ data - Fermentation (all-progress)"
]
const newReportFileNames = ["brewinfo.csv", "ingredients.csv", "fermentation.csv"]

// Helper for deprecated waitForTimeout
async function pageTimeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Rename report file once downloaded
function renameDownload(savePath, newName) {
    fs.readdir(savePath, (err, files) => {
        if (err) throw err;
        // Rename the newly download file
        for (const file of files) {
            if (path.extname(file) === ".csv" && !newReportFileNames.includes(file)) {
                fs.rename(path.join(savePath, file), path.join(savePath, newName), err => {
                    if (err) throw err;
                });
            }
        }
    });
}
// Clear data folder
function clearData(savePath) {
    fs.readdir(savePath, (err, files) => {
        if (err) throw err;
        for (const file of files) {
            // Delete exising file with target name
            if (file) {
                fs.unlink(path.join(savePath, file), err => {
                    if (err) throw err;
                });
            }
        }
    });
}
module.exports = { clearData };

// Main function to fetch Ekos data
async function fetchEkosData(launchParams) {
    // Clear data folder
    clearData(savePath);

    // Launch browser
    const browser = await puppeteer.launch(launchParams);
    const page = await browser.newPage();

    // Set download path
    const client = await page.target().createCDPSession();
    await client.send('Page.setDownloadBehavior', {
    behavior: 'allow',
    downloadPath: savePath
    });


    // navigate to Ekos login page and set viewPort
    await page.goto(ekosLoginUrl);
    await page.setViewport(launchParams.viewPort);

    // Input credentials and login
    await page.waitForSelector(".input_wrapper");
    await page.type("#txtUsername", process.env.EKOS_USERNAME, {delay: 5})
    await page.type("#txtPassword", process.env.EKOS_PASSWORD, {delay: 5})
    await page.click("#btnLogin")
    
    // Open the reporting main section
    await page.waitForSelector("button.nav-option:nth-child(6)")
        .then(button => button.click());
    
    await page.waitForSelector("a.nav-option:nth-child(1)")
        .then(button => button.click());
    
    // *** Fetch relevant reports ***
    for (let i = 0; i < reportNameQuerries.length; i++) {
        let reportName = reportNameQuerries[i];
        // Type in report name and naviguate to report page
        const reportSearchBoxSelector = 
            "input.sc-uVWWZ.jjluET.sc-Nxspf.dXYREZ.ReportsList__StyledSearchInput-reports-ui__sc-wzkmmj-2.iBbXOq";
        await page.waitForSelector(reportSearchBoxSelector);
                
        await page.evaluate((selector) => {    // clear the field
            document.querySelector(selector).value = "";
        }, reportSearchBoxSelector);

        await page.type(
            reportSearchBoxSelector, 
            reportName,
            {delay: 3});

        // Wait for a selector that contains the reportName in its innerHTML
        const reportLinkSelector = ".Link-reports-ui__sc-81gbfs-0.ddnYoF";
        
        // click on single report
        await pageTimeout(3000)    //TODO FIND BETTER WAY BUT TEMP FIX
        await page.waitForSelector(reportLinkSelector)
            .then(a => a.click());

        // Wait for loading indicator to finish
        await page.waitForSelector(".loading-indicator");
        await page.waitForSelector(".loading-indicator", {hidden: true});

        // Get the report body which is nested inside iframe
        let iframe = await page.waitForSelector("iframe").then(iframe => iframe.contentFrame());
        
        await iframe.waitForSelector(".button_section");
        await iframe.waitForSelector(".buttonGroupOuter")
            .then(button => button.click());

        // Download the report and rename it
            await iframe.waitForSelector(".buttonGroupOptions")
        await iframe.waitForSelector("#csv_export")
            .then(button => button.click())
            .then(console.log("Started downloading report: " + reportName));
        await pageTimeout(launchParams.downloadTimeout)    // No puppeteer wait for download to finish, so we wait 5s
            .then(console.log(`Finished ${launchParams.downloadTimeout} timeout for download.`))
        // Rename the file
        renameDownload(savePath, newReportFileNames[i]);
        console.log("Renamed report to " + newReportFileNames[i]);
        await iframe.waitForSelector(".CloseButton")
            .then(button => button.click());
    }

    await browser.close();
}

// Call main function driver
try {
    fetchEkosData(pptrLaunchParams);
} catch (error) {
    console.log(error);
}
