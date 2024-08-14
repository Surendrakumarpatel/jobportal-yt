/* Setup our aws provider */
provider "aws" {

  access_key = var.access_key
  secret_key = var.secret_key
  region     = var.region
}

/* Define our vpc */
resource "aws_vpc" "k8-vpc" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  tags = {
    Name = "k8-vpc"
  }
}
