# MCP Configuration Setup Guide

Your MCP configuration has been enhanced with powerful servers for fullstack TypeScript development. Here's what you now have access to:

## 🚀 Available MCP Servers

### 1. **Fetch Server** - Internet Access

- **Purpose**: Fetch content from any URL
- **Tools**: `fetch` - Download web pages, APIs, documentation
- **Status**: ✅ Ready to use

### 2. **Filesystem Server** - Codebase Search

- **Purpose**: Deep filesystem access and search
- **Tools**: `read_file`, `list_directory`, `search_files`
- **Scope**: Your entire `/home/zeyad/projects` directory
- **Status**: ✅ Ready to use

### 3. **GitHub Server** - Repository Integration

- **Purpose**: Search GitHub, access repositories, issues
- **Tools**: `search_repositories`, `get_file_contents`, `list_issues`
- **Status**: ⚠️ Needs GitHub token

### 4. **Brave Search Server** - Web Search

- **Purpose**: Search the internet for documentation, solutions
- **Tools**: `brave_web_search`
- **Status**: ⚠️ Needs Brave API key

### 5. **SQLite Server** - Database Access

- **Purpose**: Query your development database
- **Tools**: `read_query`, `list_tables`, `describe_table`
- **Database**: `/home/zeyad/projects/backspace/apps/server/dev.db`
- **Status**: ✅ Ready to use (when DB exists)

### 6. **Git Server** - Version Control

- **Purpose**: Git operations and history
- **Tools**: `git_status`, `git_diff`, `git_log`, `git_show`
- **Repository**: Your current backspace project
- **Status**: ✅ Ready to use

### 7. **Shell Server** - Command Execution

- **Purpose**: Run shell commands
- **Tools**: `run_command`
- **Status**: ✅ Ready to use

## 🔧 Setup Required API Keys

### GitHub Personal Access Token

1. Go to https://github.com/settings/tokens
2. Generate a new token with these scopes:
   - `repo` (for private repos)
   - `public_repo` (for public repos)
   - `read:org` (for organization access)
3. Copy the token and run:

```bash
# Edit the MCP config
nano ~/.kiro/settings/mcp.json

# Replace the empty GITHUB_PERSONAL_ACCESS_TOKEN value with your token
```

### Brave Search API Key (Optional but Recommended)

1. Go to https://api.search.brave.com/app/keys
2. Create a free account and generate an API key
3. Add it to your MCP config:

```bash
# Edit the MCP config
nano ~/.kiro/settings/mcp.json

# Replace the empty BRAVE_API_KEY value with your key
```

## 🧪 Test Your Setup

After setting up the API keys, test each server:

```bash
# Test if uv/uvx is installed
uvx --version

# If not installed, install uv first:
curl -LsSf https://astral.sh/uv/install.sh | sh
```

## 💡 Usage Examples

Once configured, you can ask Kiro to:

- **Search your codebase**: "Find all TypeScript files that use TanStack Router"
- **Query your database**: "Show me the schema for the customers table"
- **Search GitHub**: "Find React 19 examples with TypeScript"
- **Web search**: "Latest Bun performance benchmarks"
- **Git operations**: "Show me the recent commits"
- **Run commands**: "Run the test suite"

## 🔄 Restart Kiro

After making changes to your MCP config, restart Kiro or use the MCP Server view to reconnect the servers.

## 🛠️ Troubleshooting

If a server fails to start:

1. Check that `uv` and `uvx` are installed
2. Verify API keys are correctly set
3. Check the MCP Server view in Kiro for error messages
4. Ensure file paths exist (especially for SQLite and Git servers)

Your MCP configuration is now optimized for TypeScript fullstack development with comprehensive access to your codebase, internet resources, and development tools!
