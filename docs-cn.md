# Cursor Chat Export 数据提取说明文档

本文档详细说明了从 Cursor IDE 的 SQLite 数据库中提取聊天历史数据的过程。

## 数据库结构

Cursor IDE 使用两个主要的 SQLite 数据库来存储数据：

1. 工作区数据库 (`state.vscdb`)
   - 位置：`{workspaceStorage}/{workspace_id}/state.vscdb`
   - 包含：聊天历史和基本的 composer 数据

2. 全局数据库 (`state.vscdb`)
   - 位置：`{workspaceStorage}/../globalStorage/state.vscdb`
   - 包含：详细的 composer 数据

## 数据提取流程

### 1. 工作区列表获取 (getAllWorkspaces)

```sql
-- 从工作区数据库中获取聊天数据
SELECT value FROM ItemTable 
WHERE [key] = 'workbench.panel.aichat.view.aichat.chatdata'
```

提取的字段：
- `id`: 工作区ID（目录名）
- `path`: 数据库文件路径
- `folder`: 工作区文件夹路径（来自 workspace.json）
- `lastModified`: 最后修改时间
- `chatCount`: 聊天标签页数量

### 2. 工作区详细信息获取 (getWorkspaceDetail)

#### 2.1 聊天数据
```sql
-- 从工作区数据库获取聊天数据
SELECT value FROM ItemTable
WHERE [key] = 'workbench.panel.aichat.view.aichat.chatdata'
```

提取的数据结构：
- `tabs`: 聊天标签页列表
  - `id`: 标签页ID
  - `title`: 聊天标题
  - `timestamp`: 最后发送时间
  - `bubbles`: 对话气泡列表
    - `type`: 消息类型 ('ai' 或 'user')
    - `text`: 消息文本
    - `codeBlocks`: 代码块列表

#### 2.2 Composer 数据
```sql
-- 从工作区数据库获取 composer 索引
SELECT value FROM ItemTable
WHERE [key] = 'composer.composerData'

-- 从全局数据库获取详细 composer 数据
SELECT value FROM cursorDiskKV
WHERE [key] in (${composerIds})
```

### 3. 时间戳处理

所有时间戳都通过 `safeParseTimestamp` 函数处理：
- 输入：Unix 时间戳或 ISO 字符串
- 输出：标准化的 ISO 格式时间字符串
- 错误处理：无效时间戳返回当前时间

## 数据结构示例

### 工作区信息
```json
{
  "id": "workspace_id",
  "path": "/path/to/state.vscdb",
  "folder": "/project/path",
  "lastModified": "2024-03-03T15:45:22.139Z",
  "chatCount": 5
}
```

### 聊天数据
```json
{
  "tabs": [
    {
      "id": "tab_id",
      "title": "Chat Title",
      "timestamp": "2024-03-03T15:45:22.139Z",
      "bubbles": [
        {
          "type": "user",
          "text": "用户消息",
          "codeBlocks": []
        },
        {
          "type": "ai",
          "text": "AI 回复",
          "codeBlocks": [
            {
              "language": "typescript",
              "code": "console.log('Hello');"
            }
          ]
        }
      ]
    }
  ]
}
```

## 注意事项

1. 数据库访问
   - 使用 `sqlite` 和 `sqlite3` 包进行数据库操作
   - 每次操作后都会关闭数据库连接

2. 错误处理
   - 文件不存在检查
   - JSON 解析错误处理
   - 时间戳验证和修正

3. 性能考虑
   - 按工作区分别处理数据
   - 使用异步操作避免阻塞
   - 批量获取 composer 数据 
