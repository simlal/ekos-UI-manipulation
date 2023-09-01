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

// Get all dashboard components
const dashboardComponents: HTMLCollectionOf<Element> = document.getElementsByClassName(
    "componentWrapper componentLoading dropshadow ui-resizable ui-draggable ui-draggable-handle"
);
const dbCompArr: Array<HTMLDivElement> = Array.from(dashboardComponents) as Array<HTMLDivElement>;

// Select line and area charts + modify width/height of main component
const lineCharts = getLineAreaCharts(dbCompArr);
console.log(lineCharts);
changeSizeSelectCharts(lineCharts, 225, 550);
console.log(lineCharts);
