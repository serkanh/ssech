

const fs = require('fs');
const util = require('util');

const appendfile = util.promisify(fs.appendFile);
const copyFileSync = util.promisify(fs.copyFileSync);

class BackupAndUpdate {
  constructor(file, path) {
    this.file = file || 'config';
    this.path = path || `${process.env.HOME}/.ssh/`;
  }


  // check the presensce of the config file
  exists() {
    if (fs.existsSync(`${this.path}/${this.file}`)) return true;
    return false;
  }

  update(content) {
    if (this.exists()) {
      appendfile(`${this.path}/${this.file}`, content, (err) => {
        if (err) console.log(err);
        else console.log('saved!');
      });
    }
  }


  // make a copy of the file
  backupUpdate(content) {
    if (this.exists()) {
      return copyFileSync(`${this.path}/${this.file}`, `${this.path}/${this.file}-backup`)
        .then(this.update(content));
    }
    return false;
  }
}


module.exports = BackupAndUpdate;
