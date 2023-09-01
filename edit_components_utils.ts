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
        if(element) {  // Check if element exists
            element.style.width = `${newWidthPx}px`;
            element.style.height = `${newHeightPx}px`;
        }
    });
}

function selectDashboardComponents(): Array<HTMLDivElement> | void {
    // Open edit mode for main dashboard
    const mainDashboard = document.getElementById("dashboard") as HTMLDivElement;

    if (mainDashboard && (mainDashboard.classList.length === 0 || mainDashboard.className === "")) {
        const editOption = document.getElementById("ui-id-2") as HTMLLIElement;
        editOption.click();
    } else if (!mainDashboard) {
        console.log("Could not find element with id='dashboard'");
    }
            
    // Select dashboard components in edit mode
    const dashboardComponents = Array.from(
        document.getElementsByClassName(
            "componentWrapper componentLoading dropshadow ui-resizable ui-draggable ui-draggable-handle"
        ) as HTMLCollectionOf<HTMLDivElement>
    );
    if (!dashboardComponents || dashboardComponents.length === 0) {
        console.log("Could not get dashboardComponents in edit-mode")
        return
    }
    
    return dashboardComponents
}

