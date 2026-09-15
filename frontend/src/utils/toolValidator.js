/**
 * Tool Name Validation & Optimization Helper
 * Prevents random keyboard mashing (e.g. 'asdfgh', 'qwerty', '12345', 'aaaaa')
 * and auto-formats valid tool names cleanly.
 */

export function isValidToolName(input) {
  if (!input || typeof input !== 'string') return false;
  const trimmed = input.trim();
  
  // 1. Length check: Must be at least 2 chars, or known single-letter tech names like 'C' or 'R'
  if (trimmed.length < 2) {
    if (['C', 'R'].includes(trimmed.toUpperCase())) return true;
    return false;
  }
  if (trimmed.length > 40) return false;

  // 2. Must contain at least one letter (a-z, A-Z)
  if (!/[a-zA-Z]/.test(trimmed)) return false;

  // 3. Reject pure numbers or special symbols only (e.g., "12345", "!!!", "---")
  if (/^[0-9\W_]+$/.test(trimmed)) return false;

  // 4. Reject 3+ repeating characters (e.g., "aaaa", "zzzz", "ffff")
  if (/(.)\1{2,}/i.test(trimmed)) return false;

  // 5. Reject common keyboard mash sequences
  const mashRegex = /asdf|dfgh|fghj|ghjk|hjkl|qwert|werty|ertyu|rtyui|tyuio|yuiop|zxcv|xcvb|cvbn|vbnm|lkjh|kjhg|jhgf|hgfd|gfdsa|1234|2345|3456|4567|5678|6789/i;
  if (mashRegex.test(trimmed.toLowerCase()) && trimmed.length < 16) return false;

  // 6. Reject 5+ consecutive consonants (keyboard mash like "dfghjk", "zxcvb")
  // Allows valid acronyms/tech names like "PDF", "SDK", "API", "GraphQL", "gRPC"
  const consecutiveConsonants = /[bcdfghjklmnpqrstvwxyz]{5,}/i;
  if (consecutiveConsonants.test(trimmed.toLowerCase()) && !/pdf|sdk|api|html|css|grpc|rtsp|xlsx|json|graphql/i.test(trimmed.toLowerCase())) {
    return false;
  }

  return true;
}

export function formatToolName(input) {
  if (!input) return '';
  const trimmed = input.trim().replace(/\s+/g, ' ');
  // Auto Title-Case if all lowercase (e.g., "python script" -> "Python Script", "docker" -> "Docker")
  if (trimmed === trimmed.toLowerCase()) {
    return trimmed.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }
  return trimmed;
}
