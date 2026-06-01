variable "project"             { type = string }
variable "environment"         { type = string }
variable "domain_name"         { type = string }
variable "api_gateway_url"     { type = string }
variable "acm_certificate_arn" { type = string }
variable "tags"                { type = map(string); default = {} }
