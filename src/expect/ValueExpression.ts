import { Expression } from "./Expression.js"
import { AnsiColor } from "../AnsiColor.js"
import { TestError } from "../TestError.js"

export class ValueExpression<T = any> extends Expression {

  constructor(protected value: T) {
    super()
  }

  get not(): ValueExpression {
    super.not
    return this
  }

  protected ansiDiff(valueStr: string, expectedStr: string): string {
    let diffStr = ""
    let color = AnsiColor.bgGreen
    let colorStart = 0
    for (let i = 0; i < expectedStr.length; ++i) {
      const newColor = valueStr.charAt(i) === expectedStr.charAt(i) ? AnsiColor.bgGreen : AnsiColor.bgRed
      if (color !== newColor) {
        diffStr += AnsiColor.str(valueStr.substring(colorStart, i), AnsiColor.fgBlack, color)
        colorStart = i
        color = newColor
      }
    }
    diffStr += AnsiColor.str(valueStr.substring(colorStart, valueStr.length), AnsiColor.fgBlack, color)
    return diffStr
  }

  protected valueStr(value: T): string {
    let type = typeof value
    switch (type) {
      case "undefined":
        return type
      case "object":
        return JSON.stringify(value)
      case "string":
        return `"${value}"`
      default:
        return value === undefined ? "undefined" : value === null ? "null" : value.toString()
    }
  }

  protected check(comparison: boolean, expected: T, value = this.value) {
    const result = this.negated ? !comparison : comparison
    if (!result) {
      const valueStr = this.valueStr(value)
      const expectedStr = this.valueStr(expected)
      throw new TestError(
        `Got ${this.ansiDiff(valueStr, expectedStr)!} ${AnsiColor.str(`instead of ${(this.negated ? "not " : "") +
        AnsiColor.str(expectedStr, AnsiColor.fgGreen)}`, AnsiColor.fgRed)}`)
    }
  }

  toBe(expected: T) {
    this.check(this.value == expected, expected)
  }

  toBeUndefined() {
    this.check(this.value == void 0, "undefined" as any)
  }

  toBeDefined() {
    this.check(this.value !== void 0, "defined" as any)
  }

  toBeNull() {
    this.check(this.value === null, "null" as any)
  }

  toEqual(expected: T) {
    let expectedExpr = JSON.stringify(expected)
    let valueExp = JSON.stringify(this.value)
    this.check(valueExp == expectedExpr, expected as any, this.value as any)
  }
}
