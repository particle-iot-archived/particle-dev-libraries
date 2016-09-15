'use babel';

const {View} = require('atom-space-pen-views');
import {MiniEditorView} from 'particle-dev-views';
import {packageName} from './util/package-helper';
import {findModalPanelWithClass} from './views';
const {LibraryInitCommandSite, LibraryInitCommand} = require('./cli');

// use flexbox
// populate with directory - the current project with the last directory selected
// if no directory, then use home directory with /newlibrary suffix
// last directory component used to pre-populate the library name

class DevLibraryInitCommandSite extends LibraryInitCommandSite {

	constructor() {
		super();
	}

	yeomanAdapter() {
		throw new Error('not implemented');
	}

	yeomanEnvironment() {
		throw new Error('not implemented');
	}

	options() {
		return {};
	}

	args() {
		return [];
	}
}

class ValidatingEditorView extends MiniEditorView {

}

const viewClass = 'particle-library-init';


class DevLibraryInitView extends View {

	initialize(directory, outcome) {
		this.outcome = outcome;
		this.defaultDirectory = directory;
		this.addClass(viewClass);
	}

	static content() {
		const content = this.div((...args) => {
			this.div({ id: 'library-init-view', class: packageName()},() => {
				this.div({class: 'block' }, () => {
					this.span('Initialize a new library');
				});

				this.subview('name', new ValidatingEditorView('library name'));
				this.subview('author', new ValidatingEditorView('author'));
				this.subview('version', new ValidatingEditorView('version'));

				this.div({class:'block'}, () => {
					this.button({class: 'btn primary', outlet:'proceedButton', click: 'proceed'}, 'Initialize');
					this.button({class: 'btn', outlet: 'cancelButton', click: 'cancel2'}, 'Cancel');
				});

			});
		});
		return content;
	}

	proceed() {
		const result = this.capture(['name', 'author', 'version']);
		this.close(result);
	}

	cancel() {
		this.close();
	}

	cancel2() {
		this.close();
	}

	close(result) {
		if (this.outcome) {
			this.outcome(result);
		}
	}

	capture(items) {
		const result = {};
		for (let idx in items) {
			const name = items[idx];
			const editor = this[name];
			result[name] = editor.getModel().getText();
		}
		return result;
	}


	setEnabled(enabled) {
		const items = [this.name, this.author, this.version];
		const buttons = [this.proceedButton, this.cancelButton];
		this.enableEditors(items, enabled);
		this.enableButtons(buttons, enabled);
	}

	enableEditors(items, enabled) {
		for (let idx in items) {
			items[idx].setEnabled(enabled);
		}
	}

	enableButtons(buttons, enabled) {
		for (let idx in buttons) {
			const button = buttons[idx];
			const disabled = 'disabled';
			if (enabled) {
				button.removeAttr(disabled);
			} else {
				button.attr(disabled, disabled);
			}
		}
	}
}

export function findLibraryInitPanel(atom=global.atom) {
	return findModalPanelWithClass(atom, viewClass);
}

export function closeLibraryInitPanel(atom) {
	const panel = findLibraryInitPanel(atom);
	if (panel) {
		panel.item.close();
	}
}

export function libraryInitCommand(atom, directory) {
	const view = new DevLibraryInitView(directory);
	const panel = atom.workspace.addModalPanel({item: view});
	view.outcome = (result) => {
		panel.destroy();
		if (result) {

		}
	};
}
