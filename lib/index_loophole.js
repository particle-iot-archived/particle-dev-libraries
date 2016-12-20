'use babel';

import {registerCommands, unregisterCommands} from './commands';
import {libraryAddCommand} from './library_add';
import {libraryMigrateCommand} from './library_migrate';
import {libraryInitCommand} from './library_init';
import {libraryContributeCommand} from './library_contribute';
import {libraryPublishCommand} from './library_publish';
import {projectInitCommand} from './project_init';
import {core, toolBar} from './index';
import {LibrariesPanelView} from './views/libraries_panel';


function activate() {
	const librariesShow = () => {
		core().openPane('libraries', 'left');
	};

	registerCommands(atom, toolBar(), {
		libraryAddCommand,
		libraryMigrateCommand,
		libraryInitCommand,
		libraryContributeCommand,
		libraryPublishCommand,
		librariesShow,
		projectInitCommand
	});

	atom.workspace.addOpener((uriToOpen) => {
		if (!this.librariesPanel) {
			this.librariesPanel = new LibrariesPanelView();
		}
		if (uriToOpen === this.librariesPanel.getUri()) {
			return this.librariesPanel;
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
