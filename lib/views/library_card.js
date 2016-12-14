'use babel';

import path from 'path';
const {View, $$} = require('atom-space-pen-views');

export class LibraryCard extends View {
	initialize() {
	}

	static content() {
		const content = this.li({
			class: 'library-card'
		}, (...args) => {
			this.div({outlet: 'content'});
		});
		return content;
	}

	setLibrary(library) {
		this.library = library;

		this.content.append($$(function() {
			this.div({class: 'stats pull-right'}, () => {
				this.span(() => {
					this.span({class: 'icon icon-cloud-download'});
					this.span(library.installs);
				});
			});
			this.div(() => {
				this.h4({'class': 'card-name'}, () => {
					this.span({'class': 'library-name'}, `${library.name} `);
					this.span(library.version);
				});

				let description = library.sentence;
				if (library.paragraph) {
					description += `. ${library.paragraph}`;
				}

				this.span(description);
			});
		}));
	}
}
