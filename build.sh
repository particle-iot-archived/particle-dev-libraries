(
mv spec spec.safe
mkdir spec
cp spec.safe/runner.js spec/
curl -s https://raw.githubusercontent.com/atom/ci/master/build-package.sh > atombuild.sh
source atombuild.sh
rm -rf spec
mv spec.safe spec
"${APM_SCRIPT_PATH}" install .
"${APM_SCRIPT_PATH}" link .
echo "export NPM_SCRIPT_PATH=$(NPM_SCRIPT_PATH)" > npm_script
)
source npm_script
"$(NPM_SCRIPT_PATH)" test

