'use babel';

import _ from 'lodash';
import url from 'url';
import { packageName } from './util/package-helper';
import { registerCommands, unregisterCommands } from './commands';
import { libraryAddCommand } from './library_add';
import { libraryMigrateCommand } from './library_migrate';
import { libraryInitCommand } from './library_init';
import { libraryContributeCommand } from './library_contribute';
import { libraryPublishCommand } from './library_publish';
import { projectInitCommand } from './project_init';
import { core, toolBar } from './index';

function activate() {
	const librariesShow = () => {
		core().openPane('libraries', 'left', packageName());
	};
	const libraryManagementShow = () => {
		core().openPane('library-management', 'left', packageName());
	};

	registerCommands(atom, toolBar(), {
		libraryAddCommand,
		libraryMigrateCommand,
		libraryInitCommand,
		libraryContributeCommand,
		libraryPublishCommand,
		librariesShow,
		libraryManagementShow,
		projectInitCommand
	});

	atom.workspace.addOpener((uriToOpen) => {
		let uri = url.parse(uriToOpen);
		if (uri.protocol && uri.protocol.slice(0, -1) === packageName()) {
			// Initialize the panel
			let panelName = uri.pathname.replace('-', '_').slice(1);
			if (!this[panelName]) {
				this[panelName] = require(`./views/${panelName}_panel`);
			}
			let className = _.upperFirst(_.camelCase(panelName));
			let panel = new this[panelName][`${className}PanelView`]();
			panel.update();
			return panel;
		}
	});
}

function deactivate() {
	unregisterCommands(atom);
}

function serialize() {
}

export {
	activate,
	deactivate,
	serialize
};
