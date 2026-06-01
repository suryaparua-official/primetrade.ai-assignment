output "eks_cluster_name"     { value = module.eks.cluster_name }
output "eks_cluster_endpoint" { value = module.eks.cluster_endpoint; sensitive = true }
output "ecr_repo_urls"        { value = module.ecr.repo_urls }
output "redis_endpoint"       { value = module.elasticache.redis_endpoint; sensitive = true }
output "alb_dns_name"         { value = module.alb.alb_dns_name }
output "api_gateway_url"      { value = module.api_gateway.api_gateway_url }
output "cloudfront_domain"    { value = module.cloudfront_s3.cloudfront_domain }
output "s3_bucket_name"       { value = module.cloudfront_s3.s3_bucket_name }
output "frontend_url"         { value = "https://${module.route53.frontend_fqdn}" }
output "jenkins_url"          { value = module.jenkins.jenkins_url }
output "jenkins_public_ip"    { value = module.jenkins.jenkins_public_ip }
output "eso_role_arn"         { value = module.iam.eso_role_arn }
output "user_service_role_arn" { value = module.iam.user_service_role_arn }
output "task_service_role_arn" { value = module.iam.task_service_role_arn }
