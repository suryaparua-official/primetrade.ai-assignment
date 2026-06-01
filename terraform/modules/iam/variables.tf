variable "project"            { type = string }
variable "aws_region"         { type = string }
variable "aws_account_id"     { type = string }
variable "oidc_provider_arn"  { type = string; default = "" }
variable "oidc_provider_url"  { type = string; default = "" }
variable "tags"               { type = map(string); default = {} }
