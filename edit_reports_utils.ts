// Reports edit
function swapFermentersReport(currentFermenter: string, newFermenter: string): void {
    // Get nested iframe container and inner document
    const firstIframe: HTMLIFrameElement | null = document.querySelector('iframe');
    if (firstIframe) {
        const firstInnerDoc: Document | null = firstIframe.contentDocument

        if (firstInnerDoc) {
            const secondIframe: HTMLIFrameElement | null = firstInnerDoc.querySelector('iframe');

            if (secondIframe) {
                const secondInnerDoc: Document | null = secondIframe.contentDocument

                if (secondInnerDoc) {
                    // Swap fermenters in reportName + description
                    let reportName = secondInnerDoc.getElementById("txtReportName") as HTMLInputElement
                    reportName.value = reportName.value.replace(currentFermenter, newFermenter)

                    // TODO SWAP DESCRIPTION
                    let reportDescription = document.getElementById("reportDescription") as HTMLInputElement
                    reportDescription.value = reportDescription.value.replace(currentFermenter, newFermenter)

                    // TODO SWAP
                    let filterCriteriaVal = Array.from(document.getElementsByClassName("filterCriteria_Value") as HTMLCollectionOf<HTMLSpanElement>) 
                    let goodEle = null;

                    for(let i = 0; i < filterCriteriaVal.length; i++) {
                        if (filterCriteriaVal[i].innerHTML === currentFermenter) {
                            goodEle = filterCriteriaVal[i];
                            break;
                        }
                    }
                    console.log(goodEle);

                    // TODO CLICK + EDIT + SAVE

                }
                else {
                    throw new Error("Could not find iframe.contentDocument.")
                }
            }
            else {
                throw new Error("No iframeElement found.")
            }

        }
        else {
            throw new Error("Could not find iframe.contentDocument.")
        }
    }
    else {
        throw new Error("No iframeElement found.")
    }
}