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

