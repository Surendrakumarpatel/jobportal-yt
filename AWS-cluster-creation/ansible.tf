resource "ansible_host" "master_host_nodes" {
  depends_on = [
    aws_instance.k8_control_plane
  ]
  name = "control_plane"
  groups = ["master"]
  variables = {
    ansible_user = "ubuntu"
    ansible_host = aws_instance.k8_control_plane.public_ip
    ansible_ssh_private_key_file = "~/.ssh/id_rsa"
    node_hostname = "master"
  }
}


resource "ansible_host" "worker_nodes" {
  depends_on = [
    aws_instance.k8_worker_node
  ]
  count = var.worker_nodes_count
  name = "worker-${count.index}"
  groups = ["workers"]
  variables = {
    node_hostname = "worker-${count.index}"
    ansible_user = "ubuntu"
    ansible_host = aws_instance.k8_worker_node[count.index].public_ip
    ansible_ssh_private_key_file = "~/.ssh/id_rsa"
  }
}
