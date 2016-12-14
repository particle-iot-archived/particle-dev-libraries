'use babel';

import path from 'path';
const {View, $$} = require('atom-space-pen-views');
import {LibraryCard} from './library_card';

export class LibrariesListView extends View {
	initialize() {
		this.libraries = [];
	}

	static content() {
		const content = this.ul((...args) => {
			this.div({outlet: 'content'});
		});
		return content;
	}

	setItems(items) {
		this.items = items;
		this.content.empty();
		for (let item of this.items) {
			let card = new LibraryCard();
			card.setLibrary(item);
			this.content.append(card);
		}
	}
}
