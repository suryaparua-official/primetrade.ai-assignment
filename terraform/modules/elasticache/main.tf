resource "aws_elasticache_subnet_group" "redis" {
  name       = "${var.project}-redis-subnet-group"
  subnet_ids = var.private_subnet_ids
  tags       = var.tags
}

resource "aws_security_group" "redis" {
  name        = "${var.project}-redis-sg"
  description = "Allow Redis from EKS nodes only"
  vpc_id      = var.vpc_id

  ingress {
    from_port   = 6379
    to_port     = 6379
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(var.tags, { Name = "${var.project}-redis-sg" })
}

resource "aws_elasticache_replication_group" "redis" {
  replication_group_id = "${var.project}-redis"
  description          = "Redis cluster for ${var.project}"

  node_type            = var.node_type       # cache.t3.micro for demo
  num_cache_clusters   = var.num_replicas    # 1 for demo, 2 for prod

  engine               = "redis"
  engine_version       = "7.1"
  port                 = 6379

  subnet_group_name    = aws_elasticache_subnet_group.redis.name
  security_group_ids   = [aws_security_group.redis.id]

  at_rest_encryption_enabled = true
  transit_encryption_enabled = true

  automatic_failover_enabled = var.num_replicas > 1 ? true : false
  multi_az_enabled           = var.num_replicas > 1 ? true : false

  apply_immediately          = true

  tags = merge(var.tags, { Name = "${var.project}-redis" })
}
