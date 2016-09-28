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
echo '{"name":"particle"}' > ~/.particle/profile.json
echo "$PARTICLE_CONFIG_JSON" > ~/.particle/particle.config.json

"${APM_SCRIPT_PATH}" install .
"${APM_SCRIPT_PATH}" link .
"${NPM_SCRIPT_PATH}" run test:unit
"${ATOM_SCRIPT_PATH}" --test ./spec


