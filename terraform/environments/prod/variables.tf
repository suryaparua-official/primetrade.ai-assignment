variable "aws_region"              { type = string; default = "ap-south-1" }
variable "project"                 { type = string; default = "task-manager" }
variable "cluster_name"            { type = string; default = "task-manager-eks" }
variable "aws_account_id"          { type = string }
variable "vpc_cidr"                { type = string; default = "10.0.0.0/16" }
variable "availability_zones"      { type = list(string) }
variable "root_domain"             { type = string }
variable "domain_name"             { type = string }
variable "acm_certificate_arn"     { type = string }
variable "jenkins_ssh_public_key"  { type = string }
variable "allowed_ssh_cidrs"       { type = list(string); default = ["0.0.0.0/0"] }
