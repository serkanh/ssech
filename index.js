#!/usr/bin/env node

const inquirer = require("inquirer");
const chalk = require("chalk");
const figlet = require("figlet");
const shell = require("shelljs");
const AWS = require("aws-sdk");


const initProfile = (profile) =>{
	const creds = new AWS.SharedIniFileCredentials({profile: profile});
	AWS.config.update({credentials:creds,region:'us-east-1'}) 
	const ecs = new AWS.ECS()
	return ecs;
}


const getClusters = (ecs) => {
	return new Promise((resolve,reject)=>{
		let params  = {};
		ecs.listClusters(params,(err,data)=>{
			if(err) reject(err)
			else resolve(data)
		})
	})
}




const getEcsClusters = async (profile) => {
	const ecs = initProfile(profile);
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

const listContainerInstances = (selectedCluster,profile) =>{
	const  params = {
		cluster: selectedCluster.toString().split('/')[1]
	}

	const ecsListContainerInstances = initProfile(profile).listContainerInstances(params).promise();
	ecsListContainerInstances
	.then((data)=>{
		console.log(data);
	})
	.catch((err)=>{
		console.log(err);
	})
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
	const clusters = await getEcsClusters(AWS_PROFILE_NAME);
	const selectedCluster = await selectCluster(clusters.clusterArns);
	const containerInstances = await listContainerInstances(selectedCluster,AWS_PROFILE_NAME);
}

run();