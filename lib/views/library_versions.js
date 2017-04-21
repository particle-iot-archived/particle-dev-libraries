'use babel';
/** @jsx etch.dom */
/*eslint-disable react/no-unknown-property */

import etch from 'etch';
import semver from 'semver';
import { fetchApiClient } from '../library';

export class LibraryVersions {
	constructor(props, children) {
		this.props = props;
		etch.initialize(this);
	}

	render() {
		if (!this.versions) {
			return <progress className='inline-block' />;
		} else if (this.versions.length === 0) {
			return <h4>This library has not been contributed yet</h4>;
		} else {
			return <table>
				<thead>
					<th>Version</th>
					<th>Installs</th>
					<th>Visibility</th>
					<th>Verified</th>
				</thead>
				<tbody>
					{this.versions.map((version) => {
						return <tr>
							<td>{version.version}</td>
							<td>{version.installs || 0}</td>
							<td>{version.visibility}</td>
							<td>{version.verified ?
								<span className='library-verified' title='This library has been verified by Particle'></span> : ''}</td>
						</tr>;
					})}
				</tbody>
			</table>;
		}
	}

	update() {
		fetchApiClient().libraryVersions(this.props.name).then((versions) => {
			this.versions = versions.sort((a, b) => {
				return semver.lt(a.version, b.version);
			});
			return etch.update(this);
		}, (reason) => {
			atom.notifications.addError(reason.shortErrorDescription || reason.toString());
		});
	}

	async destroy() {
		await etch.destroy(this);
	}
}
