'use babel';

import path from 'path';
import { Notification } from 'atom';
import { mix } from 'mixwith';
import { core } from './index';
const { View } = require('atom-space-pen-views');
import { Validators, ValidatingEditorView } from './views/validating_editor';
import { packageName } from './util/package-helper';
const { ProjectInitCommandSite, ProjectInitCommand, Projects } = require('./cli');
import Notifier from './mixins/notifier';

import { allowUnsafeEval, allowUnsafeNewFunction } from 'loophole';

const viewClass = 'project-init-view';

export function notifyProjectCreated() {
	return new Notification('info', 'Project successfully created');
}

export function notifyProjectCreationError(error) {
	return new Notification('error', `Error creating a project: ${error}`);
}

/**
 * The stages to creating a project:
 * - prompt for a path for the project
 * - as the user types, the path is validated. If the path cannot be
 *  accessed an error message is shown in a text box below and the OK button disabled.
 * - cancel can be hit at any time to skip project init
 * - once a valid project path is entered and OK hit, project creation begins (both OK and cancel buttons are hidden,
 *  and the project path is non-editable)
 * - the status is set to "initializing project"
 * - when the project creation is complete, the status is set to "Project initialized" and the modal is dismissed
 */
export class DevProjectInitView extends mix(View).with(Notifier) {

	initialize() {
		this.addClass(viewClass);
		this.fields = ['name', 'directory'];
		this.projects = new Projects();
		this._name = '';
		this._directory = '';
		// todo - need a directory path validator
		this.bind(this.directoryEditor, '_directory');
		this.bind(this.nameEditor, '_name', Validators.field('name'));   // todo - use command.validateName()
		this.valuesChanged();
	}

	setup(name, directory) {
		this.nameEditor.value = name;
		this.directoryEditor.value = directory;
	}

	openNewWindow(path) {
		global.atom.open({ 'pathsToOpen': [path] });
	}

	bind(editor, field, validator) {
		editor.value = this[field] || '';
		editor.validator = validator;
		editor.editorModel.onDidStopChanging(() => {
			this[field] = editor.validate() ? editor.value : undefined;
			this.valuesChanged();
		});
	}

	setButtonEnabled(button, enabled, primary) {
		button.toggleClass('disabled', !enabled);
		if (primary) {
			button.toggleClass('btn-primary', enabled);
		}
	}

	valuesChanged() {
		this.setButtonEnabled(this.proceedButton, this.isValid(), true);
	}

	static buildValidator(placeholder) {
		return new ValidatingEditorView({ placeholderText: placeholder });
	}

	// use this.directoryEditor.getModel().onDidStopChanging(() => {}) to watch for changes

	static content() {
		const content = this.div(() => {
			this.div({ class:packageName(), outlet:'content' }, () => {
				this.div({ class:'head' }, () => {
					this.h2({ class:'block' }, 'Create a new Particle project');
				});
				this.div({ class:'body' }, () => {
					this.div(() => {
						this.h3('What is the project called');
						this.subview('nameEditor', this.buildValidator('Project name', 'name'));
					});
					this.div(() => {
						this.h3('Where you would like the new project to be created');
						this.div({ class: 'select-project-directory' }, () => {
							this.subview('directoryEditor', this.buildValidator('Project directory', 'directory'));
							this.button({
								class: 'btn',
								outlet: 'selectDirectoryButton',
								click: 'selectDirectory'
							}, 'Select...');
						});
					});
					this.div(() => {
						this.div({ class: 'block' }, () => {
							//this.span('Current status...it\'s all magnificent');
						});
					});
				});
				this.div({ class:'foot' }, () => {
					this.button({ class: 'btn btn-primary', outlet: 'proceedButton', click: 'proceed' }, 'Create');
					this.button({ class: 'btn', outlet: 'cancelButton', click: 'cancel' }, 'Cancel');
				});
			});
		});
		return content;
	}

	selectDirectory() {
		const { dialog } = require('electron').remote;
		dialog.showOpenDialog({ title:'Parent directory for project', properties:['openDirectory', 'createDirectory'] }, (directories) => {
			if (directories && directories.length === 1 && directories[0]) {
				this.directoryEditor.value = directories[0];
			}
		});
	}

	proceed() {
		const processTemplate = this.command.processTemplate;

		this.command.processTemplate = (content, data) => {
			return allowUnsafeNewFunction(() => {
				return allowUnsafeEval(() => {
					return processTemplate(content, data);
				});
			});
		};

		return this.projects.ensureDirectoryExists(this.directory())
			.then(() => this.site.run(this.command))
			.catch(e => {
				// todo - should this use a Error notification with stack trace?
				console.log(e.stack, e);
				this.error(e);
			});
	}

	isValid() {
		return !!(this._directory && this._name);
	}

	cancel() {
		this.close();
	}

	close() {
		this.panel.destroy();
	}

	// command site interface
	directory() {
		return this._directory;
	}

	name() {
		return this._name;
	}

	notifyProjectCreated(directory) {
		this.projectDirectory = directory;
		this.close();

		if (this.projectDirectory === core().getProjectDir()) {
			this.showNotification(notifyProjectCreated());
		} else {
			const file = path.join(this.projectDirectory, 'README.md');
			this.openNewWindow(file);
		}
	}

	error(error) {
		this.showNotification(notifyProjectCreationError(error));

		this.cancelButton.show();
	}
}



// after looking at multiple inheritance, or the lack of it, and proxies/mixins
// I figured it was just simpler and quicker to hand code the few delegations required
class DevProjectInitCommandSite extends ProjectInitCommandSite {

	constructor(atom, view, fs=require('fs')) {
		super();
		this.atom = atom;
		this.view = view;
		this.fs = fs;
		view.site = this;
	}

	// command site interface
	directory() {
		return path.join(this.view.directory(), this.view.name());
	}

	name() {
		return this.view.name();
	}

	notifyDirectoryExists(directory) {
		return true;
	}

	notifyProjectNotCreated(directory) {
		this.view.close();
	}

	notifyProjectCreated(directory) {
		return this.view.notifyProjectCreated(directory);
	}

	error(error) {
		return this.view.error(error);
	}
}


export function projectInitCommand(atom) {
	const command = new ProjectInitCommand();
	const view = new DevProjectInitView();

	let currentProjectDir = core().getProjectDir();

	if (currentProjectDir) {
		view.setup(path.basename(currentProjectDir), path.dirname(currentProjectDir));
	} else {
		view.projects.myProjectsFolder().then(folder => {
			view.setup('MyProject', folder);
		});
	}

	view.command = command;
	const site = new DevProjectInitCommandSite(atom, view);
	const panel = atom.workspace.addModalPanel({ item: view });
	view.panel = panel;
	return site;
}
