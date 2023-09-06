// Helper functions
function getDocumentFromIframe(iframe: HTMLIFrameElement | null): Document | null {
    if (!iframe) return null
    return iframe.contentDocument || null
}

async function waitForElement(selector: string, parent: Document | HTMLElement = document, timeout: number = 10000): Promise<Element> {
    return new Promise((resolve, reject) => {
        const element = parent.querySelector(selector)
        if (element) {
            resolve(element)
            return
        }

        const observer = new MutationObserver(() => {
            const element = parent.querySelector(selector)
            if (element) {
                resolve(element)
                observer.disconnect()
            }
        })

        observer.observe(parent, {
            childList: true,
            subtree: true
        })

        // Timeout to reject promise after waiting for a while
        setTimeout(() => {
            observer.disconnect()
            reject(new Error(`Element with selector "${selector}" not found within timeout period.`))
        }, timeout)
    })
}

async function waitForElementWithInnerHTML(selector: string, desiredInnerHTML: string, parent: Document | HTMLElement = document, timeout: number = 10000): Promise<Element | null> {
    return new Promise((resolve, reject) => {
        const checkElement = () => {
            const elements = parent.querySelectorAll(selector);
            elements.forEach(ele => {
                if (ele.innerHTML === desiredInnerHTML) {
                    return ele;
                }
            })
            return null;
        };

        const existingElement = checkElement();
        if (existingElement) {
            resolve(existingElement);
            return;
        }

        const observer = new MutationObserver(() => {
            const element = checkElement();
            if (element) {
                resolve(element);
                observer.disconnect();
            }
        });

        observer.observe(parent, {
            childList: true,
            subtree: true
        });

        // Timeout to reject promise after waiting for a while
        setTimeout(() => {
            observer.disconnect();
            reject(new Error(`Element with selector "${selector}" having innerHTML "${desiredInnerHTML}" not found within timeout period.`));
        }, timeout);
    });
}



function waitForMutation(targetNode: Node, config: MutationObserverInit): Promise<MutationRecord[]> {
    return new Promise((resolve, reject) => {
        const observer = new MutationObserver((mutationsList, observer) => {
            resolve(mutationsList)
            observer.disconnect()
        })

        observer.observe(targetNode, config)
    })
}

function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

async function swapFermentersReport(
    currentFermenter: string,
    newFermenter: string,
    useDomMutation: boolean=false
): Promise<void> {
    const firstInnerDoc = getDocumentFromIframe(document.querySelector('iframe'))
    if (!firstInnerDoc) throw new Error("No first iframe or contentDocument found.")

    const secondInnerDoc = getDocumentFromIframe(firstInnerDoc.querySelector('iframe'))
    if (!secondInnerDoc) throw new Error("No second iframe or contentDocument found.")

    // Swap fermenters in reportName + description
    const reportName = secondInnerDoc.getElementById("txtReportName") as HTMLInputElement
    if (reportName.value.startsWith("Copy of ")) {
        reportName.value = reportName.value.replace("Copy of ", "")
    }
    reportName.value = reportName.value.replace(currentFermenter, newFermenter)

    const reportDescription = secondInnerDoc.getElementById("reportDescription") as HTMLInputElement
    reportDescription.value = reportDescription.value.replace(currentFermenter, newFermenter)

    // Swap fermenters in batchLocation filter + save newVal
    let fermenterCriteriaEle: HTMLSpanElement | null = null
    const filterLinks: NodeListOf<HTMLAnchorElement> = secondInnerDoc.querySelectorAll(".filterCriteriaEditLink")
    
    filterLinks.forEach(ele => {
        let eleChilds = Array.from(ele.children)
        eleChilds.forEach(nestedEle => {
            if (nestedEle.innerHTML === currentFermenter) {
                fermenterCriteriaEle = ele
            }
        })
    })

    // Filter swap based on DomMutation state
    if (useDomMutation && fermenterCriteriaEle) {
        await fermenterCriteriaEle.click()
        await waitForMutation(secondInnerDoc, { childList: true, subtree: true })
        
        const filterEditModeEle: HTMLDivElement | null = secondInnerDoc.querySelector(".filterFieldEdit_Value")
        if (filterEditModeEle) {
            filterEditModeEle.children[0].childNodes.forEach(ele => {
                if ("value" in ele && ele.value === currentFermenter) {
                    ele.value = newFermenter
                }
            })
        }

        const saveFilterEdit: HTMLAnchorElement | null = secondInnerDoc.querySelector(".filterFieldEdit_Save")
        if (saveFilterEdit) {
            saveFilterEdit.click()
        }
    } else if (fermenterCriteriaEle) {    // Use basic timeout 
        fermenterCriteriaEle.click()
        await delay(500)
        await waitForElement(".filterFieldEdit_Value", secondInnerDoc) 
        const filterEditModeEle: HTMLDivElement | null = secondInnerDoc.querySelector(".filterFieldEdit_Value")
        if (filterEditModeEle) {
            filterEditModeEle.children[0].childNodes.forEach(ele => {
                if ("value" in ele && ele.value === currentFermenter) {
                    ele.value = newFermenter
                }
            })
        }

        await delay(500)
        await waitForElement(".filterFieldEdit_Save", secondInnerDoc)
        const saveFilterEdit: HTMLAnchorElement | null = secondInnerDoc.querySelector(".filterFieldEdit_Save")
        if (saveFilterEdit) {
            saveFilterEdit.click()
            await delay(1000)
            console.log("Now saving and exiting")
        }
    }

    // Wait for completed save and close
    // TODO FIX ASYNC FUNC TO FIND PROPER ELE
    // await waitForElementWithInnerHTML(".filterCriteriaEditLink", newFermenter, secondInnerDoc)
    // wait 1000ms in the meantime
    await delay(1000)
    const saveReportButton = secondInnerDoc.querySelector(".SaveButton")! as HTMLDivElement
    saveReportButton.click()

    try {
        await waitForElement('.success', secondInnerDoc)
        const closeButtons = secondInnerDoc.querySelectorAll(".CloseButton")! as NodeListOf<HTMLDivElement>
        closeButtons.forEach(div => {
            const closeButtonParent = div.parentElement! as HTMLButtonElement
            const onClickValue = closeButtonParent.getAttribute("onclick")
            if (onClickValue === "local_closeForm();") {
                closeButtonParent.click()

            }
        })
    } catch (err) {
        console.error("Failed to find the success message:", err)
    }
}


function copyAndEditReports(currentFermenter: string, newFermenter:string): void{
    // For a current list of report based on a search criteria
    const reports = document.querySelectorAll("[class*='Link-reports-ui']") as NodeListOf<HTMLAnchorElement>
    reports.forEach(anchor => {
        anchor.click()
        window.addEventListener("DOMContentLoaded", (event) => {
            // TODO FINISH SEQUENCE EXECTION
        })
    })
}