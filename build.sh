mv spec spec.safe
mkdir spec
cp spec.safe/runner.js spec/
curl -s https://raw.githubusercontent.com/atom/ci/master/build-package.sh > atombuild.sh
# remove the exit command at the end
grep -v -e  "exit$" atombuild.sh > noexit.sh
source noexit.sh  
rm -rf spec
mv spec.safe spec
mkdir ~/.particle

echo "access token is: ${ACCESS_TOKEN}""
echo "\{\"access_token\":\"${ACCESS_TOKEN}\"\,\"username\":\"mat+test@particle.io\"\}" > ~/.particle/particle.config.json
echo "config:"
cat ~/.particle.config.json


"${APM_SCRIPT_PATH}" install particle-dev-profiles
"${APM_SCRIPT_PATH}" install .
"${APM_SCRIPT_PATH}" link .
"${NPM_SCRIPT_PATH}" run test:unit
"${ATOM_SCRIPT_PATH}" --test ./spec


