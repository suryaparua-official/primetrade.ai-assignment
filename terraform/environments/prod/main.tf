locals {
  common_tags = {
    Project     = var.project
    Environment = "prod"
    ManagedBy   = "terraform"
  }
}

module "iam" {
  source             = "../../modules/iam"
  project            = var.project
  aws_region         = var.aws_region
  aws_account_id     = var.aws_account_id
  oidc_provider_arn  = try(module.eks.oidc_provider_arn, "")
  oidc_provider_url  = try(module.eks.oidc_provider_url, "")
  tags               = local.common_tags
}

module "vpc" {
  source             = "../../modules/vpc"
  project            = var.project
  vpc_cidr           = var.vpc_cidr
  availability_zones = var.availability_zones
  cluster_name       = var.cluster_name
  tags               = local.common_tags
}

module "eks" {
  source               = "../../modules/eks"
  cluster_name         = var.cluster_name
  kubernetes_version   = "1.31"
  public_subnet_ids    = module.vpc.public_subnet_ids
  private_subnet_ids   = module.vpc.private_subnet_ids
  eks_cluster_role_arn = module.iam.eks_cluster_role_arn
  eks_node_role_arn    = module.iam.eks_node_role_arn
  node_instance_types  = ["t3.medium"]
  node_desired         = 2
  node_min             = 2
  node_max             = 4
  public_access_cidrs  = ["0.0.0.0/0"]
  tags                 = local.common_tags
}

module "ecr" {
  source     = "../../modules/ecr"
  project    = var.project
  repo_names = ["frontend", "user-service", "task-service", "nginx"]
  tags       = local.common_tags
}

module "elasticache" {
  source             = "../../modules/elasticache"
  project            = var.project
  vpc_id             = module.vpc.vpc_id
  vpc_cidr           = module.vpc.vpc_cidr
  private_subnet_ids = module.vpc.private_subnet_ids
  node_type          = "cache.t3.micro"
  num_replicas       = 1
  tags               = local.common_tags
}

module "alb" {
  source              = "../../modules/alb"
  project             = var.project
  vpc_id              = module.vpc.vpc_id
  public_subnet_ids   = module.vpc.public_subnet_ids
  acm_certificate_arn = var.acm_certificate_arn
  tags                = local.common_tags
}

module "api_gateway" {
  source       = "../../modules/api-gateway"
  project      = var.project
  alb_dns_name = module.alb.alb_dns_name
  tags         = local.common_tags
}

module "cloudfront_s3" {
  source              = "../../modules/cloudfront-s3"
  project             = var.project
  environment         = "prod"
  domain_name         = var.domain_name
  api_gateway_url     = module.api_gateway.api_gateway_url
  acm_certificate_arn = var.acm_certificate_arn
  tags                = local.common_tags
}

module "route53" {
  source            = "../../modules/route53"
  root_domain       = var.root_domain
  domain_name       = var.domain_name
  api_domain_name   = "api.${var.root_domain}"
  cloudfront_domain = module.cloudfront_s3.cloudfront_domain
  alb_dns_name      = module.alb.alb_dns_name
  alb_zone_id       = module.alb.alb_zone_id
  tags              = local.common_tags
}

module "jenkins" {
  source            = "../../modules/jenkins-ec2"
  project           = var.project
  vpc_id            = module.vpc.vpc_id
  public_subnet_id  = module.vpc.public_subnet_ids[0]
  instance_type     = "t3.medium"
  ssh_public_key    = var.jenkins_ssh_public_key
  jenkins_role_name = module.iam.jenkins_instance_profile_name
  allowed_ssh_cidrs = var.allowed_ssh_cidrs
  tags              = local.common_tags
}
