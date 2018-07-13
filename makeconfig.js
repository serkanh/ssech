'use strict'


class MakeConfig {
	constructor(selectedCluster,ips,bastion) {
		this.selectedCluster = selectedCluster.CLUSTER_NAME.toString().split('/')[1],
		this.ips = ips,
		this.bastion = bastion
	}


	createConfig() {
		let record = ''
		this.ips.forEach((ip,index)=>{
		record +=	`
Host ${this.selectedCluster}-${index}
	Hostname ${ip}
	port 22
	User ec2-user
	ProxyCommand ssh ${this.bastion} -W %h:%p`
		})
		return record
	}
	

}



module.exports = MakeConfig;