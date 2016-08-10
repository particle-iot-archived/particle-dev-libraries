'use babel';

let g_packageName = undefined;

export function packageName() {
	return g_packageName = g_packageName || fetchPackageName('../../package.json', 'particle-dev-libraries');
}

export function fetchPackageName(module, defaultName) {
	try {
		const pjson = require(module);
		return pjson.name;
	}
	catch (error) {
		return defaultName;
	}
}
