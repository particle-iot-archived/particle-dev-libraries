'use babel';

import {SelectListView} from 'atom-space-pen-views';
import {EventEmitter} from 'events';
import when from 'when';
import {runCommand} from './library';
import {fetchApiClient} from './library';
import {notifyNoProjectSelected} from './library';
import {showLibraryAdded} from './util/notifications';
const {LibraryAddCommandSite, LibraryAddCommand, LibrarySearchCommand} = require('./cli');


/**
 * The view for adding and choosing a library.
 */
class LibrarySelectView extends SelectListView {


	initialize(listPromiseFactory, confirmCallback) {
		super.initialize();
		this.listPopulated = 'listPopulated';
		this.events = new EventEmitter();
		this.listPromiseFactory = listPromiseFactory;
		this.confirmCallback = confirmCallback;
		this.addClass('particle-library-add');
		this.filterEditorView.getModel().setPlaceholderText('Type in the library to add to your project...');
		this.setLoading();
		this.panel = atom.workspace.addModalPanel({item: this});
		this.panel.show();
		this.focusFilterEditor();
	}

	viewForItem(item) {
		return `<li class="two-lines">
				<div class="pull-right"><kbd class="key-binding pull-right">${item.version}</kbd></div>
				<div class="primary-line">
					${item.visibility === 'private' ? '<i class="icon icon-lock" title="Private library"></i>' : ''}
					${item.name}
				</div>
					<div class="secondary-line">${item.sentence}</div>
			</li>`;
	}

	setItems(items=[]) {
		this.items = items;
		super.populateList();
		this.setLoading();
		this.events.emit(this.listPopulated);
	}

	getItems() {
		return this.items;
	}

	getFilterQuery() {
		return [];
	}

	populateList() {
		const filter = super.getFilterQuery();
		const promise = this.listPromiseFactory(filter);
		when(promise).then(libraries => {
			if (libraries) {
				this.setItems(libraries);
			} else {
				this.setItems();
			}
		});
	}

	schedulePopulateList() {
		this.setLoading('Loading libraries...');
		super.schedulePopulateList();
	}

	confirmed(item) {
		this.close();
		const c = this.confirmCallback;
		if (c) {
			c(item.name, this);
		}
	}

	cancelled() {
		this.close();
	}

	close() {
		this.panel.destroy();
	}
}


export class DevLibraryAddSite extends LibraryAddCommandSite {

	constructor(apiClient, dir, name, version) {
		super();
		this._apiClient = apiClient;
		this.dir = dir;
		this.setLibraryIdent(name, version);
	}

	setLibraryIdent(name, version) {
		this.name = name;
		this.version = version;
	}

	apiClient() {
		return this._apiClient;
	}

	projectDir() {
		return this.dir;
	}

	libraryIdent() {
		return { name: this.name, version: this.version };
	}

	notifyListLibrariesStart(promise) {
		return promise;
	}

	notifyListLibrariesComplete(promise, libraries, error) {
		this.libraries = libraries;
	}

	fetchingLibrary(promise, name) {
		return promise;
	}
}

function selectAddLibrary(atom, directory) {
	const command = new LibraryAddCommand();
	const search = new LibrarySearchCommand();
	const apiClient = fetchApiClient();
	const site = new DevLibraryAddSite(apiClient, directory);
	const listPromiseFactory = (filter) => {
		return search.listLibraries(site, filter).then((libraries) => {
			return libraries;
		});
	};

	/*const view =*/new LibrarySelectView(listPromiseFactory, (name, view) => {
		site.setLibraryIdent(name);
		const promise = site.run(command);
		runCommand(promise).then(() => {
			showLibraryAdded({name});
		});
	});
}

export function libraryAddCommand(atom, directory) {
	if (!directory) {
		return notifyNoProjectSelected();
	} else {
		return selectAddLibrary(atom, directory);
	}
}
