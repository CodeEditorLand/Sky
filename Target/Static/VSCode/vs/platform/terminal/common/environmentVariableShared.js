var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { IEnvironmentVariableCollectionDescription, IEnvironmentVariableCollection, IEnvironmentVariableMutator, ISerializableEnvironmentDescriptionMap, ISerializableEnvironmentVariableCollection, ISerializableEnvironmentVariableCollections } from "./environmentVariable.js";
function serializeEnvironmentVariableCollection(collection) {
  return [...collection.entries()];
}
__name(serializeEnvironmentVariableCollection, "serializeEnvironmentVariableCollection");
function serializeEnvironmentDescriptionMap(descriptionMap) {
  return descriptionMap ? [...descriptionMap.entries()] : [];
}
__name(serializeEnvironmentDescriptionMap, "serializeEnvironmentDescriptionMap");
function deserializeEnvironmentVariableCollection(serializedCollection) {
  return new Map(serializedCollection);
}
__name(deserializeEnvironmentVariableCollection, "deserializeEnvironmentVariableCollection");
function deserializeEnvironmentDescriptionMap(serializableEnvironmentDescription) {
  return new Map(serializableEnvironmentDescription ?? []);
}
__name(deserializeEnvironmentDescriptionMap, "deserializeEnvironmentDescriptionMap");
function serializeEnvironmentVariableCollections(collections) {
  return Array.from(collections.entries()).map((e) => {
    return [e[0], serializeEnvironmentVariableCollection(e[1].map), serializeEnvironmentDescriptionMap(e[1].descriptionMap)];
  });
}
__name(serializeEnvironmentVariableCollections, "serializeEnvironmentVariableCollections");
function deserializeEnvironmentVariableCollections(serializedCollection) {
  return new Map(serializedCollection.map((e) => {
    return [e[0], { map: deserializeEnvironmentVariableCollection(e[1]), descriptionMap: deserializeEnvironmentDescriptionMap(e[2]) }];
  }));
}
__name(deserializeEnvironmentVariableCollections, "deserializeEnvironmentVariableCollections");
export {
  deserializeEnvironmentDescriptionMap,
  deserializeEnvironmentVariableCollection,
  deserializeEnvironmentVariableCollections,
  serializeEnvironmentDescriptionMap,
  serializeEnvironmentVariableCollection,
  serializeEnvironmentVariableCollections
};
//# sourceMappingURL=environmentVariableShared.js.map
