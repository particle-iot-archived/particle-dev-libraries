'use babel';

const {View, $$} = require('atom-space-pen-views');
import shell from 'shell';
import {core} from '../index';
const {LibraryAddCommand, LibraryInstallCommand} = require('../cli');
const {DevLibraryAddSite} = require('../library_add');
const {DevLibraryInstallSite} = require('../library_install');
import {runCommand, fetchApiClient} from '../library';
import {showLibraryAdded} from '../util/notifications';

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
					if (library.visibility === 'private') {
						this.i({'class': 'icon icon-lock', title: 'Private library'});
					}
					if (library.verified) {
						this.i({
							'class': 'icon icon-mortar-board library-verified',
							title: 'This library has been verified by Particle'
						});
					}
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

							this.button({
								type: 'button',
								'class': 'btn icon icon-file-text',
								id: 'view-sources'
							}, 'View sources');

							// TODO: Also allow in libraries
							// TODO: If a library is already added, show different state
							this.button({
								type: 'button',
								'class': 'btn btn-info icon icon-plus',
								id: 'add-to-project'
							}, 'Add to current project');
						});
					});
				});
			});
		}));

		this.find('#view-on-github').on('click', () => {
			shell.openExternal(library.repository);
		});

		this.find('#view-sources').on('click', () => this.onViewSources());
		this.find('#add-to-project').on('click', () => this.onAddToProject());
		if (!core().isProject()) {
			this.find('#add-to-project')
				.prop('disabled', 'disabled')
				.prop('title', 'Please open a directory containing project.properties file to add a library');
		}
	}

	onViewSources() {
		let el = this.find('#view-sources');
		el.prop('disabled', true);
		el.addClass('is-downloading');

		const command = new LibraryInstallCommand();
		// TODO: How could we be smart about it and open dir instead of downloading
		// if it's already on filesystem?
		const site = new DevLibraryInstallSite('', (lib, targetDir) => {
			el.prop('disabled', false);
			el.removeClass('is-downloading');
			atom.open({
				pathsToOpen: targetDir
			});
		});
		site.setLibraryName(this.library.name);
		runCommand(site.run(command));
	}

	onAddToProject() {
		const command = new LibraryAddCommand();
		const apiClient = fetchApiClient();
		const site = new DevLibraryAddSite(apiClient, core().getProjectDir());
		site.setLibraryIdent(this.library.name, this.library.version);
		runCommand(site.run(command)).then(() => {
			showLibraryAdded(this.library);
		});
	}
}
