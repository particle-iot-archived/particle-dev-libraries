'use babel';
/** @jsx etch.dom */

import etch from 'etch'
import shell from 'shell';
import {core} from '../index';
const {LibraryAddCommand, LibraryInstallCommand} = require('../cli');
const {DevLibraryAddSite} = require('../library_add');
const {DevLibraryInstallSite} = require('../library_install');
import {runCommand, fetchApiClient} from '../library';
import {showLibraryAdded} from '../util/notifications';
import {packageName} from '../util/package-helper';

export class LibraryCard {
	constructor(props, children) {
		this.props = props;
		this.isDownloading = false;
		etch.initialize(this);
	}

	render() {
		return <li className='library-card'>
			<div className='stats pull-right'>
				<span>
					<span className='icon icon-cloud-download'></span>
					<span>{this.props.installs}</span>
				</span>
			</div>
			<div>
				<h4 className='card-name'>
					<span className='library-name'>{this.props.name} </span>
					<span>{this.props.version}</span>
					{ this.props.visibility === 'private' ?
						<i className='icon icon-lock library-private' title='Private library'></i> : ''
					}
					{ this.props.verified ?
						<span className='library-verified' title='This library has been verified by Particle'></span> : ''
					}
					{ this.props.official ?
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
							{ this.props.repository ?
								<button
									type='button'
									className='btn icon icon-mark-github'
									onclick={() => shell.openExternal(this.props.repository)}
									>View on GitHub</button> : ''
							}
							<button
								type='button'
								className={this.isDownloading ? 'btn icon icon-file-text is-downloading' : 'btn icon icon-file-text'}
								disabled={this.isDownloading}
								onclick={() => this.viewSources()}
								>View sources</button>
							<button
								type='button'
								className={this.canAdd() ? 'btn btn-info icon icon-plus' : 'btn icon icon-plus'}
								disabled={!this.canAdd()}
								onclick={() => this.addToProject()}
								>{ core().isProject() ? 'Add to current project' : 'Add to current library' }
							</button>
						</div>
					</div>
				</div>
			</div>
		</li>
	}

	update(props, children) {
		return etch.update(this);
	}

	async destroy() {
		await etch.destroy(this);
	}

	cleanAuthor() {
		return this.props.author.replace(/\<.*\>/, '').trim();
	}

	description() {
		let description = this.props.sentence;
		if (this.props.paragraph) {
			description += `. ${this.props.paragraph}`;
		}
		return description;
	}

	canAdd() {
		return core().isProject() || core().isLibrary();
	}

	viewSources() {
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
		site.setLibraryName(this.props.name);
		runCommand(site.run(command));
		return etch.update(this);
	}

	addToProject() {
		const command = new LibraryAddCommand();
		const apiClient = fetchApiClient();
		const site = new DevLibraryAddSite(apiClient, core().getProjectDir());
		site.setLibraryIdent(this.props.name, this.props.version);
		runCommand(site.run(command)).then(() => {
			showLibraryAdded(this.props);
		});
	}
}
