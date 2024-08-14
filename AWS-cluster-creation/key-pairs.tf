
# Key pairs for instances ( manually create key pair on local before applying these commands )
resource "aws_key_pair" "k8-key" {
  key_name   = "k8-vpc"
  public_key = file("~/.ssh/id_rsa.pub")
}
