#!/usr/bin/env node

const inquirer = require('inquirer');
const chalk = require('chalk');
const figlet = require('figlet');
const shell = require('shelljs');
const AWS = require('aws-sdk');
const _ = require('lodash');
const makeconfig = require('./makeconfig');

const initProfile = (profile) => {
  const creds = new AWS.SharedIniFileCredentials({
    profile,
  });
  AWS.config.update({
    credentials: creds,
    region: 'us-east-1',
  });
  return AWS;
};


const getClusters = ecs => new Promise((resolve, reject) => {
  const params = {};
  ecs.listClusters(params, (err, data) => {
    if (err) reject(err);
    else resolve(data);
  });
});


const getEcsClusters = async (profile) => {
  const AWS = initProfile(profile);
  const ecs = new AWS.ECS();
  try {
    const clusters = await getClusters(ecs);
    return clusters;
  } catch (e) {
    console.log(e);
  }
};


const askQuestions = () => {
  const questions = [{
    type: 'list',
    name: 'AWS_PROFILE_NAME',
    message: 'Which aws profile do you want to use?',
    choices: ['HA', 'jumpstart', 'default'],
  },
  {
    type: 'list',
    name: 'BASTION_HOST_NAME',
    message: 'Which bastion host do you want to use?',
    choices: ['ha-bastion', 'ha-bastion-dev', 'contentpublishing-nat'],
  },
  ];
  return inquirer.prompt(questions);
};

const selectCluster = (data) => {
  const questions = [{
    type: 'list',
    name: 'CLUSTER_NAME',
    message: 'Which cluster you want access to?',
    choices: data,
  }];
  return inquirer.prompt(questions);
};

const listContainerInstances = (selectedCluster, profile) => {
  const params = {
    cluster: selectedCluster.CLUSTER_NAME.toString().split('/')[1],

  };
  const ecs = new AWS.ECS();

  const ecsListContainerInstances = ecs.listContainerInstances(params).promise();
  return ecsListContainerInstances
    .then(data => data)
    .catch((err) => {
      console.log(err);
    });
};


const getContainerInstanceIds = (selectedCluster, listofcontainerhosts, profile) => {
  const AWS = initProfile(profile);
  const ecs = new AWS.ECS();
  const containerIds = [];
  listofcontainerhosts.containerInstanceArns.forEach((val) => {
    containerIds.push(val.split('/')[1]);
  });
  const params = {
    cluster: selectedCluster.CLUSTER_NAME.toString().split('/')[1],
    containerInstances: containerIds,
  };
  const describeContainerInstances = ecs.describeContainerInstances(params).promise();
  return describeContainerInstances
    .then((data) => {
      const ec2instanceIds = _.map(data.containerInstances, 'ec2InstanceId');
      return ec2instanceIds;
    })
    .catch((err) => {
      console.log(err);
    });
};


const getContainerInstanceIps = (instancesIds, profile) => {
  const AWS = initProfile(profile);
  const ec2 = new AWS.EC2();
  const params = {
    InstanceIds: instancesIds,
  };
  return ec2.describeInstances(params).promise()
    .then((data) => {
      const privateIps = [];
      data.Reservations.forEach((reservation) => {
        privateIps.push(reservation.Instances[0].NetworkInterfaces[0].PrivateIpAddress);
      });
      return privateIps;
    })
    .catch((err) => {
      console.log(err);
    });
};


const createConfig = (selectedCluster, containerIps, bastionHost) => {
  const config = new makeconfig(selectedCluster, containerIps, bastionHost);
  return config.createConfig();
};


const init = () => {
  console.log(
    chalk.green(
      figlet.textSync('welcome to ssech', {
        font: 'doom',
        horizantalLayout: 'default',
        verticalLayout: 'default',
      }),
    ),
  );
};

const run = async () => {
  init();
  const {
    AWS_PROFILE_NAME,
    BASTION_HOST_NAME,
  } = await askQuestions();
  const cluster = await getEcsClusters(AWS_PROFILE_NAME);
  const selectedCluster = await selectCluster(cluster.clusterArns);
  const containerInstances = await listContainerInstances(selectedCluster, AWS_PROFILE_NAME);
  const containerIds = await getContainerInstanceIds(selectedCluster, containerInstances, AWS_PROFILE_NAME);
  const containerIps = await getContainerInstanceIps(containerIds, AWS_PROFILE_NAME);
  console.log(containerIps);
  const createconfig = await createConfig(selectedCluster, containerIps, BASTION_HOST_NAME);
  console.log(createconfig);
  console.log(selectedCluster.CLUSTER_NAME.toString().split('/'));
};

run();
