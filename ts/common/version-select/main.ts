function initVersionSelect() {
    const oldVersions = ["1.5.x", "1.4.x", "1.3.x", "1.2.x", "1.1.x", "1.0.x"];

    const versionSelect = document.getElementById("VersionSelect");
    if (!(versionSelect instanceof HTMLSelectElement)) return;

    const pathToRootFolderInput = document.getElementById("PathToRootFolder");
    if (!(pathToRootFolderInput instanceof HTMLInputElement)) return;
    const pathToRootFolder = pathToRootFolderInput.value;

    const currentUrl = window.location.href;
    const matchedVersion = oldVersions.find((version) => currentUrl.includes(`/${version}/`));
    if (matchedVersion) {
        versionSelect.value = matchedVersion;

        const headerDocumentationLink = document.getElementById("HeaderDocumentationLink");
        const headerExamplesLink = document.getElementById("HeaderExamplesLink");

        if (headerDocumentationLink instanceof HTMLAnchorElement) {
            headerDocumentationLink.href = headerDocumentationLink.href.replace(/\/documentation/, `/${matchedVersion}/documentation`);
        }
        if (headerExamplesLink instanceof HTMLAnchorElement) {
            headerExamplesLink.href = headerExamplesLink.href.replace(/\/examples/, `/${matchedVersion}/examples`);
        }
    } else {
        versionSelect.value = "LATEST";
    }

    versionSelect.addEventListener("change", () => {
        let selectedVersion = versionSelect.value;
        let updatedUrl = currentUrl;

        oldVersions.forEach((version) => {
            const versionPattern = new RegExp(`/${version}/`);
            if (versionPattern.test(updatedUrl)) {
                updatedUrl = updatedUrl.replace(versionPattern, "/");
            }
        });

        let newUrl = updatedUrl;
        if (updatedUrl.includes("/documentation")) {
            if (selectedVersion !== "LATEST") {
                newUrl = updatedUrl.replace(/\/documentation/, `/${selectedVersion}/documentation`);
            }
        } else if (updatedUrl.includes("/examples")) {
            if (selectedVersion !== "LATEST") {
                newUrl = updatedUrl.replace(/\/examples/, `/${selectedVersion}/examples`);
            }
        } else {
            if (selectedVersion === "LATEST") {
                newUrl = `${pathToRootFolder}/documentation/getting-started`;
            } else {
                newUrl = `${pathToRootFolder}/${selectedVersion}/documentation/getting-started`;
            }
        }

        window.location.href = newUrl;
    });
}

export default initVersionSelect;