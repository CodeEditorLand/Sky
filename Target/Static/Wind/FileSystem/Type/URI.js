var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class URI {
  static {
    __name(this, "URI");
  }
  /** URI scheme (e.g., "file") */
  scheme;
  /** URI authority (e.g., "localhost") */
  authority;
  /** URI path (e.g., "/path/to/file") */
  path;
  /** URI query string */
  query;
  /** URI fragment */
  fragment;
  constructor(scheme, authority, path, query, fragment) {
    this.scheme = scheme;
    this.authority = authority;
    this.path = path;
    this.query = query;
    this.fragment = fragment;
  }
  /**
   * Create a URI from file path
   * @param path - File system path
   * @returns File URI
   */
  static file(path) {
    return new URI("file", "", path, "", "");
  }
  /**
   * Parse a URI string
   * @param value - URI string (e.g., "file:///path/to/file")
   * @returns Parsed URI
   */
  static parse(value) {
    const schemeMatch = value.match(/^([a-zA-Z][a-zA-Z0-9+\-.]*):/);
    if (!schemeMatch || !schemeMatch[1]) {
      throw new Error(`Invalid URI scheme: ${value}`);
    }
    const scheme = schemeMatch[1];
    const rest = value.substring(scheme.length + 1);
    let authority = "";
    let path = "";
    let query = "";
    let fragment = "";
    if (rest.startsWith("//")) {
      const afterAuthority = rest.substring(2);
      const authorityEnd = afterAuthority.indexOf("/");
      if (authorityEnd === -1) {
        authority = afterAuthority;
      } else {
        authority = afterAuthority.substring(0, authorityEnd);
        path = afterAuthority.substring(authorityEnd);
      }
    } else {
      path = rest;
    }
    const queryIndex = path.indexOf("?");
    const fragmentIndex = path.indexOf("#");
    if (queryIndex !== -1) {
      query = path.substring(queryIndex + 1);
      path = path.substring(0, queryIndex);
    }
    if (fragmentIndex !== -1) {
      fragment = path.substring(fragmentIndex + 1);
      path = path.substring(0, fragmentIndex);
    }
    return new URI(scheme, authority, path, query ?? "", fragment ?? "");
  }
  /**
   * Convert URI to string
   * @returns String representation of the URI
   */
  toString() {
    let result = `${this.scheme}:`;
    if (this.authority) {
      result += `//${this.authority}`;
    }
    result += this.path;
    if (this.query) {
      result += `?${this.query}`;
    }
    if (this.fragment) {
      result += `#${this.fragment}`;
    }
    return result;
  }
  /**
   * Get file system path from file URI
   * @returns File system path, or null if not a file URI
   */
  fsPath() {
    if (this.scheme !== "file") {
      return null;
    }
    if (/^[a-zA-Z]:/.test(this.path)) {
      return this.path.replace(/\//g, "\\");
    }
    return this.path;
  }
  /**
   * Get directory path from file URI
   * @returns URI of parent directory
   */
  dirname() {
    const lastSlash = this.path.lastIndexOf("/");
    if (lastSlash === -1) {
      return this;
    }
    const dirPath = this.path.substring(0, lastSlash) || "/";
    return new URI(this.scheme, this.authority, dirPath, this.query, this.fragment);
  }
  /**
   * Get file name from URI
   * @returns Base name of the file
   */
  basename() {
    const lastSlash = this.path.lastIndexOf("/");
    if (lastSlash === -1) {
      return this.path;
    }
    return this.path.substring(lastSlash + 1);
  }
  /**
   * Join path components to URI
   * @param segments - Path segments to join
   * @returns New URI with joined path
   */
  join(...segments) {
    let newPath = this.path;
    for (const segment of segments) {
      if (newPath.endsWith("/")) {
        newPath = newPath + segment;
      } else {
        newPath = newPath + "/" + segment;
      }
    }
    return new URI(
      this.scheme,
      this.authority,
      newPath,
      this.query,
      this.fragment
    );
  }
  /**
   * Check if two URIs are equal
   * @param other - URI to compare
   * @returns True if URIs are equal
   */
  equals(other) {
    return this.scheme === other.scheme && this.authority === other.authority && this.path === other.path && this.query === other.query && this.fragment === other.fragment;
  }
  /**
   * Create URI from JSON object
   * @param json - JSON representation of URI
   * @returns URI instance
   */
  static fromJSON(json) {
    return new URI(
      json.scheme,
      json.authority,
      json.path,
      json.query,
      json.fragment
    );
  }
  /**
   * Convert URI to JSON object
   * @returns JSON representation of URI
   */
  toJSON() {
    return {
      scheme: this.scheme,
      authority: this.authority,
      path: this.path,
      query: this.query,
      fragment: this.fragment
    };
  }
}
export {
  URI
};
//# sourceMappingURL=URI.js.map
