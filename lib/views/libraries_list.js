'use babel';
/** @jsx etch.dom */
/*eslint-disable react/no-unknown-property */

import etch from 'etch';
import {Notification} from 'atom';
import {runCommand, fetchApiClient} from '../library';
import {LibraryListCommandSite, LibraryListCommand} from '../cli';
import {LibraryCard} from './library_card';

let target = {};
let fetchPromise;

export function listingLibrariesErrorNotification() {
	return new Notification('error', 'There was an error while listing libraries. Please try again later.', {
		dismissable: true
	});
}

class DevLibraryListCommandSite extends LibraryListCommandSite {
	constructor(filter, section, page) {
		super();
		this._filter = filter;
		this._section = section;
		this._page = page;
	}

	sections() {
		let sections = {};
		sections[this._section] = {};
		return sections;
	}

	settings() {
		return {
			filter: this._filter,
			page: this._page
		};
	}

	target() {
		return target;
	}

	apiClient() {
		return fetchApiClient();
	}
}

export class LibrariesListView {
	constructor(props, children) {
		this.limit = 10;
		this.page = 1;
		this.props = props;
		etch.initialize(this);
	}

	render() {
		if (!this.libs) {
			return <progress className='inline-block' />;
		} else {
			return <div>
				<ul>
					{this.libs.map((lib) => {
						return <LibraryCard lib={lib} />;
					})}
					{!this.libs.length ?
						<h4>No libraries found</h4> : ''}
				</ul>
				<div className='btn-group'>
					{this.libs.length && this.page > 1 ?
						<button className='btn btn-lg'
							onclick={() => this.goToPage(1)}
						>
							<span className='icon icon-jump-left' />
							First
						</button> : ''}
					{this.libs.length && this.page > 1 ?
						<button className='btn btn-lg'
							onclick={() => this.goToPage(this.page - 1)}
						>
							<span className='icon icon-triangle-left' />
							Prev
						</button> : ''}
					{this.libs.length && this.libs.length >= this.limit ?
						<button className='btn btn-lg'
							onclick={() => this.goToPage(this.page + 1)}
						>
							Next
							<span className='icon icon-triangle-right' />
						</button> : ''}
				</div>
			</div>;
		}
	}

	update(props, children) {
		this.props = props;
		return etch.update(this);
	}

	async destroy() {
		await etch.destroy(this);
	}

	goToPage(page) {
		this.page = page;
		this.fetchLibraries(this._query);
	}

	fetchLibraries(query) {
		this._query = query;
		if (fetchPromise) {
			// return;
		}
		this.libs = undefined;
		const list = new LibraryListCommand();
		fetchPromise = runCommand(new DevLibraryListCommandSite(query, this.props.section, this.page).run(list, {})).then(() => {
			this.libs = target[this.props.section];
			fetchPromise = undefined;
			return etch.update(this);
		}).catch(err => {
			atom.notifications.addNotification(listingLibrariesErrorNotification());
			console.error(err);
			fetchPromise = undefined;
			return etch.update(this);
		});

		return etch.update(this);
		this.libs = undefined;
	}
}
