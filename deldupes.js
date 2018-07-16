

const fs = require('fs');
const util = require('util');


const readfile = util.promisify(fs.readFile);

// removes any existing host records for given cluster
async function rmdupes(clustername) {
  try {
    clustername = clustername.CLUSTER_NAME.toString().split('/')[1];
    console.log(clustername);
    const content = await readfile('./config', 'utf8');
    // find and replace the matching regex
    const re = new RegExp(`^Host\\s.*${clustername}.*[\\s].*[\\s].*[\\s].*[\\s].*`, 'gm');
    const replaced = content.replace(re, '');
    // const modifiedConfig = await makeMultiLineString(replaced);
    fs.writeFile('./config-test', replaced, (err) => {
      if (err) console.log(err);
      else console.log('Duplicates removed!');
    });
  } catch (e) {
    console.log('cant read the file', e);
  }
}

module.exports = rmdupes;
