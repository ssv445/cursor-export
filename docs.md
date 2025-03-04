# Cursor Chat Export Data Extraction Documentation

This document details the process of extracting chat history data from Cursor IDE's SQLite databases.

## Database Structure

Cursor IDE uses two main SQLite databases to store data:

1. Workspace Database (`state.vscdb`)
   - Location: `{workspaceStorage}/{workspace_id}/state.vscdb`
   - Contains: Chat history and basic composer data

2. Global Database (`state.vscdb`)
   - Location: `{workspaceStorage}/../globalStorage/state.vscdb`
   - Contains: Detailed composer data

## Data Extraction Process

### 1. Getting Workspace List (getAllWorkspaces)

```sql
-- Retrieve chat data from workspace database
SELECT value FROM ItemTable 
WHERE [key] = 'workbench.panel.aichat.view.aichat.chatdata'
```

Extracted fields:
- `id`: Workspace ID (directory name)
- `path`: Database file path
- `folder`: Workspace folder path (from workspace.json)
- `lastModified`: Last modification time
- `chatCount`: Number of chat tabs

### 2. Getting Workspace Details (getWorkspaceDetail)

#### 2.1 Chat Data
```sql
-- Retrieve chat data from workspace database
SELECT value FROM ItemTable
WHERE [key] = 'workbench.panel.aichat.view.aichat.chatdata'
```

Data structure extracted:
- `tabs`: List of chat tabs
  - `id`: Tab ID
  - `title`: Chat title
  - `timestamp`: Last message time
  - `bubbles`: List of conversation bubbles
    - `type`: Message type ('ai' or 'user')
    - `text`: Message text
    - `codeBlocks`: List of code blocks

#### 2.2 Composer Data
```sql
-- Get composer index from workspace database
SELECT value FROM ItemTable
WHERE [key] = 'composer.composerData'

-- Get detailed composer data from global database
SELECT value FROM cursorDiskKV
WHERE [key] in (${composerIds})
```

### 3. Timestamp Processing

All timestamps are processed through the `safeParseTimestamp` function:
- Input: Unix timestamp or ISO string
- Output: Standardized ISO format timestamp string
- Error handling: Returns current time for invalid timestamps

## Data Structure Examples

### Workspace Information
```json
{
  "id": "workspace_id",
  "path": "/path/to/state.vscdb",
  "folder": "/project/path",
  "lastModified": "2024-03-03T15:45:22.139Z",
  "chatCount": 5
}
```

### Chat Data
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
          "text": "User message",
          "codeBlocks": []
        },
        {
          "type": "ai",
          "text": "AI response",
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

## Important Notes

1. Database Access
   - Using `sqlite` and `sqlite3` packages for database operations
   - Database connections are closed after each operation

2. Error Handling
   - File existence verification
   - JSON parsing error handling
   - Timestamp validation and correction

3. Performance Considerations
   - Processing data separately by workspace
   - Using asynchronous operations to avoid blocking
   - Batch retrieval of composer data 
