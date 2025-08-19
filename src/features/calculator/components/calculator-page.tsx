"use client";

import { useState, useEffect, useCallback, memo, useRef } from "react";
import { GlassSurface } from "@/features/shared/ui/glass-surface";
import { Button } from "@/features/shared/ui/button";
import { calculatorService } from "../lib/calculator-db";
import { useTranslations } from "next-intl";
import { useCalculator } from "../lib/calculator-context";

interface CalculatorState {
  display: string;
  previousValue: string;
  operation: string | null;
  waitingForOperand: boolean;
  operationDisplay: string;
}

function CalculatorPageComponent() {
  const t = useTranslations("Calculator");
  const { addToHistory } = useCalculator();
  const lastCalculationRef = useRef<string>("");

  const [state, setState] = useState<CalculatorState>({
    display: "0",
    previousValue: "",
    operation: null,
    waitingForOperand: false,
    operationDisplay: "",
  });

  const calculate = useCallback(
    (
      firstOperand: string,
      secondOperand: string,
      operation: string,
    ): string => {
      const first = parseFloat(firstOperand);
      const second = parseFloat(secondOperand);

      switch (operation) {
        case "+":
          return (first + second).toString();
        case "-":
          return (first - second).toString();
        case "*":
          return (first * second).toString();
        case "/":
          return second !== 0 ? (first / second).toString() : "NaN";
        default:
          return secondOperand;
      }
    },
    [],
  );

  const inputNumber = useCallback((num: string) => {
    setState((prevState) => {
      if (prevState.waitingForOperand) {
        return {
          ...prevState,
          display: num,
          waitingForOperand: false,
        };
      }

      return {
        ...prevState,
        display: prevState.display === "0" ? num : prevState.display + num,
      };
    });
  }, []);

  const inputDecimal = useCallback(() => {
    setState((prevState) => {
      if (prevState.waitingForOperand) {
        return {
          ...prevState,
          display: "0.",
          waitingForOperand: false,
        };
      }

      if (prevState.display.indexOf(".") === -1) {
        return {
          ...prevState,
          display: prevState.display + ".",
        };
      }

      return prevState;
    });
  }, []);

  const clear = useCallback(() => {
    lastCalculationRef.current = ""; // Reset to allow new calculations
    setState({
      display: "0",
      previousValue: "",
      operation: null,
      waitingForOperand: false,
      operationDisplay: "",
    });
  }, []);

  const clearEntry = useCallback(() => {
    setState((prevState) => ({
      ...prevState,
      display: "0",
    }));
  }, []);

  const backspace = useCallback(() => {
    setState((prevState) => {
      // If display shows error state, reset to 0
      if (prevState.display === "NaN" || prevState.display === "Error") {
        return {
          ...prevState,
          display: "0",
          operationDisplay: "",
          previousValue: "",
          operation: null,
          waitingForOperand: false,
        };
      }

      if (prevState.display.length > 1) {
        return {
          ...prevState,
          display: prevState.display.slice(0, -1),
        };
      }

      return {
        ...prevState,
        display: "0",
      };
    });
  }, []);

  const getOperationSymbol = useCallback((operation: string): string => {
    switch (operation) {
      case "+":
        return "+";
      case "-":
        return "−";
      case "*":
        return "×";
      case "/":
        return "÷";
      default:
        return operation;
    }
  }, []);

  const performOperation = useCallback(
    (nextOperation: string) => {
      setState((prevState) => {
        if (prevState.previousValue === "") {
          const operationSymbol = getOperationSymbol(nextOperation);
          return {
            ...prevState,
            previousValue: prevState.display,
            operation: nextOperation,
            waitingForOperand: true,
            operationDisplay: `${prevState.display} ${operationSymbol}`,
          };
        }

        if (prevState.operation) {
          const newValue = calculate(
            prevState.previousValue,
            prevState.display,
            prevState.operation,
          );
          const operationSymbol = getOperationSymbol(nextOperation);

          return {
            ...prevState,
            display: newValue,
            previousValue: newValue,
            operation: nextOperation,
            waitingForOperand: true,
            operationDisplay: `${newValue} ${operationSymbol}`,
          };
        }

        const operationSymbol = getOperationSymbol(nextOperation);
        return {
          ...prevState,
          previousValue: prevState.display,
          operation: nextOperation,
          waitingForOperand: true,
          operationDisplay: `${prevState.display} ${operationSymbol}`,
        };
      });
    },
    [getOperationSymbol, calculate],
  );

  const performCalculation = useCallback(() => {
    setState((prevState) => {
      if (prevState.operation && prevState.previousValue !== "") {
        const expression = `${prevState.previousValue} ${getOperationSymbol(
          prevState.operation,
        )} ${prevState.display}`;
        const newValue = calculate(
          prevState.previousValue,
          prevState.display,
          prevState.operation,
        );

        // Save to history only once using ref to prevent duplicates from StrictMode
        if (newValue !== "NaN" && lastCalculationRef.current !== expression) {
          lastCalculationRef.current = expression;
          calculatorService
            .addCalculation(expression, newValue)
            .then((newEntry) => {
              addToHistory(newEntry);
            })
            .catch(console.error);
        }

        return {
          display: newValue,
          previousValue: "",
          operation: null,
          waitingForOperand: true,
          operationDisplay: "",
        };
      }

      return prevState;
    });
  }, [getOperationSymbol, calculate, addToHistory]);

  // Keyboard event handler
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const { key } = event;

      // Prevent default behavior for calculator keys
      if (
        /[0-9+\-*/=.cC]/.test(key) ||
        key === "Enter" ||
        key === "Backspace" ||
        key === "Escape"
      ) {
        event.preventDefault();
      }

      if (/[0-9]/.test(key)) {
        inputNumber(key);
      } else if (key === ".") {
        inputDecimal();
      } else if (key === "+") {
        performOperation("+");
      } else if (key === "-") {
        performOperation("-");
      } else if (key === "*") {
        performOperation("*");
      } else if (key === "/") {
        performOperation("/");
      } else if (key === "Enter" || key === "=") {
        performCalculation();
      } else if (key === "Backspace") {
        backspace();
      } else if (key === "Escape" || key.toLowerCase() === "c") {
        clear();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    inputNumber,
    inputDecimal,
    performOperation,
    performCalculation,
    backspace,
    clear,
  ]);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-1 px-6 py-4">
        <GlassSurface className="h-full flex flex-col p-6 shadow-none!">
          {/* Display */}
          <div className="mb-6">
            <GlassSurface className="p-4 bg-black/10 dark:bg-white/5">
              {/* Operation Display */}
              {state.operationDisplay && (
                <div className="text-right text-base sm:text-lg text-foreground/60 font-mono mb-1">
                  {state.operationDisplay}
                </div>
              )}
              {/* Main Display */}
              <div className="text-right text-4xl sm:text-5xl lg:text-6xl font-mono text-foreground/90 min-h-[4rem] sm:min-h-[5rem] lg:min-h-[6rem] flex items-center justify-end">
                {state.display}
              </div>
            </GlassSurface>
          </div>

          {/* Buttons Grid */}
          <div className="flex-1 grid grid-cols-4 gap-2">
            {/* Row 1 */}
            <Button onClick={clear} variant="outline">
              {t("buttons.clear")}
            </Button>
            <Button onClick={clearEntry} variant="outline">
              {t("buttons.clearEntry")}
            </Button>
            <Button onClick={backspace} variant="outline">
              {t("buttons.backspace")}
            </Button>
            <Button onClick={() => performOperation("/")} variant="outline">
              {t("buttons.divide")}
            </Button>

            {/* Row 2 */}
            <Button onClick={() => inputNumber("7")} variant="outline">
              7
            </Button>
            <Button onClick={() => inputNumber("8")} variant="outline">
              8
            </Button>
            <Button onClick={() => inputNumber("9")} variant="outline">
              9
            </Button>
            <Button onClick={() => performOperation("*")} variant="outline">
              {t("buttons.multiply")}
            </Button>

            {/* Row 3 */}
            <Button onClick={() => inputNumber("4")} variant="outline">
              4
            </Button>
            <Button onClick={() => inputNumber("5")} variant="outline">
              5
            </Button>
            <Button onClick={() => inputNumber("6")} variant="outline">
              6
            </Button>
            <Button onClick={() => performOperation("-")} variant="outline">
              {t("buttons.subtract")}
            </Button>

            {/* Row 4 */}
            <Button onClick={() => inputNumber("1")} variant="outline">
              1
            </Button>
            <Button onClick={() => inputNumber("2")} variant="outline">
              2
            </Button>
            <Button onClick={() => inputNumber("3")} variant="outline">
              3
            </Button>
            <Button onClick={() => performOperation("+")} variant="outline">
              {t("buttons.add")}
            </Button>

            {/* Row 5 */}
            <Button
              onClick={() => inputNumber("0")}
              className="col-span-2"
              variant="outline"
            >
              0
            </Button>
            <Button onClick={inputDecimal} variant="outline">
              {t("buttons.decimal")}
            </Button>
            <Button
              onClick={performCalculation}
              className="text-lg sm:text-xl lg:text-2xl font-semibold"
              variant="action"
            >
              {t("buttons.equals")}
            </Button>
          </div>
        </GlassSurface>
      </div>
    </div>
  );
}

export const CalculatorPage = memo(CalculatorPageComponent);
