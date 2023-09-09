// import { getDocumentFromIframe, delay } from "./edit_reports_utils"

// CopyPaste to run transpiled js directly in browser, no prob bob
function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
}
function getDocumentFromIframe(iframe: HTMLIFrameElement | null): Document | null {
    if (!iframe) return null
    return iframe.contentDocument || null
}

async function waitForElement(
    selector: string,
    parent: Document | HTMLElement = document,
    multipleElements: boolean = false,
    timeout: number = 10000): Promise<Element | NodeListOf<Element>> {
    return new Promise((resolve, reject) => {

        // Check for existing element
        if (multipleElements) {
            const elements = parent.querySelectorAll(selector)
            if (elements.length > 0) {
                resolve(elements)
                return
            }
        } else {
            const element = parent.querySelector(selector)
            if (element) {
                resolve(element)
                return
            }
        }

        // MutationObserver logic
        const observer = new MutationObserver(() => {
            if (multipleElements) {
                const elements = parent.querySelectorAll(selector)
                if (elements.length > 0) {
                    resolve(elements)
                    observer.disconnect()
                }
            } else {
                const element = parent.querySelector(selector)
                if (element) {
                    resolve(element)
                    observer.disconnect()
                }
            }
        })

        observer.observe(parent, {
            childList: true,
            subtree: true
        })

        // Timeout logic remains the same
        setTimeout(() => {
            observer.disconnect()
            reject(new Error(`Element with selector "${selector}" not found within timeout period.`))
        }, timeout)
    })
}



async function openDashboardEditMode(timeout: number = 500): Promise<[HTMLIFrameElement | null, Document | null]> {
    // Prime iframe + innerDoc + dashboard
    await delay(500)
    const iframe: HTMLIFrameElement | null = await waitForElement("iframe") as HTMLIFrameElement

    const innerDoc = getDocumentFromIframe(document.querySelector("iframe"))
    if (!innerDoc) throw new Error("No first iframe or contentDocument found.")

    const mainDashboard = await waitForElement("#dashboard", innerDoc) as HTMLDivElement;

    // Open edit mode for main dashboard
    if (mainDashboard && (mainDashboard.classList.length === 0 || mainDashboard.className === "")) {
        const editOption = await waitForElement("#ui-id-2", innerDoc) as HTMLLIElement;
        editOption.click();
        await delay(timeout)    // Safety wait

    } else if (!mainDashboard) {
        throw new Error("Could not find element with id='dashboard'")
    }
    return [iframe || null, innerDoc || null]
}

// Dashboard components edit
async function addCopyPasteComponent(
    selectLastNCompo: number,
    topSpacingBetween: number,
    substringTitleToReplace: string,
    substringTitleReplacement: string,
    incrementSelectedReportByNCompo: boolean=true
): Promise<void> {
    // Open dashboard in edit mode
    const [iframe, innerDoc] = await openDashboardEditMode()

    // Get last 11 component (group to copy)
    if (!innerDoc) throw new Error("No document found inside iframe")
    const components: NodeListOf<HTMLDivElement> = innerDoc.querySelectorAll(
        ".componentWrapper.componentLoading.dropshadow.ui-resizable.ui-draggable.ui-draggable-handle"
    )
    const componentsArr = Array.from(components).slice(-selectLastNCompo)

    //  Create and save an empty new component
    const addComponentButton = await waitForElement("#newcomponentArea", innerDoc) as HTMLDivElement
    if (!addComponentButton) { throw new Error("Could not find addComponent button") }

    // Create new empty components
    for (let i: number = 0; i < componentsArr.length; i++) {
        // Add a new empty component and save it
        addComponentButton.click()
        await delay(500)    // Safety for specific applyChanges button to be present in arr
        const componentConfig = await waitForElement("#componentConfig", innerDoc) as HTMLDivElement
        if (!componentConfig) { throw new Error("Could not find new component config div.") }

        // Select default option
        const selectElement = await waitForElement("#componentConfigReport", innerDoc) as HTMLSelectElement;
        if (selectElement.options.length > 0) { 
            selectElement.selectedIndex = 0; 
            const event = new Event('change');
            selectElement.dispatchEvent(event); 
        }

        await delay (500)
        const componentConfigChildren = Array.from(componentConfig.children)
        for (let element of componentConfigChildren) {
            let onClickAttr = element.getAttribute("onclick")
            if (onClickAttr === "dashboard.componentedit_apply();return false;") {
                let applyChangesButton = (element as any) as HTMLButtonElement
                applyChangesButton.click()
            }
        }
        await waitForElement("#newcomponentArea", innerDoc)
        console.log(
            `Created + saved empty component ${i + 1} / ${componentsArr.length}`
        )
    }
    // Modify the properties based on template components
    const newComponents = await waitForElement(
        ".componentWrapper.componentLoading.dropshadow.ui-resizable.ui-draggable.ui-draggable-handle",
        innerDoc,
        true
    ) as NodeListOf<HTMLDivElement>
    if (!newComponents) {
        throw new Error("Could not find the added components.");
    }
    const newCompoArr = Array.from(newComponents).slice(-selectLastNCompo)
    for (let i in componentsArr) {
        // Extract title and style from template
        let title = componentsArr[i].children[0].innerHTML.toUpperCase()
        let newTitle = title.replace(substringTitleToReplace, substringTitleReplacement)

        // Copy styles
        const stylesToCopy = ["min-height", "min-width", "top", "left", "height", "width"];
        for (let propName of stylesToCopy) {
            newCompoArr[i].style[propName as any] = componentsArr[i].style[propName as any]
        }

        // Store width and height
        const compoHeight = parseInt(componentsArr[i].style.height)
        const compoWidth = parseInt(componentsArr[i].style.width)

        // Adjust the styles in the newCompo (non-edit mode)
        let baseTop = parseInt(newCompoArr[i].style.top);
        let newTopVal: number = baseTop + topSpacingBetween;
        newCompoArr[i].style.top = newTopVal.toString() + "px";
        
        newCompoArr[i].children[0].innerHTML = newTitle

        // Get charType from templateComponent
        let oriCompoTitleDiv = componentsArr[i].children[0] as HTMLDivElement
        oriCompoTitleDiv.click()
        
        const oriCompoConfig = await waitForElement("#componentConfig", innerDoc) as HTMLDivElement
        if (!oriCompoConfig) { throw new Error("Could not find original component config div.") }
        
        // Get selected chartype + reportIndex + legend and save
        let selectedChartTypeId: string = ""
        const oriCompoConfigChartTypeUL = innerDoc.getElementById("componentConfigChartType") as HTMLUListElement
        const oriCompoConfigChartTypeULChildren = Array.from(oriCompoConfigChartTypeUL.children)
        for (let oriLiEle of oriCompoConfigChartTypeULChildren) {
            if (oriLiEle.className === "selected") {
                selectedChartTypeId = oriLiEle.id
            }
        }
        let selectElement = await waitForElement("#componentConfigReport", innerDoc) as HTMLSelectElement;
        let selectedOptionOri: number = 0    // Fallback val
        if (selectElement.options.length > 0) { 
            selectedOptionOri = selectElement.selectedIndex
        }
        
        let selectLegendEle = await waitForElement("#componentConfigLegend", innerDoc) as HTMLSelectElement
        let selectedLegendOri: number = 0    // fallback val
        if (selectLegendEle.options.length > 0) { 
            selectedLegendOri = selectLegendEle.selectedIndex
        }

        const oriCompoConfigChildren = Array.from(oriCompoConfig.children)
        for (let element of oriCompoConfigChildren) {
            // save to exit
            let onClickAttr = element.getAttribute("onclick")
            if (onClickAttr === "dashboard.componentedit_apply();return false;") {
                let applyChangesButton = (element as any) as HTMLButtonElement
                applyChangesButton.click()
            }
        }
        await waitForElement("#" + componentsArr[i].id, innerDoc)

        // Adjust title and height/width inside editMode for newCompo
        
        // Open in editMode
        let newCompoTitleDiv = newCompoArr[i].children[0] as HTMLDivElement
        newCompoTitleDiv.click()
        
        const newCompoConfig = await waitForElement("#componentConfig", innerDoc) as HTMLDivElement
        if (!newCompoConfig) { throw new Error("Could not find new component config div.") }
        const newCompoConfigChildren = Array.from(newCompoConfig.children)

        
        // Change to proper selected chartype and save
        const newCompoConfigChartTypeUL = innerDoc.getElementById("componentConfigChartType") as HTMLUListElement
        let newCompoConfigChartTypeChildren = Array.from(newCompoConfigChartTypeUL.children)
        for (let newLiEle of newCompoConfigChartTypeChildren) {
            if (newLiEle.id === selectedChartTypeId) {
                let selectedChartLiEle = newLiEle as HTMLLIElement
                selectedChartLiEle.click()
                await delay(500)
            }
        }
        
        // Change width + height
        let newCompoConfigSizeHeight = innerDoc.getElementById("componentConfigSize_height") as HTMLInputElement
        newCompoConfigSizeHeight.value = compoHeight.toString()

        let newCompoConfigSizeWidth = innerDoc.getElementById("componentConfigSize_width") as HTMLInputElement
        newCompoConfigSizeWidth.value = compoWidth.toString()
        await delay(500)

        // Select same report as ori compo
        selectElement = await waitForElement("#componentConfigReport", innerDoc) as HTMLSelectElement;
        if (selectElement.options.length > 0) { 
            if (incrementSelectedReportByNCompo) { selectedOptionOri += selectLastNCompo}
            selectElement.selectedIndex = selectedOptionOri
            const event = new Event('change');
            selectElement.dispatchEvent(event); 
        }
        
        // Change title
        let newCompoConfigTitle = innerDoc.getElementById("componentConfigTitle") as HTMLInputElement
        newCompoConfigTitle.value = newTitle

        // Select the same legend pos as ori compo
        selectLegendEle = await waitForElement("#componentConfigLegend", innerDoc) as HTMLSelectElement
        if (selectLegendEle.options.length > 0) { 
            selectLegendEle.selectedIndex = selectedLegendOri
            const event = new Event('change');
            selectLegendEle.dispatchEvent(event); 
        }

        // Save to exit
        for (let element of newCompoConfigChildren) {
            let onClickAttr = element.getAttribute("onclick")
            if (onClickAttr === "dashboard.componentedit_apply();return false;") {
                let applyChangesButton = (element as any) as HTMLButtonElement
                applyChangesButton.click()
            }
        }
    console.log(`Done final copyEditPaste for compo ${i + 1} / ${componentsArr.length}}`)
    }
}

function selectDashboardComponents(): Array<HTMLDivElement> | void {
    // Get dashboard inside iframe container
    const iframe: HTMLIFrameElement | null = document.querySelector('iframe');
    if (iframe) {
        const innerDoc = getDocumentFromIframe(iframe)

        if (innerDoc) {
            const mainDashboard = innerDoc.getElementById("dashboard") as HTMLDivElement;
            // Open edit mode for main dashboard
            if (mainDashboard && (mainDashboard.classList.length === 0 || mainDashboard.className === "")) {
                const editOption = innerDoc.getElementById("ui-id-2") as HTMLLIElement;
                editOption.click();
            } else if (!mainDashboard) {
                console.log("Could not find element with id='dashboard'");
            }
            // Select dashboard components in edit mode
            const dashboardComponents = Array.from(
                innerDoc.getElementsByClassName(
                    "componentWrapper componentLoading dropshadow ui-resizable ui-draggable ui-draggable-handle"
                ) as HTMLCollectionOf<HTMLDivElement>
            );
            if (!dashboardComponents || dashboardComponents.length === 0) {
                console.log("Could not get dashboardComponents in edit-mode")
                return
            }

            return dashboardComponents
        }
        else {
            console.log("Could not find innerDocument of iframe.")
        }
    }
    else {
        console.log("Could not find iframe element.")
    }

}

function getLineAreaCharts(parentComponents: Array<HTMLDivElement>): Array<HTMLDivElement> {
    return parentComponents.filter(chart => {
        // Check if it contains a <path> with 'd' attribute starting with 'M' and 'L' (typical for lines)
        let hasLineOrArea: Element | null = chart.querySelector('svg path[d^="M"][d*="L"]');
        // Check if it doesn't have the arcs typical for pie charts
        let notPie: boolean = !chart.querySelector('svg path[d^="M"][d*="A"]');

        return hasLineOrArea && notPie;
    });
}

function changeSizeSelectCharts(selectCharts: Array<HTMLDivElement>, newWidthPx: number, newHeightPx: number): void {
    selectCharts.forEach(element => {
        if (element) {  // Check if element exists
            element.style.width = `${newWidthPx}px`;
            element.style.height = `${newHeightPx}px`;
        }
    });
}


function moveSelectedComponents(
    incrementValueTop: number,
    incrementValueLeft: number,
    dashboardComponents: Array<HTMLDivElement>
): void {
    // Validate increment vals
    if (!(incrementValueTop > 0)) {
        throw new Error("incrementValueTop must be greater than 0.")
    }
    if (!(incrementValueLeft > 0)) {
        throw new Error("incrementValueLeft must be greater than 0.")
    }

    dashboardComponents.forEach(component => {
        // Extract position style vals
        let topValue: string = component.style.top
        let leftValue: string = component.style.left

        let topNumber: number | typeof NaN = parseInt(topValue)
        let leftNumber: number | typeof NaN = parseInt(leftValue)
        if (Number.isNaN(topNumber)) {
            topNumber = 0
        }
        if (Number.isNaN(leftNumber)) {
            leftNumber = 0
        }

        // Add increment value to extracted val
        let newTopVal = (topNumber + incrementValueTop).toString() + "px"
        let newLeftVal = (leftNumber + incrementValueLeft).toString() + "px"
    })
}
