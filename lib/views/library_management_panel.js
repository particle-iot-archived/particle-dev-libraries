'use babel';
/** @jsx etch.dom */
/*eslint-disable react/no-unknown-property */

import _ from 'lodash';
import etch from 'etch';
import semver from 'semver';
import {CompositeDisposable} from 'atom';
import {FileSystemLibraryRepository, FileSystemNamingStrategy} from 'particle-library-manager';
import {core} from '../index';
import {libraryMigrateCommand} from '../library_migrate';
import {libraryContributeCommand} from '../library_contribute';
import {libraryPublishCommand} from '../library_publish';
import {packageName} from '../util/package-helper';
import {ValidatingEditorView} from './validating_editor';
import {LibraryVersions} from './library_versions';

export class LibraryManagementPanelView {
	constructor(props, children) {
		this.props = props;
		etch.initialize(this);

		this.disposables = new CompositeDisposable();
		this.disposables.add(atom.project.onDidChangePaths(() => this.update()));
	}

	render() {
		if (core().isLibrary()) {
			if (this.lib) {
				return <div id='library-management-panel'>
					<h1>{this.lib.metadata.name}</h1>
					<div className='btn-toolbar'>
						<div className='btn-group'>
							<button
								onclick={() => this.upload()}
								className='btn btn-lg'
								>Upload</button>
							<button
								onclick={() => this.publish()}
								className='btn btn-lg'
								>Publish</button>
						</div>
					</div>
					<div className='version'>
						<h3>Version</h3>
						<ValidatingEditorView
							value={this.lib.metadata.version}
							validator={() => this.versionValidator()}
							ref='versionEditor' />
						<div className='btn-toolbar'>
							<div className='btn-group'>
								<button
									className='btn icon icon-arrow-up'
									onclick={() => this.bumpVersion(0)}
									>Major</button>
								<button
									className='btn icon icon-arrow-up'
									onclick={() => this.bumpVersion(1)}
									>Minor</button>
								<button
									className='btn icon icon-arrow-up'
									onclick={() => this.bumpVersion(2)}
									>Patch</button>
							</div>
						</div>
					</div>
					<div className='description'>
						<h3>Description</h3>
						<ValidatingEditorView
							value={this.lib.metadata.description}
							validator={() => this.descriptionValidator()}
							ref='descriptionEditor' />
					</div>
					<button
						className={this.valuesChanged ? 'btn btn-lg btn-primary' : 'btn btn-lg'}
						disabled={!this.valuesChanged}
						onclick={() => this.save()}
						>Save changes</button>
					<div className='versions'>
						<h2>Contributed versions</h2>
						<LibraryVersions name={this.lib.name} ref='libraryVersions' />
					</div>
				</div>;
			} else {
				return <ul className='background-message centered'>
					<li>Loading library...</li>
				</ul>;
			}
		} else if (core().isLegacyLibrary()) {
			return <div id='library-management-panel'>
				<h1>Legacy library</h1>
				<p>
					This library is in a legacy, no longer supported format.
					Please migrate it to the latest one.
				</p>
				<button
					className='btn btn-primary btn-lg'
					onclick={() => this.migrate()}
					>Migrate this library</button>
			</div>;
		} else {
			return <ul className='background-message centered'>
				<li>Current directory is not a Particle library</li>
			</ul>;
		}
	}

	update(props, children) {
		if (this.lib) {
			return etch.update(this);
		}
		if (!core().getProjectDir()) {
			return etch.update(this);
		}
		const repo = new FileSystemLibraryRepository(core().getProjectDir(), FileSystemNamingStrategy.DIRECT);
		return repo.fetch('').then((lib) => {
			this.lib = lib;
			this.valuesChanged = false;
			return etch.update(this);
		}, (error) => {
			// We can swallow this error
		});
	}

	async destroy () {
		this.disposables.dispose();
		await etch.destroy(this);
	}

	getTitle() {
		return 'Particle Library Management';
	}

	getPath() {
		return 'library-management';
	}

	getUri() {
		return `${packageName()}://editor/${this.getPath()}`;
	}

	versionValidator() {
		if (!this.refs || !this.refs.versionEditor) {
			return;
		}
		let value = this.refs.versionEditor.value;
		this.valuesChanged |= value !== this.lib.metadata.version;

		return semver.valid(value) ? '' : 'This is not a valid semver version';
	}

	descriptionValidator() {
		if (!this.refs || !this.refs.descriptionEditor) {
			return;
		}
		let value = this.refs.descriptionEditor.value;
		this.valuesChanged |= value !== this.lib.metadata.description;

		return _.trim(value) === '' ? 'Descrition can\'t be empty' : '';
	}

	migrate() {
		libraryMigrateCommand(atom, core().getProjectDir()).then(() => {
			this.update();
		});
	}

	bumpVersion(part) {
		let version = this.refs.versionEditor.value;
		if (semver.valid(version)) {
			let parts = version.split('.');
			if (part === 2) {
				let subparts = parts[2].split('-');
				subparts[0]++;
				parts[2] = subparts.join('-');
			} else {
				parts[part]++;
			}
			this.refs.versionEditor.value = parts.join('.');
		}
	}

	save() {
		this.lib.metadata.version = this.refs.versionEditor.value;
		this.lib.metadata.description = this.refs.descriptionEditor.value;
		this.lib.repo.writeDescriptorV2(
			this.lib.repo.descriptorFileV2(this.lib.name),
			this.lib.metadata
		).then(() => {
			this.valuesChanged = false;
		});
	}

	upload() {
		libraryContributeCommand(atom, core().getProjectDir()).then(() => {
			this.refs.libraryVersions.update();
		});
	}

	publish() {
		libraryPublishCommand(atom, core().getProjectDir()).then(() => {
			this.refs.libraryVersions.update();
		});
	}

	set valuesChanged(value) {
		this._valuesChanged = value;
		this.update();
	}

	get valuesChanged() {
		return this._valuesChanged;
	}
}
