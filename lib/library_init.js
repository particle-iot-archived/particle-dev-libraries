'use babel';

import {validateField} from 'particle-cli-library-manager';
const {View} = require('atom-space-pen-views');
import {MiniEditorView} from 'particle-dev-views';
import {packageName} from './util/package-helper';
import {findModalPanelWithClass} from './views';
const {LibraryInitCommandSite, LibraryInitCommand} = require('./cli');
import path from 'path';
import _ from 'lodash';

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

function validationMessage(validationResult, fieldName) {
	return validationResult.errors[fieldName];
}

function fieldValidator(fieldName) {
	const validator = (value) => {
		const result = validateField(fieldName, value);
		return (result && result.valid) ?
			'' : validationMessage(result, fieldName);
	};
	return validator;
}

class ValidatingEditorView extends MiniEditorView {

	/**
	 * Wraps the MiniEditorView content
	 * @returns {*}
	 *
	 * todo - perhaps use composition here?
	 */
	static content() {
		return this.div({class:'particle-validating-editor block'}, () => {
			MiniEditorView.content.bind(this)();
			this.div({ class: 'text-error block', outlet: 'errorLabel' });
		});
	}

	/**
	 *
	 * @param {string} placeholderText
	 * @param {function} validation A function that returns a validation error for the field, or
	 * a falsey value if the field is valid.
	 */
	initialize(placeholderText, validator) {
		super.initialize(placeholderText);
		this.validator = validator;
	}

	/**
	 * Validate the input and set the error text accordintly.
	 * If there is no validation error, the error text is clared.
	 */
	validate() {
		const msg = this.validator ? this.validator(this.value) : '';
		this.error = msg;
	}

	set error(msg) {
		this.errorModel.text(msg);
	}

	get error() {
		return this.errorModel.text();
	}

	get editorModel() {
		return this.editor.getModel();
	}

	get errorModel() {
		return this.errorLabel;
	}

	get value() {
		return this.editorModel.getText();
	}

	set value(value) {
		this.editorModel.setText(value);
		this.validate();
	}

}

const viewClass = 'particle-library-init';


class DevLibraryInitView extends View {

	initialize(directory, outcome) {
		this.outcome = outcome;
		this.defaultDirectory = directory;
		this.addClass(viewClass);

		this.fields = ['directory', 'name', 'author', 'version'];
		const libraryName = path.basename(this.defaultDirectory);
		if (libraryName) {
			this.name.editorModel.setText(libraryName);
		}
	}

	static buildValidator(placeholder, fieldName) {
		return new ValidatingEditorView(placeholder, fieldValidator(fieldName));
	}

	static content() {
		const content = this.div((...args) => {
			this.div({ id: 'library-init-view', class: packageName()},() => {
				this.div({class: 'block' }, () => {
					this.span('Initialize a new library');
				});

				this.subview('directory', this.buildValidator('Directory'));
				this.subview('name', this.buildValidator('Library name', 'name'));
				this.subview('author', this.buildValidator('Author', 'author'));
				this.subview('version', this.buildValidator('Version', 'version'));
				this.div({class:'block'}, () => {
					this.button({class: 'btn primary', outlet:'proceedButton', click: 'proceed'}, 'Initialize');
					this.button({class: 'btn', outlet: 'cancelButton', click: 'cancel'}, 'Cancel');
				});

			});
		});
		return content;
	}

	proceed() {
		if (this.isValid()) {
			const result = this.buildResult();
			this.close(result);
		}
	}

	isValid() {
		return _.isEmpty(this.captureErrors());
	}

	buildResult() {
		const result = this.captureValues(this.fields);
		result.dryRun = this.dryRun;
		return result;
	}

	cancel() {
		this.close();
	}

	close(result) {
		if (this.outcome) {
			this.outcome(result);
		}
	}

	forEachFieldEditor(handler, items=this.fields) {
		for (let idx in items) {
			const name = items[idx];
			const editor = this[name];
			handler(editor, name);
		}
	}

	captureValues(items=this.fields) {
		const result = {};
		this.forEachFieldEditor((editor, name) => {
			result[name] = editor.value;
		},items);
		return result;
	}

	captureErrors(items=this.fields) {
		const result = {};
		this.forEachFieldEditor((editor, name) => {
			editor.validate();
			const error = editor.error;
			if (error) {
				result[name] = error;
			}
		}, items);
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
		if (result && !result.dryRun) {

		}
	};
}
