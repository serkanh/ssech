'use strict'

const fs = require('fs');
const util = require('util');

const readfile = util.promisify(fs.readFile);
//const writef = util.promisify(fs.writedir);



async function rmdupes() {
	try {
		let content = await readfile('./config', 'utf8');
		console.log(content)
		var re = RegExp('preparation-h-prod*','g'); 
		let recordIndexes = [];
		while(re.exec(content.toString())){
			recordIndexes.push(re.lastIndex);
		}
		console.log(recordIndexes)
	} catch(e) {
		console.log('cant read the file',e)
	}

	


}

rmdupes()