'use babel';

const fs = require('fs');

let cachedPackageName = undefined;

export function packageName() {
	return cachedPackageName = cachedPackageName || fetchPackageName('../../package.json', 'particle-dev-libraries');
}

export function fetchPackageName(module, defaultName) {
	try {
		const pjson = require(module);
		return pjson.name;
	} catch (error) {
		return defaultName;
	}
}

export function getProjectDirectory(atom) {
	const paths = atom.project.getDirectories();
	return determineProjectDirectory(paths, (dir) => atom.project.removePath(dir), (dir) => atom.project.addPath(dir));
}

export function setProjectDirectory(atom, directory) {
	atom.project.setPaths([directory]);
}

export function determineProjectDirectory(paths, nonexist, add) {
	// todo - prompt the user when there are multiple directories?
	if (!paths.length) {
		return null;
	}

	const projectPath = paths[0];
	if (!projectPath.existsSync()) {
		return null;
	}

	let projectDirectory = projectPath.getPath();
	if (!fs.lstatSync(projectDirectory).isDirectory()) {
		if (nonexist) {
			nonexist(projectDirectory);
		}
		projectDirectory = projectPath.getParent().getPath();
		if (add) {
			add(projectDirectory);
		}
	}
	return projectDirectory;
}

