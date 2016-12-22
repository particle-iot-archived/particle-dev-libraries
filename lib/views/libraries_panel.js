'use babel';

import {Notification} from 'atom';
const {View, TextEditorView} = require('atom-space-pen-views');
const {LibraryListCommandSite, LibraryListCommand} = require('../cli');
import {LibrariesListView} from './libraries_list';
import {runCommand, fetchApiClient} from '../library';

let target = {};
let fetchPromise;

export function listingLibrariesErrorNotification() {
	return new Notification('error', 'There was an error while listing libraries. Please try again later.', {
		dismissable: true
	});
}

class DevLibraryListCommandSite extends LibraryListCommandSite {
	constructor(filter) {
		super();
		this._filter = filter;
	}

	sections() {
		return {
			'mine' : {},
			'popular': {}
		};
	}

	settings() {
		return {
			filter: this._filter
		};
	}

	target() {
		return target;
	}

	apiClient() {
		return fetchApiClient();
	}
}

export class LibrariesPanelView extends View {
	initialize() {
		this.searchEditor.getModel().onDidStopChanging(() => {
			this.fetchLibraries(this.searchEditor.getModel().getText());
		});

		this.fetchLibraries('');
	}

	static content() {
		const content = this.div({id: 'libraries-panel'}, (...args) => {
			this.h1('Particle Libraries');
			this.div({'class': 'editor-container'}, () => {
				this.subview('searchEditor', new TextEditorView({mini: true, placeholderText: 'Search libraries'}));
			});
			this.h2('My Libraries');
			this.subview('mine', new LibrariesListView());
			this.h2('Popular Libraries');
			this.subview('popular', new LibrariesListView());
		});
		return content;
	}

	getTitle() {
		return 'Particle Libraries';
	}

	getPath() {
		return 'libraries';
	}

	getUri() {
		return `particle-dev://editor/${this.getPath()}`;
	}

	fetchLibraries(query) {
		if (fetchPromise) {
			return;
		}
		this.mine.setLoading();
		this.popular.setLoading();
		const list = new LibraryListCommand();
		fetchPromise = runCommand(new DevLibraryListCommandSite(query).run(list, {})).then(() => {
			this.mine.setItems(target.mine);
			this.popular.setItems(target.popular);
			fetchPromise = undefined;
		}).catch(err => {
			atom.notifications.addNotification(listingLibrariesErrorNotification());
			console.error(err);
			fetchPromise = undefined;
		});

		return fetchPromise;
	}
}
