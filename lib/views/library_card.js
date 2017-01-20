'use babel';
/** @jsx etch.dom */
/*eslint-disable react/no-unknown-property */

import etch from 'etch';
import shell from 'shell';
import {core} from '../index';
const {LibraryAddCommand, LibraryInstallCommand} = require('../cli');
const {DevLibraryAddSite} = require('../library_add');
const {DevLibraryInstallSite} = require('../library_install');
import {runCommand, fetchApiClient} from '../library';
import {showLibraryAdded, showLibraryCopied} from '../util/notifications';

export class LibraryCard {
	constructor(props, children) {
		this.props = props;
		this.lib = this.props.lib;
		this.isDownloading = false;
		etch.initialize(this);
	}

	render() {
		return <li className='library-card'>
			<div className='stats pull-right'>
				<span>
					<span className='icon icon-cloud-download'></span>
					<span>{this.lib.installs}</span>
				</span>
			</div>
			<div>
				<h4 className='card-name'>
					<span className='library-name'>{this.lib.name} </span>
					<span>{this.lib.version}</span>
					{ this.lib.visibility === 'private' ?
						<i className='icon icon-lock library-private' title='Private library'></i> : ''
					}
					{ this.lib.verified ?
						<span className='library-verified' title='This library has been verified by Particle'></span> : ''
					}
					{ this.lib.official ?
						<img src='atom://particle-dev/images/logo.png'
							className='library-official'
							title='This library has been developed by Particle' /> : ''
					}
					<div>{this.description()}</div>
				</h4>
			</div>
			<div className='meta'>
				<div className='meta-user'>
					<span className='author'>{this.cleanAuthor()}</span>
				</div>
				<div className='meta-controls'>
					<div className='btn-toolbar'>
						<div className='btn-group'>
							{ this.lib.url ?
								<button
									type='button'
									className='btn icon icon-mark-github'
									onclick={() => shell.openExternal(this.lib.url)}
									>GitHub</button> : ''
							}
							<button
								type='button'
								className={this.isDownloading ? 'btn icon icon-file-text is-downloading' : 'btn icon icon-file-text'}
								disabled={this.isDownloading}
								onclick={() => this.viewSource()}
								>View source</button>
							<button
								type='button'
								className='btn btn-info icon icon-ellipsis'
								onclick={() => this.use() }
								>Use
							</button>

							<div className='select-list popover-list dropdown' ref='useDropdown'>
								<ol className='list-group'>
									<li>
										<button
											className='btn btn-info icon icon-plus'
											onclick={() => this.addToProject()}
											>Add to current { core().isProject() ? 'project' : 'library' }
										</button>
									</li>
									<li>
										<button
											className='btn icon icon-alignment-align'
											onclick={() => this.addToProject(true)}
											>Copy to current { core().isProject() ? 'project' : 'library' }
										</button>
									</li>
								</ol>
							</div>
						</div>
					</div>
				</div>
			</div>
		</li>;
	}

	update(props, children) {
		this.props = props;
		this.lib = this.props.lib;
		return etch.update(this);
	}

	async destroy() {
		await etch.destroy(this);
	}

	cleanAuthor() {
		return this.lib.author.replace(/\<.*\>/, '').trim();
	}

	description() {
		let description = this.lib.sentence;
		if (this.lib.paragraph) {
			description += `. ${this.lib.paragraph}`;
		}
		return description;
	}

	canAdd() {
		return core().isProject() || core().isLibrary();
	}

	viewSource() {
		this.isDownloading = true;

		const command = new LibraryInstallCommand();
		// TODO: How could we be smart about it and open dir instead of downloading
		// if it's already on filesystem?
		const site = new DevLibraryInstallSite('', (lib, targetDir) => {
			this.isDownloading = false;
			atom.open({
				pathsToOpen: targetDir
			});
			return etch.update(this);
		});
		site.setLibraryName(this.lib.name);
		runCommand(site.run(command));
		return etch.update(this);
	}

	use() {
		if (this.canAdd()) {
			this.toggleUseDropdown();
		} else {
			atom.commands.dispatch(atom.views.getView(atom.workspace), 'particle:project-init');
		}
	}

	addToProject(copy=false) {
		this.toggleUseDropdown();

		if (copy) {
			const command = new LibraryInstallCommand();
			const site = new DevLibraryInstallSite(core().getProjectDir(), () => {
				showLibraryCopied(this.lib);
			}, true);
			site.setLibraryName(this.lib.name);
			runCommand(site.run(command));
		} else {
			const command = new LibraryAddCommand();
			const apiClient = fetchApiClient();
			const site = new DevLibraryAddSite(apiClient, core().getProjectDir());
			site.setLibraryIdent(this.lib.name, this.lib.version);
			runCommand(site.run(command)).then(() => {
				showLibraryAdded(this.lib);
			});
		}
	}

	toggleUseDropdown() {
		// Refresh dropdown options
		etch.update(this);
		this.refs.useDropdown.style.visibility =
			this.refs.useDropdown.style.visibility === 'visible' ? 'hidden' : 'visible';
	}
}
