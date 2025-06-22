var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
let globalObservableLogger;
function addLogger(logger) {
  if (!globalObservableLogger) {
    globalObservableLogger = logger;
  } else if (globalObservableLogger instanceof ComposedLogger) {
    globalObservableLogger.loggers.push(logger);
  } else {
    globalObservableLogger = new ComposedLogger([globalObservableLogger, logger]);
  }
}
__name(addLogger, "addLogger");
function getLogger() {
  return globalObservableLogger;
}
__name(getLogger, "getLogger");
let globalObservableLoggerFn = void 0;
function setLogObservableFn(fn) {
  globalObservableLoggerFn = fn;
}
__name(setLogObservableFn, "setLogObservableFn");
function logObservable(obs) {
  if (globalObservableLoggerFn) {
    globalObservableLoggerFn(obs);
  }
}
__name(logObservable, "logObservable");
class ComposedLogger {
  static {
    __name(this, "ComposedLogger");
  }
  constructor(loggers) {
    this.loggers = loggers;
  }
  handleObservableCreated(observable) {
    for (const logger of this.loggers) {
      logger.handleObservableCreated(observable);
    }
  }
  handleOnListenerCountChanged(observable, newCount) {
    for (const logger of this.loggers) {
      logger.handleOnListenerCountChanged(observable, newCount);
    }
  }
  handleObservableUpdated(observable, info) {
    for (const logger of this.loggers) {
      logger.handleObservableUpdated(observable, info);
    }
  }
  handleAutorunCreated(autorun) {
    for (const logger of this.loggers) {
      logger.handleAutorunCreated(autorun);
    }
  }
  handleAutorunDisposed(autorun) {
    for (const logger of this.loggers) {
      logger.handleAutorunDisposed(autorun);
    }
  }
  handleAutorunDependencyChanged(autorun, observable, change) {
    for (const logger of this.loggers) {
      logger.handleAutorunDependencyChanged(autorun, observable, change);
    }
  }
  handleAutorunStarted(autorun) {
    for (const logger of this.loggers) {
      logger.handleAutorunStarted(autorun);
    }
  }
  handleAutorunFinished(autorun) {
    for (const logger of this.loggers) {
      logger.handleAutorunFinished(autorun);
    }
  }
  handleDerivedDependencyChanged(derived, observable, change) {
    for (const logger of this.loggers) {
      logger.handleDerivedDependencyChanged(derived, observable, change);
    }
  }
  handleDerivedCleared(observable) {
    for (const logger of this.loggers) {
      logger.handleDerivedCleared(observable);
    }
  }
  handleBeginTransaction(transaction) {
    for (const logger of this.loggers) {
      logger.handleBeginTransaction(transaction);
    }
  }
  handleEndTransaction(transaction) {
    for (const logger of this.loggers) {
      logger.handleEndTransaction(transaction);
    }
  }
}
export {
  addLogger,
  getLogger,
  logObservable,
  setLogObservableFn
};
//# sourceMappingURL=logging.js.map
