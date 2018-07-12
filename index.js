#!/usr/bin/env node

const inquirer = require("inquirer");
const chalk = require("chalk");
const figlet = require("figlet");
const shell = require("shelljs");
const AWS = require("aws-sdk");




const getClusters = (ecs) => {
	return new Promise((resolve,reject)=>{
		let params  = {};
		ecs.listClusters(params,(err,data)=>{
			if(err) reject(err)
			else resolve(data)
		})
	})
}




const getEcsHosts = async (profile) => {
	const creds = new AWS.SharedIniFileCredentials({profile: profile});
	AWS.config.update({credentials:creds,region:'us-east-1'}) 
	//TODO prompt region 
	const ecs = new AWS.ECS()
	try {
		const clusters = await getClusters(ecs);
		return clusters;
	} catch(e){
		console.log(e)
	}

}


const askQuestions = () => {
  const questions = [
    {
      type: "list",
      name: "AWS_PROFILE_NAME",
      message: "Which aws profile do you want to use?",
      choices: ["HA", "jumpstart", "default"]
    },
    {
      type: "list",
      name: "BASTION_HOST_NAME",
      message: "Which bastion host do you want to use?",
      choices: ["ha-bastion", "ha-bastion-dev", "contentpublishing-nat"]
		},
  ];
  return inquirer.prompt(questions);
};

const selectCluster = (data) => {
	console.log(typeof data)
	const questions = [
    {
      type: "list",
      name: "CLUSTER_NAME",
      message: "Which cluster you want access to?",
      choices: data
    }
  ];
  return inquirer.prompt(questions);
}


const init = () => {
	console.log(
		chalk.green(
			figlet.textSync("welcome to ssech",{
				font: "Ghost",
				horizantalLayout: "default",
				verticalLayout: "default"
			})
		)
	)
}

const run = async () => {
	init()
	const {AWS_PROFILE_NAME, BASTION_HOST_NAME} = await askQuestions();
	const clusters = await getEcsHosts(AWS_PROFILE_NAME);
	const selectedCluster = await selectCluster(clusters.clusterArns);

}

run();