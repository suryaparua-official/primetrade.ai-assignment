variable "root_domain"        { type = string }
variable "domain_name"        { type = string }
variable "api_domain_name"    { type = string }
variable "cloudfront_domain"  { type = string }
variable "alb_dns_name"       { type = string }
variable "alb_zone_id"        { type = string }
variable "tags"               { type = map(string); default = {} }
