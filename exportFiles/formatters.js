// Format datetime to yyyy-mm-dd hh:mm:ss
function formatDateTime(dateStr) {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// Generate safe filename from title
function getSafeFilename(timestamp, title) {
  const dateStr = formatDateTime(timestamp).replace(/[: ]/g, '-');
  // Remove or replace invalid filename characters
  const safeTitle = title.replace(/[<>:"/\\|?*]/g, '-').replace(/\s+/g, '-');
  
  // Limit total filename length (including date prefix)
  const MAX_FILENAME_LENGTH = 160; // 大多数文件系统的最大文件名长度
  const combinedName = `${dateStr}--${safeTitle}`;
  
  if (combinedName.length > MAX_FILENAME_LENGTH) {
    // 如果超过最大长度，截断标题部分
    const truncatedTitle = safeTitle.substring(0, MAX_FILENAME_LENGTH - dateStr.length - 4); // 预留 '--' 的空间
    return `${dateStr}--${truncatedTitle}`;
  }
  
  return combinedName;
}

module.exports = {
  formatDateTime,
  getSafeFilename
}; 
