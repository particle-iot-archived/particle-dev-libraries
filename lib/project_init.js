'use babel';

import path from 'path';
import _ from 'lodash';
const {View, $$} = require('atom-space-pen-views');
import {Validators, ValidatingEditorView} from './views/validating_editor';
import {packageName} from './util/package-helper';
import {findModalPanelWithClass} from './views';
const {ProjectInitCommandSite, ProjectInitCommand, Projects} = require('./cli');

import {allowUnsafeEval, allowUnsafeNewFunction} from 'loophole';

const viewClass = 'project-init-view';

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
		this.fields = ['name', 'directory'];
		this.projects = new Projects();
		this._name = '';
		this._directory = '';
		// todo - need a directory path validator
		this.bind(this.directoryEditor, '_directory');
		this.bind(this.nameEditor, '_name', Validators.field('name'));   // todo - use command.validateName()
		this.valuesChanged();
		this.showStep(1);
		this.closeButton.hide();
		this.openButton.hide();
	}

	setup(name, directory) {
		this.nameEditor.value = name;
		this.directoryEditor.value = directory;
	}

	openNewWindow(path) {
		global.atom.open({'pathsToOpen': [path], 'newWindow': true});
	}

	showStep(step) {
		for (let s of [1,2]) {
			const pane = this.content.find('.step'+s);
			if (s===step) {
				pane.show();
			}
			else {
				pane.hide();
			}
		}
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
		button.toggleClass("disabled",!enabled);
		if (primary) {
			button.toggleClass('btn-primary', enabled);
		}
	}

	valuesChanged() {
		this.setButtonEnabled(this.proceedButton, this.isValid(), true);
	}

	static buildValidator(placeholder) {
		return new ValidatingEditorView(placeholder);
	}

	// use this.directoryEditor.getModel().onDidStopChanging(() => {}) to watch for changes

	static content() {
		const content = this.div(() => {
			this.div({class:packageName(), outlet:'content'}, () => {
				this.div({class:'head'}, () => {
					this.h2(() => {
						this.span('Create a new Particle project');
					});
				});
				this.div({class:'body'}, () => {
					this.div({class: 'step1'}, () => {
						this.div(() => {
							this.h3('What is the project called');
							this.subview('nameEditor', this.buildValidator('Project name', 'name'));
						});
						this.div(() => {
							this.h3('Where you would like the new project to be created');
							this.div({class: 'select-project-directory'}, () => {
								this.subview('directoryEditor', this.buildValidator('Project directory', 'directory'));
								this.button({
									class: 'btn',
									outlet: 'selectDirectoryButton',
									click: 'selectDirectory'
								}, 'Select...');
							});
						});
						this.div(() => {
							this.div({class: 'block'}, () => {
								//this.span('Current status...it\'s all magnificent');
							});
						});
					});
					this.div({class: 'step2'}, () => {
						this.div(() => {
							this.p({outlet: 'createMessage'});
							this.p({outlet: 'createError', class: 'text-error'});
						});
					});
				});
				this.div({class:'foot'}, () => {
					this.div({class:'step1'}, () => {
						this.button({class: 'btn btn-primary', outlet: 'proceedButton', click: 'proceed'}, 'Create');
						this.button({class: 'btn', outlet: 'cancelButton', click: 'cancel'}, 'Cancel');
					});
					this.div({class:'step2'}, () => {
						this.button({class: 'btn btn-primary', outlet: 'openButton', click: 'openProject'}, 'Open Project');
						this.button({class: 'btn', outlet: 'closeButton', click: 'close'}, 'Close');
					});
				});
			});
		});
		return content;
	}

	selectDirectory() {
		const {dialog} = require('electron').remote;
		dialog.showOpenDialog({title:'Parent directory for project', properties:['openDirectory', 'createDirectory']}, (directories) => {
			if (directories && directories.length==1 && directories[0]) {
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
				})
			});
		};
		this.createMessage.html(`<p><label>Creating project</label> <span class="name">${this._name}</span></p><p><label>in directory</label> <span class="directory">${this._directory}</span></p>`);
		this.showStep(2);
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

	openProject() {
		if (this.projectDirectory) {
			const file = path.join(this.projectDirectory, 'README.md');
			this.openNewWindow(file);
		} else {
			throw new Error('Cannot open project - project has not been created');
		}
		this.close();
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
		this.createMessage.append(`<p class="success">Project successfully created!</p>`);
		this.createMessage.append(`<p class="next">Click on Open Project to open your new project, or Close to continue without opening.</p>`);
		this.showStep(2);
		this.openButton.show();
		this.closeButton.show();
	}

	error(error) {
		this.createError.html(error);
		this.showStep(2);
		this.closeButton.show();
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

	view.projects.myProjectsFolder().then(folder => {
		view.setup('MyProject', folder);
	});

	view.command = command;
	const site = new DevProjectInitCommandSite(atom, view);
	const panel = atom.workspace.addModalPanel({item: view});
	view.panel = panel;
}
