var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
const GradleDependencyLooseRegex = /group\s*:\s*[\'\"](.*?)[\'\"]\s*,\s*name\s*:\s*[\'\"](.*?)[\'\"]\s*,\s*version\s*:\s*[\'\"](.*?)[\'\"]/g;
const GradleDependencyCompactRegex = /[\'\"]([^\'\"\s]*?)\:([^\'\"\s]*?)\:([^\'\"\s]*?)[\'\"]/g;
const MavenDependenciesRegex = /<dependencies>([\s\S]*?)<\/dependencies>/g;
const MavenDependencyRegex = /<dependency>([\s\S]*?)<\/dependency>/g;
const MavenGroupIdRegex = /<groupId>([\s\S]*?)<\/groupId>/;
const MavenArtifactIdRegex = /<artifactId>([\s\S]*?)<\/artifactId>/;
const JavaLibrariesToLookFor = [
  // azure mgmt sdk
  { "predicate": /* @__PURE__ */ __name((groupId, artifactId) => groupId === "com.microsoft.azure" && artifactId === "azure", "predicate"), "tag": "azure" },
  { "predicate": /* @__PURE__ */ __name((groupId, artifactId) => groupId === "com.microsoft.azure" && artifactId.startsWith("azure-mgmt-"), "predicate"), "tag": "azure" },
  { "predicate": /* @__PURE__ */ __name((groupId, artifactId) => groupId.startsWith("com.microsoft.azure") && artifactId.startsWith("azure-mgmt-"), "predicate"), "tag": "azure" },
  { "predicate": /* @__PURE__ */ __name((groupId, artifactId) => groupId === "com.azure.resourcemanager" && artifactId.startsWith("azure-resourcemanager"), "predicate"), "tag": "azure" },
  // azure track2 sdk
  // java ee
  { "predicate": /* @__PURE__ */ __name((groupId, artifactId) => groupId === "javax" && artifactId === "javaee-api", "predicate"), "tag": "javaee" },
  { "predicate": /* @__PURE__ */ __name((groupId, artifactId) => groupId === "javax.xml.bind" && artifactId === "jaxb-api", "predicate"), "tag": "javaee" },
  // jdbc
  { "predicate": /* @__PURE__ */ __name((groupId, artifactId) => groupId === "mysql" && artifactId === "mysql-connector-java", "predicate"), "tag": "jdbc" },
  { "predicate": /* @__PURE__ */ __name((groupId, artifactId) => groupId === "com.microsoft.sqlserver" && artifactId === "mssql-jdbc", "predicate"), "tag": "jdbc" },
  { "predicate": /* @__PURE__ */ __name((groupId, artifactId) => groupId === "com.oracle.database.jdbc" && artifactId.startsWith("ojdbc"), "predicate"), "tag": "jdbc" },
  // jpa
  { "predicate": /* @__PURE__ */ __name((groupId, artifactId) => groupId === "org.hibernate", "predicate"), "tag": "jpa" },
  { "predicate": /* @__PURE__ */ __name((groupId, artifactId) => groupId === "org.eclipse.persistence" && artifactId === "eclipselink", "predicate"), "tag": "jpa" },
  // lombok
  { "predicate": /* @__PURE__ */ __name((groupId, artifactId) => groupId === "org.projectlombok", "predicate"), "tag": "lombok" },
  // redis
  { "predicate": /* @__PURE__ */ __name((groupId, artifactId) => groupId === "org.springframework.data" && artifactId === "spring-data-redis", "predicate"), "tag": "redis" },
  { "predicate": /* @__PURE__ */ __name((groupId, artifactId) => groupId === "redis.clients" && artifactId === "jedis", "predicate"), "tag": "redis" },
  { "predicate": /* @__PURE__ */ __name((groupId, artifactId) => groupId === "org.redisson", "predicate"), "tag": "redis" },
  { "predicate": /* @__PURE__ */ __name((groupId, artifactId) => groupId === "io.lettuce" && artifactId === "lettuce-core", "predicate"), "tag": "redis" },
  // spring boot
  { "predicate": /* @__PURE__ */ __name((groupId, artifactId) => groupId === "org.springframework.boot", "predicate"), "tag": "springboot" },
  // sql
  { "predicate": /* @__PURE__ */ __name((groupId, artifactId) => groupId === "org.jooq", "predicate"), "tag": "sql" },
  { "predicate": /* @__PURE__ */ __name((groupId, artifactId) => groupId === "org.mybatis", "predicate"), "tag": "sql" },
  // unit test
  { "predicate": /* @__PURE__ */ __name((groupId, artifactId) => groupId === "org.junit.jupiter" && artifactId === "junit-jupiter-api", "predicate"), "tag": "unitTest" },
  { "predicate": /* @__PURE__ */ __name((groupId, artifactId) => groupId === "junit" && artifactId === "junit", "predicate"), "tag": "unitTest" },
  { "predicate": /* @__PURE__ */ __name((groupId, artifactId) => groupId === "org.testng" && artifactId === "testng", "predicate"), "tag": "unitTest" },
  // cosmos
  { "predicate": /* @__PURE__ */ __name((groupId, artifactId) => groupId === "com.azure" && artifactId.includes("cosmos"), "predicate"), "tag": "azure-cosmos" },
  { "predicate": /* @__PURE__ */ __name((groupId, artifactId) => groupId === "com.azure.spring" && artifactId.includes("cosmos"), "predicate"), "tag": "azure-cosmos" },
  // storage account
  { "predicate": /* @__PURE__ */ __name((groupId, artifactId) => groupId === "com.azure" && artifactId.includes("azure-storage"), "predicate"), "tag": "azure-storage" },
  { "predicate": /* @__PURE__ */ __name((groupId, artifactId) => groupId === "com.azure.spring" && artifactId.includes("storage"), "predicate"), "tag": "azure-storage" },
  // service bus
  { "predicate": /* @__PURE__ */ __name((groupId, artifactId) => groupId === "com.azure" && artifactId === "azure-messaging-servicebus", "predicate"), "tag": "azure-servicebus" },
  { "predicate": /* @__PURE__ */ __name((groupId, artifactId) => groupId === "com.azure.spring" && artifactId.includes("servicebus"), "predicate"), "tag": "azure-servicebus" },
  // event hubs
  { "predicate": /* @__PURE__ */ __name((groupId, artifactId) => groupId === "com.azure" && artifactId.startsWith("azure-messaging-eventhubs"), "predicate"), "tag": "azure-eventhubs" },
  { "predicate": /* @__PURE__ */ __name((groupId, artifactId) => groupId === "com.azure.spring" && artifactId.includes("eventhubs"), "predicate"), "tag": "azure-eventhubs" },
  // ai related libraries
  { "predicate": /* @__PURE__ */ __name((groupId, artifactId) => groupId === "dev.langchain4j", "predicate"), "tag": "langchain4j" },
  { "predicate": /* @__PURE__ */ __name((groupId, artifactId) => groupId === "io.springboot.ai", "predicate"), "tag": "springboot-ai" },
  { "predicate": /* @__PURE__ */ __name((groupId, artifactId) => groupId === "com.microsoft.semantic-kernel", "predicate"), "tag": "semantic-kernel" },
  { "predicate": /* @__PURE__ */ __name((groupId, artifactId) => groupId === "com.azure" && artifactId === "azure-ai-anomalydetector", "predicate"), "tag": "azure-ai-anomalydetector" },
  { "predicate": /* @__PURE__ */ __name((groupId, artifactId) => groupId === "com.azure" && artifactId === "azure-ai-formrecognizer", "predicate"), "tag": "azure-ai-formrecognizer" },
  { "predicate": /* @__PURE__ */ __name((groupId, artifactId) => groupId === "com.azure" && artifactId === "azure-ai-documentintelligence", "predicate"), "tag": "azure-ai-documentintelligence" },
  { "predicate": /* @__PURE__ */ __name((groupId, artifactId) => groupId === "com.azure" && artifactId === "azure-ai-translation-document", "predicate"), "tag": "azure-ai-translation-document" },
  { "predicate": /* @__PURE__ */ __name((groupId, artifactId) => groupId === "com.azure" && artifactId === "azure-ai-personalizer", "predicate"), "tag": "azure-ai-personalizer" },
  { "predicate": /* @__PURE__ */ __name((groupId, artifactId) => groupId === "com.azure" && artifactId === "azure-ai-translation-text", "predicate"), "tag": "azure-ai-translation-text" },
  { "predicate": /* @__PURE__ */ __name((groupId, artifactId) => groupId === "com.azure" && artifactId === "azure-ai-contentsafety", "predicate"), "tag": "azure-ai-contentsafety" },
  { "predicate": /* @__PURE__ */ __name((groupId, artifactId) => groupId === "com.azure" && artifactId === "azure-ai-vision-imageanalysis", "predicate"), "tag": "azure-ai-vision-imageanalysis" },
  { "predicate": /* @__PURE__ */ __name((groupId, artifactId) => groupId === "com.azure" && artifactId === "azure-ai-textanalytics", "predicate"), "tag": "azure-ai-textanalytics" },
  { "predicate": /* @__PURE__ */ __name((groupId, artifactId) => groupId === "com.azure" && artifactId === "azure-search-documents", "predicate"), "tag": "azure-search-documents" },
  { "predicate": /* @__PURE__ */ __name((groupId, artifactId) => groupId === "com.azure" && artifactId === "azure-ai-documenttranslator", "predicate"), "tag": "azure-ai-documenttranslator" },
  { "predicate": /* @__PURE__ */ __name((groupId, artifactId) => groupId === "com.azure" && artifactId === "azure-ai-vision-face", "predicate"), "tag": "azure-ai-vision-face" },
  { "predicate": /* @__PURE__ */ __name((groupId, artifactId) => groupId === "com.azure" && artifactId === "azure-ai-openai-assistants", "predicate"), "tag": "azure-ai-openai-assistants" },
  { "predicate": /* @__PURE__ */ __name((groupId, artifactId) => groupId === "com.microsoft.azure.cognitiveservices", "predicate"), "tag": "azure-cognitiveservices" },
  { "predicate": /* @__PURE__ */ __name((groupId, artifactId) => groupId === "com.microsoft.cognitiveservices.speech", "predicate"), "tag": "azure-cognitiveservices-speech" },
  // open ai
  { "predicate": /* @__PURE__ */ __name((groupId, artifactId) => groupId === "com.theokanning.openai-gpt3-java", "predicate"), "tag": "openai" },
  // azure open ai
  { "predicate": /* @__PURE__ */ __name((groupId, artifactId) => groupId === "com.azure" && artifactId === "azure-ai-openai", "predicate"), "tag": "azure-openai" },
  // Azure Functions
  { "predicate": /* @__PURE__ */ __name((groupId, artifactId) => groupId === "com.microsoft.azure.functions" && artifactId === "azure-functions-java-library", "predicate"), "tag": "azure-functions" },
  // quarkus
  { "predicate": /* @__PURE__ */ __name((groupId, artifactId) => groupId === "io.quarkus", "predicate"), "tag": "quarkus" },
  // microprofile
  { "predicate": /* @__PURE__ */ __name((groupId, artifactId) => groupId.startsWith("org.eclipse.microprofile"), "predicate"), "tag": "microprofile" },
  // micronaut
  { "predicate": /* @__PURE__ */ __name((groupId, artifactId) => groupId === "io.micronaut", "predicate"), "tag": "micronaut" },
  // GraalVM
  { "predicate": /* @__PURE__ */ __name((groupId, artifactId) => groupId.startsWith("org.graalvm"), "predicate"), "tag": "graalvm" }
];
export {
  GradleDependencyCompactRegex,
  GradleDependencyLooseRegex,
  JavaLibrariesToLookFor,
  MavenArtifactIdRegex,
  MavenDependenciesRegex,
  MavenDependencyRegex,
  MavenGroupIdRegex
};
//# sourceMappingURL=javaWorkspaceTags.js.map
