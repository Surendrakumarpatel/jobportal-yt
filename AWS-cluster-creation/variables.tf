variable "access_key" {
  description = "AWS access key"
  sensitive = true
}

variable "secret_key" {
  description = "AWS secret access key"
  sensitive = true
}

variable "region" {
  description = "AWS region"
  default     = "ap-south-1"
}

variable "az" {
  description = "AWS availability_zone"
  default     = "ap-south-1a"
}

variable "vpc_cidr" {
  description = "CIDR for VPC"
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidr" {
  description = "CIDR for public subnet"
  default     = "10.0.0.0/24"
}

variable "ubuntu_ami" {
  type = string
  description = "the AMI ID of linux instance"
  default = "ami-00d1d69533a194191"
}

variable "worker_node_instance_type" {
	description = " type of instance - t2 or t3 "
	default = "t2.micro"
}

variable "worker_nodes_count" {
  type = number
  description = "the total number of worker nodes"
  default = 2
}
