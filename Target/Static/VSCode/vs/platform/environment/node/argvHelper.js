var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import assert from "assert";
import { IProcessEnvironment } from "../../../base/common/platform.js";
import { localize } from "../../../nls.js";
import { NativeParsedArgs } from "../common/argv.js";
import { ErrorReporter, NATIVE_CLI_COMMANDS, OPTIONS, parseArgs } from "./argv.js";
function parseAndValidate(cmdLineArgs, reportWarnings) {
  const onMultipleValues = /* @__PURE__ */ __name((id, val) => {
    console.warn(localize("multipleValues", "Option '{0}' is defined more than once. Using value '{1}'.", id, val));
  }, "onMultipleValues");
  const onEmptyValue = /* @__PURE__ */ __name((id) => {
    console.warn(localize("emptyValue", "Option '{0}' requires a non empty value. Ignoring the option.", id));
  }, "onEmptyValue");
  const onDeprecatedOption = /* @__PURE__ */ __name((deprecatedOption, message) => {
    console.warn(localize("deprecatedArgument", "Option '{0}' is deprecated: {1}", deprecatedOption, message));
  }, "onDeprecatedOption");
  const getSubcommandReporter = /* @__PURE__ */ __name((command) => ({
    onUnknownOption: /* @__PURE__ */ __name((id) => {
      if (!NATIVE_CLI_COMMANDS.includes(command)) {
        console.warn(localize("unknownSubCommandOption", "Warning: '{0}' is not in the list of known options for subcommand '{1}'", id, command));
      }
    }, "onUnknownOption"),
    onMultipleValues,
    onEmptyValue,
    onDeprecatedOption,
    getSubcommandReporter: NATIVE_CLI_COMMANDS.includes(command) ? getSubcommandReporter : void 0
  }), "getSubcommandReporter");
  const errorReporter = {
    onUnknownOption: /* @__PURE__ */ __name((id) => {
      console.warn(localize("unknownOption", "Warning: '{0}' is not in the list of known options, but still passed to Electron/Chromium.", id));
    }, "onUnknownOption"),
    onMultipleValues,
    onEmptyValue,
    onDeprecatedOption,
    getSubcommandReporter
  };
  const args = parseArgs(cmdLineArgs, OPTIONS, reportWarnings ? errorReporter : void 0);
  if (args.goto) {
    args._.forEach((arg) => assert(/^(\w:)?[^:]+(:\d*){0,2}:?$/.test(arg), localize("gotoValidation", "Arguments in `--goto` mode should be in the format of `FILE(:LINE(:CHARACTER))`.")));
  }
  return args;
}
__name(parseAndValidate, "parseAndValidate");
function stripAppPath(argv) {
  const index = argv.findIndex((a) => !/^-/.test(a));
  if (index > -1) {
    return [...argv.slice(0, index), ...argv.slice(index + 1)];
  }
  return void 0;
}
__name(stripAppPath, "stripAppPath");
function parseMainProcessArgv(processArgv) {
  let [, ...args] = processArgv;
  if (process.env["VSCODE_DEV"]) {
    args = stripAppPath(args) || [];
  }
  const reportWarnings = !isLaunchedFromCli(process.env);
  return parseAndValidate(args, reportWarnings);
}
__name(parseMainProcessArgv, "parseMainProcessArgv");
function parseCLIProcessArgv(processArgv) {
  let [, , ...args] = processArgv;
  if (process.env["VSCODE_DEV"]) {
    args = stripAppPath(args) || [];
  }
  return parseAndValidate(args, true);
}
__name(parseCLIProcessArgv, "parseCLIProcessArgv");
function addArg(argv, ...args) {
  const endOfArgsMarkerIndex = argv.indexOf("--");
  if (endOfArgsMarkerIndex === -1) {
    argv.push(...args);
  } else {
    argv.splice(endOfArgsMarkerIndex, 0, ...args);
  }
  return argv;
}
__name(addArg, "addArg");
function isLaunchedFromCli(env) {
  return env["VSCODE_CLI"] === "1";
}
__name(isLaunchedFromCli, "isLaunchedFromCli");
export {
  addArg,
  isLaunchedFromCli,
  parseCLIProcessArgv,
  parseMainProcessArgv
};
//# sourceMappingURL=argvHelper.js.map
