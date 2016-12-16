'use babel';

const {View, $$} = require('atom-space-pen-views');
import shell from 'shell';
import {core} from '../index';
const {LibraryAddCommand} = require('../cli');
const {DevLibraryAddSite} = require('../library_add');
import {runCommand, fetchApiClient} from '../library';

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

							// TODO: Also allow in libraries
							if (core().isProject()) {
								// TODO: If a library is already added, show different state
								this.button({
									type: 'button',
									'class': 'btn btn-info icon icon-plus',
									id: 'add-to-project'
								}, 'Add to current project');
							}
						});
					});
				});
			});
		}));

		this.find('#view-on-github').on('click', () => {
			shell.openExternal(library.repository);
		});

		this.find('#add-to-project').on('click', () => {
			const command = new LibraryAddCommand();
			const apiClient = fetchApiClient();
			const site = new DevLibraryAddSite(apiClient, core().getProjectDir());
			site.setLibraryIdent(library.name);
			runCommand(site.run(command));
		});
	}
}
