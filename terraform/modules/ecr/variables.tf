variable "project"    { type = string }
variable "repo_names" { type = list(string) }
variable "tags"       { type = map(string); default = {} }
