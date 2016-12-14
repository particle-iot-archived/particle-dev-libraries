'use babel';

import path from 'path';
const {View, TextEditorView} = require('atom-space-pen-views');
import {LibrariesListView} from './libraries_list'
import {fetchApiClient} from '../library';

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
			this.h2('Community Libraries');
			this.subview('community', new LibrariesListView());
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
		this.community.setLoading();
		fetchApiClient().libraries({filter: query}).then((libraries) => {
			this.community.setItems(libraries);
		});
	}
}
