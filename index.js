#!/usr/bin/env node

const inquirer = require("inquirer");
const chalk = require("chalk");
const figlet = require("figlet");
const shell = require("shelljs");
const AWS = require("aws-sdk");
const _ = require("lodash");

const initProfile = (profile) =>{
	const creds = new AWS.SharedIniFileCredentials({profile: profile});
	AWS.config.update({credentials:creds,region:'us-east-1'}) 
	return AWS;
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
	const AWS =  initProfile(profile);
	const ecs = new AWS.ECS();
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
	console.log('SELECTEDCLUSTER',selectedCluster.CLUSTER_NAME.toString().split('/')[1])
	const  params = {
		cluster: selectedCluster.CLUSTER_NAME.toString().split('/')[1]
	//	cluster: 'preparation-h-preprod'
	}
	const ecs = new AWS.ECS();

	const ecsListContainerInstances = ecs.listContainerInstances(params).promise();
	return ecsListContainerInstances
	.then((data)=>{
		return data;
	})
	.catch((err)=>{
		console.log(err);
	})
}


const getContainerInstanceIds = (selectedCluster,listofcontainerhosts,profile) => {
	const AWS =  initProfile(profile);
	const ecs = new AWS.ECS();
  let containerIds = [];
	listofcontainerhosts.containerInstanceArns.forEach((val)=>{
		containerIds.push(val.split('/')[1])
	})
	console.log('CLUSTERNAME=>',selectedCluster)
	let params = {
		cluster: selectedCluster.CLUSTER_NAME.toString().split('/')[1],
		containerInstances: containerIds
	}
	const describeContainerInstances = ecs.describeContainerInstances(params).promise()
	describeContainerInstances
	.then((data)=>{
		let ec2instanceIds = _.map(data.containerInstances,'ec2InstanceId')
		console.log(ec2instanceIds)
		return ec2instanceIds
	})
	.catch((err)=>{
		console.log(err)
	})

}



const init = () => {
	console.log(
		chalk.green(
			figlet.textSync("welcome to ssech",{
				font: "doom",
				horizantalLayout: "default",
				verticalLayout: "default"
			})
		)
	)
}

const run = async () => {
	init()
	const {AWS_PROFILE_NAME, BASTION_HOST_NAME} = await askQuestions();
	const cluster = await getEcsClusters(AWS_PROFILE_NAME);
	const selectedCluster = await selectCluster(cluster.clusterArns);
	const containerInstances = await listContainerInstances(selectedCluster,AWS_PROFILE_NAME);
	const containerIds = await getContainerInstanceIds(selectedCluster,containerInstances,AWS_PROFILE_NAME);


}

run();