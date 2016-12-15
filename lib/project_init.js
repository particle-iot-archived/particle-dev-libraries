'use babel';

import path from 'path';
import _ from 'lodash';
const {View} = require('atom-space-pen-views');
import {MiniEditorView} from 'particle-dev-views';
import {packageName} from './util/package-helper';
import {findModalPanelWithClass} from './views';
const {ProjectInitCommandSite, ProjectInitCommand} = require('./cli');

class ValidatingEditorView extends MiniEditorView {

	/**
	 * Wraps the MiniEditorView content
	 * @returns {*}
	 *
	 * todo - perhaps use composition here rather than inheritance?
	 */
	static content() {
		return this.div({class:'particle-validating-editor block'}, () => {
			MiniEditorView.content.bind(this)();
			this.div({ class: 'text-error block', outlet: 'errorLabel' });
		});
	}

	/**
	 *
	 * @param {string} placeholderText  Text to display when the editor is empty.
	 * @param {function} validator A function that returns a validation error for the field, or
	 *  a falsey value if the field is valid. Can be undefined.
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

const viewClass = 'particle-project-init';

/**
 * The stages to creating a project:
 * - prompt for a path for the project
 * - as the user types, the path is validated. If the path is not a valid project path, already exists, or cannot be
 *  accessed an error message is shown in a text box below and the OK button disabled.
 * - cancel can be hit at any time to skip project init
 * - once a valid project path is entered and OK hit, project creation begins (both OK and cancel buttons are hidden,
 *  and the project path is non-editable)
 * - the status is set to "initializing project"
 * - when the project creation is complete, the status is set to "Project initialized".  Cancel button is changed to "All done" and displayed.
 */
class DevProjectInitView extends View {

	initialize() {
		this.addClass(viewClass);
		this.fields = ['directory'];
	}

	static buildValidator(placeholder, fieldName) {
		return new ValidatingEditorView(placeholder/*, fieldValidator(fieldName)*/);
	}

	// use this.directoryEditor.getModel().onDidStopChanging(() => {}) to watch for changes

	static content() {
		const content = this.div((...args) => {
			this.div(() => {
				this.h2(() => {
					this.span('Start a new Particle project');
				});
				this.li(() => {
					this.span('Please entere where you would like the new project to be created');
				});
				this.li(() => {
					this.subview('directory', this.buildValidator('Project directory', 'directory'));
					this.div({class:'block'}, () => {
						this.span('Current status...it\'s all magnificent');
					}),
					this.div({class:'push-right'}, () => {
						this.button({class: 'btn primary', outlet:'proceedButton', click: 'proceed'}, 'Create');
						this.button({class: 'btn', outlet: 'cancelButton', click: 'cancel'}, 'Cancel');
					});
				});
			});
		});
		return content;
	}

	proceed() {
		if (this.isValid()) {
			this.close();
		}
	}

	isValid() {
		return true; // return _.isEmpty(this.captureErrors());
	}

	cancel() {
		this.close();
	}

	close(result) {
	}

	setEnabled(enabled) {
		const items = [this.directoryText];
		const buttons = [this.proceedButton, this.cancelButton];
		this.enableEditors(items, enabled);
		this.enableButtons(buttons, enabled);
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



export function projectInitPanel(atom=global.atom) {

}

export function findLibraryInitPanel(atom=global.atom) {
	return findModalPanelWithClass(atom, viewClass);
}

export function closeProjectInitPanel(atom) {
	const panel = findLibraryInitPanel(atom);
	if (panel) {
		panel.item.close();
	}
}

class DevProjectInitCommandSite extends ProjectInitCommandSite {

	constructor(atom, fs=require('fs')) {
		super();
		this.atom = atom;
		this.fs = fs;
	}

	/**
	 * Returns (possibly asynchronously) the default root for new projects.
	 */
	defaultProjectRoot() {
		return this.atom.config.get('core.projectHome') ||
			process.env.ATOM_REPOS_HOME ||
			path.join(this.fs.getHomeDirectory(), 'particle');
	}

	/**
	 * Given a proposed project path, normalize it and also split
	 * @param path
	 * @returns {*[]}
	 */
	projectPath(path) {
		const projectPath = this.fs.normalize(path.trim());
		// use _.dasherize() ?
		const projectName = path.basename(projectPath);
		return [path.join(path.dirname(projectPath), projectName), projectName];
	}
}


export function projectInitCommand(atom) {
	const command = new ProjectInitCommand();
	const site = new DevProjectInitCommandSite(atom);

	const view = new DevProjectInitView(atom);
	const panel = atom.workspace.addModalPanel({item: view});
}
