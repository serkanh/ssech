class MakeConfig {
  constructor(selectedCluster, ips, bastion) {
    this.selectedCluster = selectedCluster.CLUSTER_NAME.toString().split('/')[1],
    this.ips = ips,
    this.bastion = bastion;
  }


  createConfig() {
    let record = '';
    this.ips.forEach((ip, index) => {
      record += `
Host ${this.selectedCluster}-${index}
\tHostname ${ip}
\tport 22
\tUser ec2-user
\tProxyCommand ssh ${this.bastion} -W %h:%p`;
    });
    return record;
  }
}


module.exports = MakeConfig;
