'use babel';

const {View, $$} = require('atom-space-pen-views');
import shell from 'shell';

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

	cleanAuthor(author) {
		return author.replace(/\<.*\>/, '').trim();
	}

	setLibrary(library) {
		this.library = library;
		let self = this;

		this.content.append($$(function render() {
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
			this.div({'class': 'meta'}, () => {
				this.div({'class': 'meta-user'}, () => {
					this.span({'class': 'author'}, self.cleanAuthor(library.author));
				});
				this.div({'class': 'meta-controls'}, () => {
					this.div({'class': 'btn-toolbar'}, () => {
						this.div({'class': 'btn-group'}, () => {
							if (library.repository) {
								this.button({
									type: 'button',
									'class': 'btn icon icon-mark-github',
									id: 'view-on-github'
								}, 'View on GitHub');
							}
						});
					});
				});
			});
		}));

		this.find('#view-on-github').on('click', () => {
			shell.openExternal(library.repository);
		});
	}
}
