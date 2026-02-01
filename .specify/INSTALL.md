# Spec Kit Installation

Spec Kit 使用 `uv` 进行包管理。请先安装 `uv`:

```shell
# 安装 uv (如果尚未安装)
curl -LsSf https://astral.sh/uv/install.sh | sh

# 或者在 Windows 上使用 winget
winget install astral-sh.uv

# 或者使用 pip
pip install uv
```

## 安装 Specify CLI

### 持久化安装（推荐）

```shell
uv tool install specify-cli --from git+https://github.com/github/spec-kit.git
```

### 一次性使用

```shell
uvx --from git+https://github.com/github/spec-kit.git specify init
```

## 升级 Specify

```shell
uv tool install specify-cli --force --from git+https://github.com/github/spec-kit.git
```

## 系统检查

运行以下命令检查所需工具是否已安装：

```shell
specify check
```

或者使用 GitHub Token：

```shell
specify init --ai claude --github-token $env:GH_TOKEN
```

## 可用命令

安装完成后，可以使用以下命令：

```shell
# 初始化新项目
specify init my-feature

# 在当前目录初始化
specify init . --ai claude

# 检查系统工具
specify check
```

## 环境要求

- Python 3.11+
- Git
- 支持的 AI Agent（Cursor、Claude Code、Codex 等）
