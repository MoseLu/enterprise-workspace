#!/bin/bash

# BTC ShopFlow Kubernetes 部署脚本
# 使用方法: ./deploy.sh [environment] [action]
# 环境: dev|prod (默认: dev)
# 操作: deploy|delete|status (默认: deploy)

set -e

# 默认参数
ENVIRONMENT=${1:-dev}
ACTION=${2:-deploy}
NAMESPACE="btc-shopflow"

if [ "$ENVIRONMENT" = "dev" ]; then
    NAMESPACE="btc-shopflow-dev"
fi

echo "🚀 BTC ShopFlow K8s 部署工具"
echo "环境: $ENVIRONMENT"
echo "命名空间: $NAMESPACE"
echo "操作: $ACTION"
echo "================================"

# 检查 kubectl 连接
if ! kubectl cluster-info &> /dev/null; then
    echo "❌ 错误: 无法连接到 Kubernetes 集群"
    echo "请检查 kubectl 配置和集群连接"
    exit 1
fi

# 检查命名空间
check_namespace() {
    if ! kubectl get namespace $NAMESPACE &> /dev/null; then
        echo "📝 创建命名空间: $NAMESPACE"
        kubectl apply -f namespace.yaml
    else
        echo "✅ 命名空间已存在: $NAMESPACE"
    fi
}

# 部署应用
deploy_apps() {
    echo "🔧 部署配置文件..."
    
    # 1. 创建命名空间
    check_namespace
    
    # 2. 应用 ConfigMap
    echo "📋 应用配置映射..."
    kubectl apply -f configmap.yaml -n $NAMESPACE
    
    # 3. 部署核心应用
    echo "🏗️  部署核心应用..."
    kubectl apply -f deployments/system-app.yaml -n $NAMESPACE
    kubectl apply -f deployments/admin-app.yaml -n $NAMESPACE
    kubectl apply -f deployments/finance-app.yaml -n $NAMESPACE
    
    # 4. 部署其他应用
    echo "📦 部署其他应用..."
    kubectl apply -f deployments/complete-apps.yaml -n $NAMESPACE
    
    # 5. 配置 Ingress
    echo "🌐 配置 Ingress..."
    kubectl apply -f ingress.yaml -n $NAMESPACE
    
    # 6. 配置自动扩展
    echo "📈 配置自动扩展..."
    kubectl apply -f hpa.yaml -n $NAMESPACE
    
    echo "✅ 部署完成!"
    echo ""
    echo "📊 查看部署状态:"
    echo "kubectl get pods -n $NAMESPACE"
    echo "kubectl get services -n $NAMESPACE"
    echo "kubectl get ingress -n $NAMESPACE"
}

# 删除应用
delete_apps() {
    echo "🗑️  删除应用..."
    
    kubectl delete -f hpa.yaml -n $NAMESPACE --ignore-not-found=true
    kubectl delete -f ingress.yaml -n $NAMESPACE --ignore-not-found=true
    kubectl delete -f deployments/ -n $NAMESPACE --ignore-not-found=true
    kubectl delete -f configmap.yaml -n $NAMESPACE --ignore-not-found=true
    
    echo "✅ 删除完成!"
}

# 查看状态
show_status() {
    echo "📊 当前部署状态:"
    echo ""
    
    echo "🏷️  命名空间:"
    kubectl get namespace | grep btc-shopflow || echo "未找到相关命名空间"
    echo ""
    
    echo "🚀 Pod 状态:"
    kubectl get pods -n $NAMESPACE -o wide 2>/dev/null || echo "命名空间 $NAMESPACE 不存在或无 Pod"
    echo ""
    
    echo "🔗 服务状态:"
    kubectl get services -n $NAMESPACE 2>/dev/null || echo "命名空间 $NAMESPACE 不存在或无服务"
    echo ""
    
    echo "🌐 Ingress 状态:"
    kubectl get ingress -n $NAMESPACE 2>/dev/null || echo "命名空间 $NAMESPACE 不存在或无 Ingress"
    echo ""
    
    echo "📈 HPA 状态:"
    kubectl get hpa -n $NAMESPACE 2>/dev/null || echo "命名空间 $NAMESPACE 不存在或无 HPA"
}

# 等待部署就绪
wait_for_deployment() {
    echo "⏳ 等待部署就绪..."
    
    deployments=("btc-system-app" "btc-admin-app" "btc-finance-app" "btc-logistics-app" "btc-quality-app" "btc-production-app" "btc-engineering-app")
    
    for deployment in "${deployments[@]}"; do
        echo "等待 $deployment 就绪..."
        kubectl rollout status deployment/$deployment -n $NAMESPACE --timeout=300s
    done
    
    echo "✅ 所有核心应用已就绪!"
}

# 主逻辑
case $ACTION in
    "deploy")
        deploy_apps
        wait_for_deployment
        show_status
        ;;
    "delete")
        delete_apps
        ;;
    "status")
        show_status
        ;;
    *)
        echo "❌ 未知操作: $ACTION"
        echo "支持的操作: deploy, delete, status"
        exit 1
        ;;
esac

echo ""
echo "🎉 操作完成!"
