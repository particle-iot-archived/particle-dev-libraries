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

export function getProjectDir(atom) {
	const paths = atom.project.getDirectories();
	return determineProjectDir(paths, (dir) => atom.project.removePath(dir), (dir) => atom.project.addPath(dir));
}

export function determineProjectDir(paths, nonexist, add) {
	// todo - prompt the user when there are multiple directories?
	if (!paths.length) {
		return null;
	}

	const projectPath = paths[0];
	if (!projectPath.existsSync()) {
		return null;
	}

	let projectDir = projectPath.getPath();
	if (!fs.lstatSync(projectDir).isDirectory()) {
		if (nonexist) {
			nonexist(projectDir);
		}
		projectDir = projectPath.getParent().getPath();
		if (add) {
			add(projectDir);
		}
	}
	return projectDir;
}

