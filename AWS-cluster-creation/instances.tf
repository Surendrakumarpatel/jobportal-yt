
#aws instance for master node

resource "aws_instance" "k8_control_plane" {
  ami = var.ubuntu_ami
  instance_type = "t2.medium"
  key_name = aws_key_pair.k8-key.key_name
  associate_public_ip_address = true
  security_groups = [
    aws_security_group.k8-sg-common.name,
    aws_security_group.k8-udp.name,
    aws_security_group.k8-sg-control-plane.name,
  ]
  root_block_device {
    volume_type = "gp2"
    volume_size = 8
  }

  tags = {
    Name = "k8 Master Node"
    Role = "Control plane node"
  }
  provisioner "local-exec" {
    command = "mkdir -p ./files && echo 'master ${self.public_ip}' >> ./files/hosts"
  }
}


# worker node

resource "aws_instance" "k8_worker_node" {
  count = var.worker_nodes_count
  ami = var.ubuntu_ami
  instance_type = var.worker_node_instance_type
  key_name = aws_key_pair.k8-key.key_name
  associate_public_ip_address = true
  security_groups = [
    aws_security_group.k8-sg-common.name,
    aws_security_group.k8-udp.name,
    aws_security_group.k8-sg-control-plane.name,
  ]
  root_block_device {
    volume_type = "gp2"
    volume_size = 8
  }

  tags = {
    Name = "k8 Worker ${count.index}"
    Role = "Worker node"
  }

	provisioner "local-exec" {
    command = "mkdir -p ./files && echo 'worker-${count.index} ${self.public_ip}' >> ./files/hosts"
  }
}
