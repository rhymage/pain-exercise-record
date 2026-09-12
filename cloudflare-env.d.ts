declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    BUCKET?: R2Bucket;
    RECORD_OWNER_ID?: string;
    RECORD_ALLOWED_ORIGIN?: string;
    RECORD_EDITOR_HASH?: string;
    RECORD_VIEWER_HASH?: string;
  }
}
