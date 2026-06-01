# ─── Security Group ───────────────────────────────────────────────────────────
resource "aws_security_group" "jenkins" {
  name        = "${var.project}-jenkins-sg"
  description = "Jenkins EC2 — SSH + port 8080"
  vpc_id      = var.vpc_id

  # SSH — restrict to your IP in production!
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = var.allowed_ssh_cidrs
  }

  # Jenkins UI
  ingress {
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = var.allowed_ssh_cidrs
  }

  # All outbound (needs to pull from ECR, GitHub, apt)
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(var.tags, { Name = "${var.project}-jenkins-sg" })
}

# ─── IAM Role for Jenkins EC2 (ECR push + EKS describe) ──────────────────────
resource "aws_iam_role" "jenkins" {
  name = "${var.project}-jenkins-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Action    = "sts:AssumeRole"
      Principal = { Service = "ec2.amazonaws.com" }
    }]
  })

  tags = var.tags
}

resource "aws_iam_role_policy" "jenkins_ecr" {
  name = "${var.project}-jenkins-ecr-policy"
  role = aws_iam_role.jenkins.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "ECRAuth"
        Effect = "Allow"
        Action = ["ecr:GetAuthorizationToken"]
        Resource = "*"
      },
      {
        Sid    = "ECRPush"
        Effect = "Allow"
        Action = [
          "ecr:BatchGetImage",
          "ecr:BatchCheckLayerAvailability",
          "ecr:CompleteLayerUpload",
          "ecr:GetDownloadUrlForLayer",
          "ecr:InitiateLayerUpload",
          "ecr:PutImage",
          "ecr:UploadLayerPart",
          "ecr:DescribeRepositories",
          "ecr:ListImages"
        ]
        Resource = "arn:aws:ecr:${var.aws_region}:${var.aws_account_id}:repository/${var.project}/*"
      },
      {
        Sid    = "EKSDescribe"
        Effect = "Allow"
        Action = [
          "eks:DescribeCluster",
          "eks:ListClusters"
        ]
        Resource = "*"
      },
      {
        Sid    = "SecretsRead"
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue",
          "secretsmanager:DescribeSecret"
        ]
        Resource = "arn:aws:secretsmanager:${var.aws_region}:${var.aws_account_id}:secret:${var.project}/*"
      }
    ]
  })
}

resource "aws_iam_instance_profile" "jenkins" {
  name = "${var.project}-jenkins-profile"
  role = aws_iam_role.jenkins.name
  tags = var.tags
}

# ─── Latest Ubuntu 24.04 AMI ──────────────────────────────────────────────────
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd-gp3/ubuntu-noble-24.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# ─── Key Pair ─────────────────────────────────────────────────────────────────
resource "aws_key_pair" "jenkins" {
  key_name   = "${var.project}-jenkins-key"
  public_key = var.ssh_public_key
  tags       = var.tags
}

# ─── EC2 Instance ─────────────────────────────────────────────────────────────
resource "aws_instance" "jenkins" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = var.instance_type      # t3.medium — 2 vCPU, 4GB
  key_name               = aws_key_pair.jenkins.key_name
  subnet_id              = var.public_subnet_id   # public subnet — needs internet
  vpc_security_group_ids = [aws_security_group.jenkins.id]
  iam_instance_profile   = aws_iam_instance_profile.jenkins.name

  # Root volume — 30GB enough for Docker images + builds
  root_block_device {
    volume_type           = "gp3"
    volume_size           = 30
    delete_on_termination = true
    encrypted             = true
  }

  # User data — minimal bootstrap, Ansible করবে বাকিটা
  user_data = base64encode(<<-EOF
    #!/bin/bash
    apt-get update -y
    apt-get install -y python3 python3-pip
    echo "Bootstrap complete — run Ansible playbook next"
  EOF
  )

  tags = merge(var.tags, { Name = "${var.project}-jenkins" })
}

# ─── Elastic IP (Jenkins URL stable রাখার জন্য) ───────────────────────────────
resource "aws_eip" "jenkins" {
  instance = aws_instance.jenkins.id
  domain   = "vpc"
  tags     = merge(var.tags, { Name = "${var.project}-jenkins-eip" })
}
