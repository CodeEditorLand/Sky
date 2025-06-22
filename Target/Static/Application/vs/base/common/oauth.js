var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { decodeBase64 } from "./buffer.js";
const WELL_KNOWN_ROUTE = "/.well-known";
const AUTH_PROTECTED_RESOURCE_METADATA_DISCOVERY_PATH = `${WELL_KNOWN_ROUTE}/oauth-protected-resource`;
const AUTH_SERVER_METADATA_DISCOVERY_PATH = `${WELL_KNOWN_ROUTE}/oauth-authorization-server`;
const AUTH_SCOPE_SEPARATOR = " ";
var AuthorizationErrorType;
(function(AuthorizationErrorType2) {
  AuthorizationErrorType2["InvalidRequest"] = "invalid_request";
  AuthorizationErrorType2["InvalidClient"] = "invalid_client";
  AuthorizationErrorType2["InvalidGrant"] = "invalid_grant";
  AuthorizationErrorType2["UnauthorizedClient"] = "unauthorized_client";
  AuthorizationErrorType2["UnsupportedGrantType"] = "unsupported_grant_type";
  AuthorizationErrorType2["InvalidScope"] = "invalid_scope";
})(AuthorizationErrorType || (AuthorizationErrorType = {}));
var AuthorizationDeviceCodeErrorType;
(function(AuthorizationDeviceCodeErrorType2) {
  AuthorizationDeviceCodeErrorType2["AuthorizationPending"] = "authorization_pending";
  AuthorizationDeviceCodeErrorType2["SlowDown"] = "slow_down";
  AuthorizationDeviceCodeErrorType2["AccessDenied"] = "access_denied";
  AuthorizationDeviceCodeErrorType2["ExpiredToken"] = "expired_token";
})(AuthorizationDeviceCodeErrorType || (AuthorizationDeviceCodeErrorType = {}));
function isAuthorizationProtectedResourceMetadata(obj) {
  if (typeof obj !== "object" || obj === null) {
    return false;
  }
  const metadata = obj;
  return metadata.resource !== void 0;
}
__name(isAuthorizationProtectedResourceMetadata, "isAuthorizationProtectedResourceMetadata");
function isAuthorizationServerMetadata(obj) {
  if (typeof obj !== "object" || obj === null) {
    return false;
  }
  const metadata = obj;
  return metadata.issuer !== void 0;
}
__name(isAuthorizationServerMetadata, "isAuthorizationServerMetadata");
function isAuthorizationDynamicClientRegistrationResponse(obj) {
  if (typeof obj !== "object" || obj === null) {
    return false;
  }
  const response = obj;
  return response.client_id !== void 0;
}
__name(isAuthorizationDynamicClientRegistrationResponse, "isAuthorizationDynamicClientRegistrationResponse");
function isAuthorizationAuthorizeResponse(obj) {
  if (typeof obj !== "object" || obj === null) {
    return false;
  }
  const response = obj;
  return response.code !== void 0 && response.state !== void 0;
}
__name(isAuthorizationAuthorizeResponse, "isAuthorizationAuthorizeResponse");
function isAuthorizationTokenResponse(obj) {
  if (typeof obj !== "object" || obj === null) {
    return false;
  }
  const response = obj;
  return response.access_token !== void 0 && response.token_type !== void 0;
}
__name(isAuthorizationTokenResponse, "isAuthorizationTokenResponse");
function isAuthorizationDeviceResponse(obj) {
  if (typeof obj !== "object" || obj === null) {
    return false;
  }
  const response = obj;
  return response.device_code !== void 0 && response.user_code !== void 0 && response.verification_uri !== void 0 && response.expires_in !== void 0;
}
__name(isAuthorizationDeviceResponse, "isAuthorizationDeviceResponse");
function isAuthorizationErrorResponse(obj) {
  if (typeof obj !== "object" || obj === null) {
    return false;
  }
  const response = obj;
  return response.error !== void 0;
}
__name(isAuthorizationErrorResponse, "isAuthorizationErrorResponse");
function getDefaultMetadataForUrl(authorizationServer) {
  return {
    issuer: authorizationServer.toString(),
    authorization_endpoint: new URL("/authorize", authorizationServer).toString(),
    token_endpoint: new URL("/token", authorizationServer).toString(),
    registration_endpoint: new URL("/register", authorizationServer).toString(),
    // Default values for Dynamic OpenID Providers
    // https://openid.net/specs/openid-connect-discovery-1_0.html
    response_types_supported: ["code", "id_token", "id_token token"]
  };
}
__name(getDefaultMetadataForUrl, "getDefaultMetadataForUrl");
function getMetadataWithDefaultValues(metadata) {
  const issuer = new URL(metadata.issuer);
  return {
    ...metadata,
    authorization_endpoint: metadata.authorization_endpoint ?? new URL("/authorize", issuer).toString(),
    token_endpoint: metadata.token_endpoint ?? new URL("/token", issuer).toString(),
    registration_endpoint: metadata.registration_endpoint ?? new URL("/register", issuer).toString()
  };
}
__name(getMetadataWithDefaultValues, "getMetadataWithDefaultValues");
const grantTypesSupported = ["authorization_code", "refresh_token", "urn:ietf:params:oauth:grant-type:device_code"];
const DEFAULT_AUTH_FLOW_PORT = 33418;
async function fetchDynamicRegistration(serverMetadata, clientName, scopes) {
  if (!serverMetadata.registration_endpoint) {
    throw new Error("Server does not support dynamic registration");
  }
  const response = await fetch(serverMetadata.registration_endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      client_name: clientName,
      client_uri: "https://code.visualstudio.com",
      grant_types: serverMetadata.grant_types_supported ? serverMetadata.grant_types_supported.filter((gt) => grantTypesSupported.includes(gt)) : grantTypesSupported,
      response_types: ["code"],
      redirect_uris: [
        "https://insiders.vscode.dev/redirect",
        "https://vscode.dev/redirect",
        "http://localhost/",
        "http://127.0.0.1/",
        // Added these for any server that might do
        // only exact match on the redirect URI even
        // though the spec says it should not care
        // about the port.
        `http://localhost:${DEFAULT_AUTH_FLOW_PORT}/`,
        `http://127.0.0.1:${DEFAULT_AUTH_FLOW_PORT}/`
      ],
      scope: scopes?.join(AUTH_SCOPE_SEPARATOR),
      token_endpoint_auth_method: "none"
    })
  });
  if (!response.ok) {
    throw new Error(`Registration failed: ${response.statusText}`);
  }
  const registration = await response.json();
  if (isAuthorizationDynamicClientRegistrationResponse(registration)) {
    return registration;
  }
  throw new Error(`Invalid authorization dynamic client registration response: ${JSON.stringify(registration)}`);
}
__name(fetchDynamicRegistration, "fetchDynamicRegistration");
function parseWWWAuthenticateHeader(wwwAuthenticateHeaderValue) {
  const parts = wwwAuthenticateHeaderValue.split(" ");
  const scheme = parts[0];
  const params = {};
  if (parts.length > 1) {
    const attributes = parts.slice(1).join(" ").split(",");
    attributes.forEach((attr) => {
      const [key, value] = attr.split("=").map((s) => s.trim().replace(/"/g, ""));
      params[key] = value;
    });
  }
  return { scheme, params };
}
__name(parseWWWAuthenticateHeader, "parseWWWAuthenticateHeader");
function getClaimsFromJWT(token) {
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new Error("Invalid JWT token format: token must have three parts separated by dots");
  }
  const [header, payload, _signature] = parts;
  try {
    const decodedHeader = JSON.parse(decodeBase64(header).toString());
    if (typeof decodedHeader !== "object") {
      throw new Error("Invalid JWT token format: header is not a JSON object");
    }
    const decodedPayload = JSON.parse(decodeBase64(payload).toString());
    if (typeof decodedPayload !== "object") {
      throw new Error("Invalid JWT token format: payload is not a JSON object");
    }
    return decodedPayload;
  } catch (e) {
    if (e instanceof Error) {
      throw new Error(`Failed to parse JWT token: ${e.message}`);
    }
    throw new Error("Failed to parse JWT token");
  }
}
__name(getClaimsFromJWT, "getClaimsFromJWT");
function getResourceServerBaseUrlFromDiscoveryUrl(discoveryUrl) {
  const url = new URL(discoveryUrl);
  if (!url.pathname.startsWith(AUTH_PROTECTED_RESOURCE_METADATA_DISCOVERY_PATH)) {
    throw new Error(`Invalid discovery URL: expected path to start with ${AUTH_PROTECTED_RESOURCE_METADATA_DISCOVERY_PATH}`);
  }
  const pathWithoutDiscovery = url.pathname.substring(AUTH_PROTECTED_RESOURCE_METADATA_DISCOVERY_PATH.length);
  const baseUrl = new URL(url.origin);
  baseUrl.pathname = pathWithoutDiscovery || "/";
  return baseUrl.toString();
}
__name(getResourceServerBaseUrlFromDiscoveryUrl, "getResourceServerBaseUrlFromDiscoveryUrl");
export {
  AUTH_PROTECTED_RESOURCE_METADATA_DISCOVERY_PATH,
  AUTH_SCOPE_SEPARATOR,
  AUTH_SERVER_METADATA_DISCOVERY_PATH,
  AuthorizationDeviceCodeErrorType,
  AuthorizationErrorType,
  DEFAULT_AUTH_FLOW_PORT,
  fetchDynamicRegistration,
  getClaimsFromJWT,
  getDefaultMetadataForUrl,
  getMetadataWithDefaultValues,
  getResourceServerBaseUrlFromDiscoveryUrl,
  isAuthorizationAuthorizeResponse,
  isAuthorizationDeviceResponse,
  isAuthorizationDynamicClientRegistrationResponse,
  isAuthorizationErrorResponse,
  isAuthorizationProtectedResourceMetadata,
  isAuthorizationServerMetadata,
  isAuthorizationTokenResponse,
  parseWWWAuthenticateHeader
};
//# sourceMappingURL=oauth.js.map
