function getLineAreaCharts(parentComponents) {
    return parentComponents.filter(function (chart) {
        // Check if it contains a <path> with 'd' attribute starting with 'M' and 'L' (typical for lines)
        var hasLineOrArea = chart.querySelector('svg path[d^="M"][d*="L"]');
        // Check if it doesn't have the arcs typical for pie charts
        var notPie = !chart.querySelector('svg path[d^="M"][d*="A"]');
        return hasLineOrArea && notPie;
    });
}
function changeSizeSelectCharts(selectCharts, newWidthPx, newHeightPx) {
    selectCharts.forEach(function (element) {
        if (element) { // Check if element exists
            element.style.width = "".concat(newWidthPx, "px");
            element.style.height = "".concat(newHeightPx, "px");
        }
    });
}
// Get all dashboard components
var dashboardComponents = document.getElementsByClassName("componentWrapper componentLoading dropshadow ui-resizable ui-draggable ui-draggable-handle");
var dbCompArr = Array.from(dashboardComponents);
// Select line and area charts + modify width/height of main component
var lineCharts = getLineAreaCharts(dbCompArr);
console.log(lineCharts);
changeSizeSelectCharts(lineCharts, 225, 550);
console.log(lineCharts);
