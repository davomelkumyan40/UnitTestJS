import { classes } from "./UnitTest.imports.js";

//factory method working with dynamic class transferring
function classFactory(className) {
  return classes[className];
}

//TestMethod Attribute
class TestMethod {
  static #queue = [];
  static #testCount = 0;
  static #passed = { state: true, info: "", stack: "" };

  constructor() {}

  static run(withDetails = false, showStack = false) {
    console.log("Unit Test");
    for (const unit of this.#queue) {
      let c;
      try {
        c = Date.now();
        unit();
      } catch (e) {
        this.#passed.stack = e.stack;
        this.#passed.state = false;
        this.#passed.message = e.message;
      } finally {
        let passMs = Date.now() - c;
        let hours = passMs / 1000 / 60 / 60;
        let dur = {
          hours: hours.toFixed(4),
          minutes: (hours * 60).toFixed(4),
          seconds: (hours * 60 * 60).toFixed(4),
          milliseconds: passMs,
        };
        this.#noticeResult(
          {
            unit: unit,
            passedInfo: this.#passed,
            duration: dur,
          },
          withDetails,
          showStack
        );
      }
    }
  }

  static #noticeResult(passObj, withDetails, showStack) {
    let dur = withDetails
      ? `[h: ${passObj.duration.hours} | m: ${passObj.duration.minutes} | s: ${passObj.duration.seconds} | ms: ${passObj.duration.milliseconds}]`
      : `[ ${passObj.duration.milliseconds} ms ]`;
    console.log(
      `[ Test: ${++this.#testCount}: Unit ƒ() ${passObj.unit.name} ]`
    );
    passObj.passedInfo.state
      ? console.log(`Passed in: ${dur}`)
      : console.error(
          `Failed in: ${dur} ${
            withDetails ? `\nDetails: ${passObj.passedInfo.message}` : ""
          }\n${showStack ? "Call Stack:\n" + passObj.passedInfo.stack : ""}`
        );
  }

  static add(testMethod) {
    if (testMethod) {
      this.#queue.push(testMethod);
    } else throw new Error("No Test Method passed");
  }

  static remove(testMethodName) {
    this.#queue.slice(this.#queue.indexOf(eval(testMethodName)), 1);
  }

  static clear() {
    this.#queue = this.#queue.length !== 0 && [];
  }
}

class AssertFailedError extends Error {
  // AssertFailedError
  constructor(assertName, passedMessage) {
    super(assertName);
    this.name = "AssertFailedError";
    this.message = `${this.name}: ${assertName} ${
      passedMessage ? `\nMessage: ${passedMessage}` : ""
    }`;
  }
}

//Assert
class Assert {
  static #assertId = 0;

  static #_throw(assertName = "", passedMessage) {
    throw new AssertFailedError(
      assertName ? `on "${assertName}" => [id:${this.#assertId}]` : "",
      passedMessage
    );
  }

  static #manualComparison(expected, actual) {
    let acKeys = Object.keys(actual);
    let exKeys = Object.keys(expected);
    if (acKeys.length !== exKeys.length) {
      return false;
    }
    for (const key in expected) {
      if (
        acKeys.indexOf(key) !== -1 &&
        typeof expected[key] === "object" &&
        typeof actual[key] === "object"
      ) {
        return this.#manualComparison(expected[key], actual[key]);
      } else if (acKeys.indexOf(key) === -1 || expected[key] !== actual[key]) {
        return false;
      }
    }
    return true;
  }

  static #onAreEqual(expected, actual, ignoreCase = false) {
    if (typeof expected === "object" && typeof actual === "object") {
      if (this.#onAreSame(expected, actual)) {
        return true;
      } else return this.#manualComparison(expected, actual);
    } else if (typeof actual === "string" && typeof expected === "string") {
      if (ignoreCase) {
        return Object.is(actual.toLowerCase(), expected.toLowerCase());
      } else return Object.is(actual, expected);
    } else {
      return Object.is(expected, actual);
    }
  }

  static #onAreSame(expected, actual) {
    if (typeof expected === "object" && typeof actual === "object") {
      return Object.is(expected, actual);
    }
    return false;
  }

  constructor() {}

  //region public

  //AreEqual [For all types]
  static areEqual(expected, actual, ignoreCase = false) {
    this.#assertId++;
    !this.#onAreEqual(expected, actual, ignoreCase) &&
      this.#_throw(this.areEqual.name);
  }

  //AreNotEqual [For all types]
  static areNotEqual(expected, actual, ignoreCase = false) {
    this.#assertId++;
    this.#onAreEqual(expected, actual, ignoreCase) &&
      this.#_throw(this.areNotEqual.name);
  }

  //AreSame [For Objects only]
  static areSame(expected, actual, message = "") {
    this.#assertId++;
    !this.#onAreSame(expected, actual) &&
      this.#_throw(this.areSame.name, message);
  }

  //AreNotSame [For Objects only]
  static areNotSame(expected, actual, message = "") {
    this.#assertId++;
    this.#onAreSame(expected, actual) &&
      this.#_throw(this.areNotSame.name, message);
  }

  //Equals
  static equals() {
    this.#assertId++;
    throw new Error("Not Implemented yet");
  }

  //Fail
  static fail() {
    this.#assertId++;
    this.#_throw(this.fail.name, "Manual error was thrown");
  }

  //Inconclusive
  static inconclusive() {
    this.#assertId++;
    throw new Error("Not Implemented yet");
  }

  //IsFalse
  static isFalse() {
    this.#assertId++;
    throw new Error("Not Implemented yet");
  }

  //IsInstanceOfType
  static isInstanceOfType() {
    this.#assertId++;
    throw new Error("Not Implemented yet");
  }

  //IsNotInstanceOfType
  static isNotInstanceOfType() {
    this.#assertId++;
    throw new Error("Not Implemented yet");
  }

  //IsNotNull
  static isNotNullOrUndefined() {
    this.#assertId++;
    throw new Error("Not Implemented yet");
  }

  //IsNull
  static isNullOrUndefined() {
    this.#assertId++;
    throw new Error("Not Implemented yet");
  }

  //IsTrue
  static isTrue() {
    this.#assertId++;
    throw new Error("Not Implemented yet");
  }

  //ReplaceNullChars
  static replaceNullChars() {
    this.#assertId++;
    throw new Error("Not Implemented yet");
  }

  //TODO almost finish (no bugs for now)
  //ThrowsException
  static throwsException(errorType, action, message) {
    this.#assertId++;
    errorType = typeof errorType !== "string" ? typeof errorType : errorType;
    let wasThrown = false;
    let dynamic = classFactory(errorType); //trying to get imported class
    let template = `Wrong 'errorType' argument type passed, "${errorType}" is not imported in unitTest.imports.js or is not defined`;
    if (!dynamic) {
      try {
        dynamic = eval(`${errorType}`); // trying to get System class
      } catch (e) {
        this.#_throw(this.throwsException.name, template);
      }
    }
    !dynamic && this.#_throw(this.throwsException.name, template);
    if (typeof action === "function") {
      if (new dynamic() instanceof Error) {
        template = message ? message : `No "${errorType}" error was thrown`;
        try {
          action();
        } catch (e) {
          // if action throws
          wasThrown = true;
          //if thrown straight given type error
          if (e.name === errorType) {
            throw new dynamic(e.message);
          } else wasThrown = false;
        }
        !wasThrown && this.#_throw(this.throwsException.name, template);
      } else
        this.#_throw(
          this.throwsException.name,
          `"${errorType}" does not inherited from Error`
        );
    } else
      this.#_throw(
        this.throwsException.name,
        `"${action}" is not a "function"`
      );
  }
}

export { Assert, TestMethod };
