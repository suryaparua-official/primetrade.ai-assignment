variable "project"           { type = string }
variable "aws_region"        { type = string }
variable "aws_account_id"    { type = string }
variable "vpc_id"            { type = string }
variable "public_subnet_id"  { type = string }          # public subnet-এ থাকবে
variable "instance_type"     { type = string; default = "t3.medium" }
variable "ssh_public_key"    { type = string }          # ~/.ssh/id_rsa.pub content
variable "allowed_ssh_cidrs" { type = list(string); default = ["0.0.0.0/0"] }
# production-এ ["YOUR_IP/32"] দাও
variable "tags"              { type = map(string); default = {} }
