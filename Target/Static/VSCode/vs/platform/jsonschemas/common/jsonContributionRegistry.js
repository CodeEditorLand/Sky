var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Emitter, Event } from "../../../base/common/event.js";
import { getCompressedContent, IJSONSchema } from "../../../base/common/jsonSchema.js";
import { DisposableStore, IDisposable, toDisposable } from "../../../base/common/lifecycle.js";
import * as platform from "../../registry/common/platform.js";
const Extensions = {
  JSONContribution: "base.contributions.json"
};
function normalizeId(id) {
  if (id.length > 0 && id.charAt(id.length - 1) === "#") {
    return id.substring(0, id.length - 1);
  }
  return id;
}
__name(normalizeId, "normalizeId");
class JSONContributionRegistry {
  static {
    __name(this, "JSONContributionRegistry");
  }
  schemasById = {};
  schemaAssociations = {};
  _onDidChangeSchema = new Emitter();
  onDidChangeSchema = this._onDidChangeSchema.event;
  _onDidChangeSchemaAssociations = new Emitter();
  onDidChangeSchemaAssociations = this._onDidChangeSchemaAssociations.event;
  registerSchema(uri, unresolvedSchemaContent, store) {
    const normalizedUri = normalizeId(uri);
    this.schemasById[normalizedUri] = unresolvedSchemaContent;
    this._onDidChangeSchema.fire(uri);
    if (store) {
      store.add(toDisposable(() => {
        delete this.schemasById[normalizedUri];
        this._onDidChangeSchema.fire(uri);
      }));
    }
  }
  registerSchemaAssociation(uri, glob) {
    const normalizedUri = normalizeId(uri);
    if (!this.schemaAssociations[normalizedUri]) {
      this.schemaAssociations[normalizedUri] = [];
    }
    if (!this.schemaAssociations[normalizedUri].includes(glob)) {
      this.schemaAssociations[normalizedUri].push(glob);
      this._onDidChangeSchemaAssociations.fire();
    }
    return toDisposable(() => {
      const associations = this.schemaAssociations[normalizedUri];
      if (associations) {
        const index = associations.indexOf(glob);
        if (index !== -1) {
          associations.splice(index, 1);
          if (associations.length === 0) {
            delete this.schemaAssociations[normalizedUri];
          }
          this._onDidChangeSchemaAssociations.fire();
        }
      }
    });
  }
  notifySchemaChanged(uri) {
    this._onDidChangeSchema.fire(uri);
  }
  getSchemaContributions() {
    return {
      schemas: this.schemasById
    };
  }
  getSchemaContent(uri) {
    const schema = this.schemasById[uri];
    return schema ? getCompressedContent(schema) : void 0;
  }
  hasSchemaContent(uri) {
    return !!this.schemasById[uri];
  }
  getSchemaAssociations() {
    return this.schemaAssociations;
  }
}
const jsonContributionRegistry = new JSONContributionRegistry();
platform.Registry.add(Extensions.JSONContribution, jsonContributionRegistry);
export {
  Extensions
};
//# sourceMappingURL=jsonContributionRegistry.js.map
