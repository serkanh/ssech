'use strict'

const fs = require('fs');


class Backup {
	constructor(file) {
		this.file = file;
		this.path = `${process.env.HOME}/.ssh/`
	}
	


	// check the presensce of the config file
	exits() {
		if (fs.existsSync(`${this.path}/${this.file}`)) return true
		else false
	}


	// make a copy of the file
	backup(){
		if(this.exits()){
			fs.copyFileSync(`${this.path}/${this.file}`, `${this.path}/${this.file}-backup`)
			console.log(`${this.file} is copied to ${this.file}-backup`)
		}else{
			return false
		}

	}



}


// append the records 
// display what is appended.

let backup = new Backup('config')
console.log(backup.backup('config'))