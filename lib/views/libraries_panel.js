'use babel';

import path from 'path';
const {View} = require('atom-space-pen-views');
import {LibrariesListView} from './libraries_list'
import {fetchApiClient} from '../library';

export class LibrariesPanelView extends View {
	initialize() {
		fetchApiClient().libraries({name: ''}).then((libraries) => {
			this.community.setItems(libraries);
		});
	}

	static content() {
		const content = this.div({id: 'libraries-panel'}, (...args) => {
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
}
