'use babel';

import path from 'path';
const {View, $$} = require('atom-space-pen-views');
import {LibraryCard} from './library_card';

export class LibrariesListView extends View {
	initialize() {
		this.setItems([]);
	}

	static content() {
		const content = this.ul((...args) => {
			this.div({outlet: 'content'});
			this.div({outlet: 'communityLoader'}, () => {
				this.progress({'class': 'inline-block'});
			});
		});
		return content;
	}

	setLoading() {
		this.content.empty();
		this.communityLoader.show();
	}

	setItems(items) {
		this.communityLoader.hide();
		this.items = items;
		for (let item of this.items) {
			let card = new LibraryCard();
			card.setLibrary(item);
			this.content.append(card);
		}
	}
}
