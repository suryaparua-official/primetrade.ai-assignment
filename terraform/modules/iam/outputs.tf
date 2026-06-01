output "eks_cluster_role_arn"          { value = aws_iam_role.eks_cluster.arn }
output "eks_node_role_arn"             { value = aws_iam_role.eks_nodes.arn }
output "jenkins_role_arn"              { value = aws_iam_role.jenkins.arn }
output "jenkins_instance_profile_name" { value = aws_iam_instance_profile.jenkins.name }
output "eso_role_arn"                  { value = aws_iam_role.eso.arn }
output "user_service_role_arn"         { value = aws_iam_role.user_service.arn }
output "task_service_role_arn"         { value = aws_iam_role.task_service.arn }
