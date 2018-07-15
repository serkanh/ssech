

const fs = require('fs');
const util = require('util');

const readfile = util.promisify(fs.readFile);
// const writef = util.promisify(fs.writedir);

function makeMultiLineString(arr) {
  let str = '';
  arr.forEach((el) => {
    el.forEach((e) => {
      str += `${e}\n`;
    });
  });
  return str;
}

// removes any existing host records for given cluster
async function rmdupes(clustername) {
  try {
    const content = await readfile('./config', 'utf8');
    const lines = content.split(/\r?\n/);
    const modified = [];
    lines.forEach((line, index) => {
      if (!(line.includes(clustername)) && line.includes('Host ')) {
        modified.push(lines.slice(index, index + 5));
      }
    });

    return makeMultiLineString(modified);
  } catch (e) {
    console.log('cant read the file', e);
  }
}

rmdupes('preparation-h-prod').then(console.log);
