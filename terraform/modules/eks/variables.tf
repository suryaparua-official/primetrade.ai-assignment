variable "cluster_name"         { type = string }
variable "kubernetes_version"   { type = string; default = "1.31" }
variable "public_subnet_ids"    { type = list(string) }
variable "private_subnet_ids"   { type = list(string) }
variable "node_instance_types"  { type = list(string); default = ["t3.medium"] }
variable "node_desired"         { type = number; default = 2 }
variable "node_min"             { type = number; default = 2 }
variable "node_max"             { type = number; default = 6 }
variable "public_access_cidrs"  { type = list(string); default = ["0.0.0.0/0"] }
variable "tags"                 { type = map(string); default = {} }
