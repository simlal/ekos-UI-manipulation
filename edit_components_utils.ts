export function getLineAreaCharts(parentComponents: Array<HTMLDivElement>): Array<HTMLDivElement> {
    return parentComponents.filter(chart => {
        // Check if it contains a <path> with 'd' attribute starting with 'M' and 'L' (typical for lines)
        let hasLineOrArea: Element | null = chart.querySelector('svg path[d^="M"][d*="L"]');
        // Check if it doesn't have the arcs typical for pie charts
        let notPie: boolean = !chart.querySelector('svg path[d^="M"][d*="A"]');

        return hasLineOrArea && notPie;
    });
}

export function changeSizeSelectCharts(selectCharts: Array<HTMLDivElement>, newWidthPx: number, newHeightPx: number): void {
    selectCharts.forEach(element => {
        if(element) {  // Check if element exists
            element.style.width = `${newWidthPx}px`;
            element.style.height = `${newHeightPx}px`;
        }
    });
}

export function selectDashboardComponents(): Array<HTMLDivElement> | void {
    // Get dashboard inside iframe container
    const iframe: HTMLIFrameElement | null = document.querySelector('iframe');
    if (iframe) {
        const innerDoc: Document | null = iframe.contentDocument

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

export function moveUpSelectedComponents(
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

