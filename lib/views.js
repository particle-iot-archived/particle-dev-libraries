'use babel';

export function findPanelWithClass(panels, className) {
	for (let idx in panels) {
		const panel = panels[idx];
		const item = panel.getItem();
		if (item.hasClass(className)) {
			return panel;
		}
	}
}

export function findModalPanelWithClass(atom, className) {
	const modals = atom.workspace.getModalPanels();
	return findPanelWithClass(modals, className);
}

/**
 * Removes the trailing slash (backslash or forwardslash) from a pathname. Does not remive it if it is the only
 * thing in the path.
 * @param {string} directory    The directory to remove the trailing slash.
 * @returns {string} the directory without the trailing slash.
 */
export function removeTrailingSlash(directory) {
	return directory.replace(/(.)[\/\\]$/, '$1');
}