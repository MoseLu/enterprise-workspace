#!/bin/bash

# Jenkins Job 自动创建脚本
# 使用方法：在 Jenkins 服务器上运行此脚本（需要 Jenkins CLI）

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

JENKINS_URL="${JENKINS_URL:-http://localhost:8080}"
JOB_NAME="btc-shopflow-deploy"

log_info "创建 Jenkins Pipeline Job: $JOB_NAME"

# 检查 Jenkins CLI
if ! command -v jenkins-cli.jar &> /dev/null && [ ! -f "jenkins-cli.jar" ]; then
    log_info "下载 Jenkins CLI..."
    curl -o jenkins-cli.jar "$JENKINS_URL/jnlpJars/jenkins-cli.jar"
fi

JENKINS_CLI="${JENKINS_CLI:-jenkins-cli.jar}"

# 创建 Job 配置 XML
cat > job-config.xml << 'EOF'
<?xml version='1.1' encoding='UTF-8'?>
<flow-definition plugin="workflow-job@2.42">
  <description>BTC ShopFlow 自动化部署 Pipeline</description>
  <keepDependencies>false</keepDependencies>
  <properties>
    <hudson.model.ParametersDefinitionProperty>
      <parameterDefinitions>
        <hudson.model.ChoiceParameterDefinition>
          <name>APP_NAME</name>
          <description>选择要部署的应用</description>
          <choices class="java.util.Arrays$ArrayList">
            <a class="string-array">
              <string>system-app</string>
              <string>admin-app</string>
              <string>logistics-app</string>
              <string>quality-app</string>
              <string>production-app</string>
              <string>engineering-app</string>
              <string>finance-app</string>
              <string>mobile-app</string>
              <string>all</string>
            </a>
          </choices>
        </hudson.model.ChoiceParameterDefinition>
        <hudson.model.StringParameterDefinition>
          <name>SERVER_HOST</name>
          <description>服务器地址</description>
          <defaultValue>47.112.31.96</defaultValue>
          <trim>false</trim>
        </hudson.model.StringParameterDefinition>
        <hudson.model.StringParameterDefinition>
          <name>SERVER_USER</name>
          <description>服务器用户名</description>
          <defaultValue>root</defaultValue>
          <trim>false</trim>
        </hudson.model.StringParameterDefinition>
        <hudson.model.StringParameterDefinition>
          <name>SERVER_PORT</name>
          <description>SSH 端口</description>
          <defaultValue>22</defaultValue>
          <trim>false</trim>
        </hudson.model.StringParameterDefinition>
        <hudson.model.StringParameterDefinition>
          <name>SSH_KEY_PATH</name>
          <description>SSH 私钥路径（在 Jenkins 服务器上）</description>
          <defaultValue>/var/jenkins_home/.ssh/id_rsa</defaultValue>
          <trim>false</trim>
        </hudson.model.StringParameterDefinition>
        <hudson.model.BooleanParameterDefinition>
          <name>SKIP_TESTS</name>
          <description>跳过测试（加快构建速度）</description>
          <defaultValue>true</defaultValue>
        </hudson.model.BooleanParameterDefinition>
      </parameterDefinitions>
    </hudson.model.ParametersDefinitionProperty>
  </properties>
  <definition class="org.jenkinsci.plugins.workflow.cps.CpsScmFlowDefinition" plugin="workflow-cps@2.90">
    <scm class="hudson.plugins.git.GitSCM" plugin="git@4.8.3">
      <configVersion>2</configVersion>
      <userRemoteConfigs>
        <hudson.plugins.git.UserRemoteConfig>
          <url>REPO_URL_PLACEHOLDER</url>
        </hudson.plugins.git.UserRemoteConfig>
      </userRemoteConfigs>
      <branches>
        <hudson.plugins.git.BranchSpec>
          <name>*/develop</name>
        </hudson.plugins.git.BranchSpec>
      </branches>
      <doGenerateSubmoduleConfigurations>false</doGenerateSubmoduleConfigurations>
      <submoduleCfg class="list"/>
      <extensions/>
    </scm>
    <scriptPath>Jenkinsfile</scriptPath>
    <lightweight>true</lightweight>
  </definition>
  <triggers/>
  <disabled>false</disabled>
</flow-definition>
EOF

log_info "请设置 Git 仓库 URL："
read -p "Git 仓库 URL: " REPO_URL

if [ -z "$REPO_URL" ]; then
    REPO_URL="https://github.com/BellisGit/btc-shopflow-monorepo.git"
    log_info "使用默认仓库: $REPO_URL"
fi

# 替换仓库 URL
sed -i.bak "s|REPO_URL_PLACEHOLDER|$REPO_URL|g" job-config.xml

log_info "创建 Job..."
java -jar "$JENKINS_CLI" -s "$JENKINS_URL" create-job "$JOB_NAME" < job-config.xml

if [ $? -eq 0 ]; then
    log_success "Job 创建成功！"
    log_info "访问: $JENKINS_URL/job/$JOB_NAME"
    rm -f job-config.xml job-config.xml.bak
else
    log_error "Job 创建失败"
    exit 1
fi
