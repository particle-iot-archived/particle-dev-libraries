'use babel';

import {SelectListView} from 'atom-space-pen-views';
import {EventEmitter} from 'events';
import when from "when";
import {runCommand, noProjectSelectedNotification} from './library';
import {Particle, Client} from 'particle-api-js';

const {LibraryAddCommandSite, LibraryAddCommand} = require('./cli');

import {profileManager} from './index';


/**
 * Wraps a promise in a notification that is presented while the promise runs, and
 * dismissed when the promise is done.
 * @param promise
 * @param message
 */
function progress(promise, message) {

}

/**
 * The view for adding and choosing a library.
 */
class LibraryAddView extends SelectListView {


	initialize(listPromiseFactory, confirmCallback) {
		super.initialize();
		this.listPopulated = 'listPopulated';
		this.events = new EventEmitter();
		this.listPromiseFactory = listPromiseFactory;
		this.confirmCallback = confirmCallback;
		this.addClass('particle-library-add');
		this.panel = atom.workspace.addModalPanel({item: this});
		this.panel.show();
		this.focusFilterEditor();
	}

	viewForItem(item) {
		return `<li>${item}</li>`;
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
		console.log('populate list', filter);
		const promise = this.listPromiseFactory(filter);
		when(promise).then(libraries => {
			console.log('libraries result', libraries);
			if (libraries) {
				const names = libraries.map(lib => lib.name);
				console.log('libraries for', filter, libraries);
				this.setItems(names);
			}
			else {
				console.log('no libraries for', filter);
				this.setItems();
			}
		});
	}

	schedulePopulateList() {
		console.log("schedule populate", super.getFilterQuery());
		this.setLoading('...');
		super.schedulePopulateList();
	}

	confirmed(item) {
		console.log(`${item} was selected`);
		this.close();
		const c = this.confirmCallback;
		if (c) {
			c(item, this);
		}
	}

	cancelled() {
		console.log('This view was cancelled');
		this.close();
	}

	close() {
		this.panel.destroy();
	}
}


class DevLibraryAddSite extends LibraryAddCommandSite {

	constructor(dir, name, version) {
		super();
		this.dir = dir;
		this.setLibraryIdent(name, version);
	}

	setLibraryIdent(name, version) {
		this.name = name;
		this.version = version;
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

function selectAddLibrary(atom, dir) {
	const pm = profileManager();
	const apiClient = pm.apiClient;
	const cmd = new LibraryAddCommand({apiClient});
	const site = new DevLibraryAddSite(dir);
	const listPromiseFactory = (filter) => {
		return cmd.listLibraries(site, filter).then((libraries) => {
			return libraries;
		})
	};

	const view = new LibraryAddView(listPromiseFactory, (name, view) => {
		site.setLibraryIdent(name);
		const promise = site.run(cmd);
		runCommand(promise);
	});
}

export function libraryAddCommand(atom, dir) {
	if (!dir) {
		atom.notifications.addNotification(noProjectSelectedNotification());
	} else {
		selectAddLibrary(atom, dir);
	}
}
