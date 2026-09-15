export type SqlTokenKind =
  | "whitespace"
  | "comment"
  | "string"
  | "word"
  | "number"
  | "punct";

export type SqlToken = {
  kind: SqlTokenKind;
  value: string;
};

const TWO_CHAR_PUNCT = new Set(["<=", ">=", "<>", "!=", "||", "::"]);

const THREE_WORD_KEYWORDS = new Set([
  "LEFT OUTER JOIN",
  "RIGHT OUTER JOIN",
  "FULL OUTER JOIN",
]);

const TWO_WORD_KEYWORDS = new Set([
  "GROUP BY",
  "ORDER BY",
  "PARTITION BY",
  "INSERT INTO",
  "DELETE FROM",
  "UNION ALL",
  "UNION DISTINCT",
  "INNER JOIN",
  "LEFT JOIN",
  "RIGHT JOIN",
  "FULL JOIN",
  "CROSS JOIN",
  "NATURAL JOIN",
  "OUTER JOIN",
  "IS NOT",
  "NOT IN",
  "NOT LIKE",
  "NOT EXISTS",
  "NOT BETWEEN",
]);

const KEYWORDS = new Set([
  "ADD",
  "ALL",
  "ALTER",
  "AND",
  "ANY",
  "AS",
  "ASC",
  "AVG",
  "BEGIN",
  "BETWEEN",
  "BY",
  "CASE",
  "CAST",
  "CHECK",
  "COALESCE",
  "COLUMN",
  "COMMIT",
  "CONSTRAINT",
  "COUNT",
  "CREATE",
  "CROSS",
  "CURRENT",
  "DATE",
  "DEFAULT",
  "DELETE",
  "DESC",
  "DISTINCT",
  "DROP",
  "ELSE",
  "END",
  "EXCEPT",
  "EXISTS",
  "FALSE",
  "FETCH",
  "FIRST",
  "FOR",
  "FOREIGN",
  "FROM",
  "FULL",
  "GRANT",
  "GROUP",
  "HAVING",
  "IF",
  "IN",
  "INDEX",
  "INNER",
  "INSERT",
  "INTERSECT",
  "INTO",
  "IS",
  "JOIN",
  "KEY",
  "LEFT",
  "LIKE",
  "LIMIT",
  "MAX",
  "MIN",
  "NATURAL",
  "NOT",
  "NULL",
  "NULLIF",
  "OFFSET",
  "ON",
  "OR",
  "ORDER",
  "OUTER",
  "OVER",
  "PARTITION",
  "PRIMARY",
  "REFERENCES",
  "REPLACE",
  "RETURNING",
  "REVOKE",
  "RIGHT",
  "ROLLBACK",
  "ROW_NUMBER",
  "ROWS",
  "SELECT",
  "SET",
  "SOME",
  "SUM",
  "TABLE",
  "THEN",
  "TRUE",
  "TRUNCATE",
  "UNION",
  "UNIQUE",
  "UPDATE",
  "USING",
  "VALUES",
  "VIEW",
  "WHEN",
  "WHERE",
  "WINDOW",
  "WITH",
]);

const CLAUSE_KEYWORDS = new Set([
  "SELECT",
  "FROM",
  "WHERE",
  "GROUP BY",
  "ORDER BY",
  "HAVING",
  "LIMIT",
  "OFFSET",
  "INSERT INTO",
  "INSERT",
  "VALUES",
  "UPDATE",
  "SET",
  "DELETE FROM",
  "DELETE",
  "CREATE",
  "ALTER",
  "DROP",
  "TRUNCATE",
  "WITH",
  "UNION",
  "UNION ALL",
  "UNION DISTINCT",
  "EXCEPT",
  "INTERSECT",
  "RETURNING",
  "WINDOW",
]);

const JOIN_KEYWORDS = new Set([
  "JOIN",
  "INNER JOIN",
  "LEFT JOIN",
  "RIGHT JOIN",
  "FULL JOIN",
  "CROSS JOIN",
  "NATURAL JOIN",
  "OUTER JOIN",
  "LEFT OUTER JOIN",
  "RIGHT OUTER JOIN",
  "FULL OUTER JOIN",
]);

const COMMA_LIST_CLAUSES = new Set([
  "SELECT",
  "GROUP BY",
  "ORDER BY",
  "SET",
  "VALUES",
]);

const BINARY_OPS = new Set([
  "=",
  "<",
  ">",
  "<=",
  ">=",
  "<>",
  "!=",
  "+",
  "-",
  "/",
  "%",
  "||",
]);

const SUBQUERY_STARTERS = new Set(["SELECT", "WITH", "INSERT", "INSERT INTO"]);

const FUNCTION_NAMES = new Set([
  "ABS",
  "AVG",
  "CAST",
  "CEIL",
  "CEILING",
  "COALESCE",
  "CONCAT",
  "CONVERT",
  "COUNT",
  "DATE",
  "DATETIME",
  "EXTRACT",
  "FLOOR",
  "IFNULL",
  "ISNULL",
  "LENGTH",
  "LEN",
  "LOWER",
  "MAX",
  "MIN",
  "NULLIF",
  "NVL",
  "REPLACE",
  "ROUND",
  "ROW_NUMBER",
  "SUBSTRING",
  "SUM",
  "TRIM",
  "UPPER",
]);

function isWordStart(char: string): boolean {
  return /[A-Za-z_$@#]/.test(char);
}

function isWordChar(char: string): boolean {
  return /[A-Za-z0-9_$@#]/.test(char);
}

export function tokenizeSql(input: string): SqlToken[] {
  const tokens: SqlToken[] = [];
  let i = 0;
  const n = input.length;

  while (i < n) {
    const char = input[i] ?? "";

    if (/\s/.test(char)) {
      let j = i + 1;
      while (j < n && /\s/.test(input[j] ?? "")) j += 1;
      tokens.push({ kind: "whitespace", value: input.slice(i, j) });
      i = j;
      continue;
    }

    if (char === "-" && input[i + 1] === "-") {
      let j = i + 2;
      while (j < n && input[j] !== "\n") j += 1;
      tokens.push({ kind: "comment", value: input.slice(i, j) });
      i = j;
      continue;
    }

    if (char === "/" && input[i + 1] === "*") {
      let j = i + 2;
      while (j < n && !(input[j] === "*" && input[j + 1] === "/")) j += 1;
      j = Math.min(j + 2, n);
      tokens.push({ kind: "comment", value: input.slice(i, j) });
      i = j;
      continue;
    }

    if (char === "'" || char === '"' || char === "`") {
      const quote = char;
      let j = i + 1;
      while (j < n) {
        if (input[j] === "\\" && j + 1 < n) {
          j += 2;
          continue;
        }
        if (input[j] === quote) {
          if (input[j + 1] === quote) {
            j += 2;
            continue;
          }
          j += 1;
          break;
        }
        j += 1;
      }
      tokens.push({ kind: "string", value: input.slice(i, j) });
      i = j;
      continue;
    }

    if (char === "[") {
      let j = i + 1;
      while (j < n && input[j] !== "]") j += 1;
      if (j < n) j += 1;
      tokens.push({ kind: "string", value: input.slice(i, j) });
      i = j;
      continue;
    }

    if (/\d/.test(char) || (char === "." && /\d/.test(input[i + 1] ?? ""))) {
      let j = i;
      while (j < n && /\d/.test(input[j] ?? "")) j += 1;
      if (input[j] === ".") {
        j += 1;
        while (j < n && /\d/.test(input[j] ?? "")) j += 1;
      }
      tokens.push({ kind: "number", value: input.slice(i, j) });
      i = j;
      continue;
    }

    if (isWordStart(char)) {
      let j = i + 1;
      while (j < n && isWordChar(input[j] ?? "")) j += 1;
      tokens.push({ kind: "word", value: input.slice(i, j) });
      i = j;
      continue;
    }

    const two = input.slice(i, i + 2);
    if (TWO_CHAR_PUNCT.has(two)) {
      tokens.push({ kind: "punct", value: two });
      i += 2;
      continue;
    }

    tokens.push({ kind: "punct", value: char });
    i += 1;
  }

  return tokens;
}

type Significant = {
  kind: Exclude<SqlTokenKind, "whitespace">;
  value: string;
  upper: string;
};

function significantTokens(tokens: SqlToken[]): Significant[] {
  return tokens
    .filter((token): token is SqlToken & { kind: Exclude<SqlTokenKind, "whitespace"> } => {
      return token.kind !== "whitespace";
    })
    .map((token) => ({
      kind: token.kind,
      value: token.value,
      upper: token.kind === "word" ? token.value.toUpperCase() : token.value,
    }));
}

function matchKeyword(
  tokens: Significant[],
  index: number,
): { keyword: string; end: number } | null {
  const first = tokens[index];
  if (!first || first.kind !== "word") return null;

  const second = tokens[index + 1];
  const third = tokens[index + 2];
  const w1 = first.upper;
  const w2 = second?.kind === "word" ? second.upper : "";
  const w3 = third?.kind === "word" ? third.upper : "";

  const three = w2 && w3 ? `${w1} ${w2} ${w3}` : "";
  const two = w2 ? `${w1} ${w2}` : "";

  if (three && THREE_WORD_KEYWORDS.has(three)) {
    return { keyword: three, end: index + 2 };
  }
  if (two && TWO_WORD_KEYWORDS.has(two)) {
    return { keyword: two, end: index + 1 };
  }
  if (KEYWORDS.has(w1)) {
    return { keyword: w1, end: index };
  }
  return null;
}

function nextNonComment(
  tokens: Significant[],
  index: number,
): Significant | undefined {
  for (let i = index; i < tokens.length; i += 1) {
    const token = tokens[i];
    if (token && token.kind !== "comment") return token;
  }
  return undefined;
}

class Writer {
  private readonly parts: string[] = [];
  private lineEmpty = true;
  private readonly indentUnit: string;
  level = 0;

  constructor(indentUnit: string) {
    this.indentUnit = indentUnit;
  }

  get emptyLine(): boolean {
    return this.lineEmpty;
  }

  get started(): boolean {
    return this.parts.length > 0;
  }

  newline() {
    while (this.parts.length > 0 && this.parts[this.parts.length - 1] === " ") {
      this.parts.pop();
    }
    if (this.parts.length === 0) {
      this.lineEmpty = true;
      return;
    }
    if (this.lineEmpty) return;
    this.parts.push("\n");
    this.lineEmpty = true;
  }

  write(text: string) {
    if (!text) return;
    if (this.lineEmpty) {
      this.parts.push(this.indentUnit.repeat(this.level));
      this.lineEmpty = false;
    }
    this.parts.push(text);
  }

  space() {
    if (this.lineEmpty) return;
    const last = this.parts[this.parts.length - 1] ?? "";
    if (
      last.endsWith(" ") ||
      last.endsWith("(") ||
      last.endsWith(".") ||
      last.endsWith("::")
    ) {
      return;
    }
    this.parts.push(" ");
  }

  lastChar(): string {
    const last = this.parts[this.parts.length - 1] ?? "";
    return last.slice(-1);
  }

  toString(): string {
    return this.parts.join("").replace(/[ \t]+\n/g, "\n").replace(/\s+$/, "");
  }
}

type ParenFrame = {
  subquery: boolean;
  baseLevel: number;
  parenIndent: number;
  listKind: string | null;
  listDepth: number;
};

const SET_OPS = new Set(["UNION", "UNION ALL", "UNION DISTINCT", "EXCEPT", "INTERSECT"]);

export function formatSql(input: string, indent = "  "): string {
  const tokens = significantTokens(tokenizeSql(input));
  if (tokens.length === 0) return "";

  const out = new Writer(indent);
  const parenStack: ParenFrame[] = [];
  const caseStack: number[] = [];
  let i = 0;
  let parenDepth = 0;
  let baseLevel = 0;
  let listKind: string | null = null;
  let listDepth = 0;
  let betweenPending = false;
  let lastWasFunction = false;

  const beginList = (kind: string) => {
    listKind = kind;
    listDepth = parenDepth;
  };

  while (i < tokens.length) {
    const token = tokens[i];
    if (!token) break;

    if (token.kind === "comment") {
      if (!out.emptyLine && out.lastChar() !== "(") {
        out.space();
      } else if (out.started) {
        out.newline();
      }
      out.write(token.value.trimEnd());
      out.newline();
      lastWasFunction = false;
      i += 1;
      continue;
    }

    const matched = matchKeyword(tokens, i);
    if (matched) {
      let { keyword, end } = matched;
      const isClause = CLAUSE_KEYWORDS.has(keyword);
      const isJoin = JOIN_KEYWORDS.has(keyword);
      const isAndOr = (keyword === "AND" || keyword === "OR") && !betweenPending;
      const isOn = keyword === "ON";
      const isCase = keyword === "CASE";
      const isWhenElse = keyword === "WHEN" || keyword === "ELSE";
      const isThen = keyword === "THEN" && caseStack.length > 0;
      const isEnd = keyword === "END" && caseStack.length > 0;

      if (isEnd) {
        out.newline();
        out.level = caseStack.pop() ?? baseLevel;
        out.write(keyword);
      } else if (isWhenElse) {
        out.newline();
        out.level = (caseStack[caseStack.length - 1] ?? baseLevel) + 1;
        out.write(keyword);
      } else if (isThen) {
        out.space();
        out.write(keyword);
      } else if (isCase) {
        out.space();
        out.write(keyword);
        caseStack.push(out.level);
        out.level += 1;
        out.newline();
      } else if (isOn) {
        out.newline();
        out.level = baseLevel + 2;
        out.write(keyword);
      } else if (isJoin) {
        out.newline();
        out.level = baseLevel + 1;
        out.write(keyword);
        listKind = null;
      } else if (isAndOr) {
        out.newline();
        out.level = baseLevel + 1;
        out.write(keyword);
      } else if (isClause) {
        out.newline();
        out.level = baseLevel;
        out.write(keyword);
        if (SET_OPS.has(keyword)) {
          listKind = null;
        } else {
          if (keyword === "SELECT") {
            const modifier = matchKeyword(tokens, end + 1);
            if (modifier && (modifier.keyword === "DISTINCT" || modifier.keyword === "ALL")) {
              out.space();
              out.write(modifier.keyword);
              end = modifier.end;
            }
          }
          out.newline();
          out.level = baseLevel + 1;
          if (keyword === "SELECT" || COMMA_LIST_CLAUSES.has(keyword)) {
            beginList(keyword);
          } else {
            listKind = null;
          }
        }
      } else {
        out.space();
        out.write(keyword);
      }

      if (keyword === "BETWEEN" || keyword === "NOT BETWEEN") {
        betweenPending = true;
      } else if (keyword === "AND" && betweenPending) {
        betweenPending = false;
      } else if (isClause || isJoin || isOn) {
        betweenPending = false;
      }

      lastWasFunction = FUNCTION_NAMES.has(keyword);
      i = end + 1;
      continue;
    }

    if (token.kind === "punct") {
      if (token.value === "(") {
        const upcoming = nextNonComment(tokens, i + 1);
        const upcomingIndex = upcoming ? tokens.indexOf(upcoming) : -1;
        const upcomingKeyword =
          upcoming?.kind === "word" && upcomingIndex >= 0
            ? matchKeyword(tokens, upcomingIndex)
            : null;
        const isSubquery = Boolean(
          upcomingKeyword && SUBQUERY_STARTERS.has(upcomingKeyword.keyword),
        );

        parenStack.push({
          subquery: isSubquery,
          baseLevel,
          parenIndent: out.level,
          listKind,
          listDepth,
        });

        if (isSubquery) {
          out.space();
          out.write("(");
          out.newline();
          baseLevel = out.level + 1;
          out.level = baseLevel;
        } else if (lastWasFunction) {
          out.write("(");
        } else {
          out.space();
          out.write("(");
        }
        parenDepth += 1;
        lastWasFunction = false;
        i += 1;
        continue;
      }

      if (token.value === ")") {
        parenDepth = Math.max(0, parenDepth - 1);
        const frame = parenStack.pop();
        if (frame?.subquery) {
          out.newline();
          out.level = frame.parenIndent;
          baseLevel = frame.baseLevel;
          listKind = frame.listKind;
          listDepth = frame.listDepth;
        } else if (listKind && parenDepth < listDepth) {
          listKind = null;
        }
        out.write(")");
        lastWasFunction = false;
        i += 1;
        continue;
      }

      if (token.value === ",") {
        out.write(",");
        if (listKind && COMMA_LIST_CLAUSES.has(listKind) && parenDepth === listDepth) {
          out.newline();
        } else {
          out.space();
        }
        lastWasFunction = false;
        i += 1;
        continue;
      }

      if (token.value === ";") {
        out.write(";");
        out.newline();
        out.level = 0;
        baseLevel = 0;
        listKind = null;
        betweenPending = false;
        caseStack.length = 0;
        parenStack.length = 0;
        parenDepth = 0;
        lastWasFunction = false;
        i += 1;
        continue;
      }

      if (token.value === ".") {
        out.write(".");
        lastWasFunction = false;
        i += 1;
        continue;
      }

      if (token.value === "::") {
        out.write("::");
        lastWasFunction = false;
        i += 1;
        continue;
      }

      if (token.value === "*") {
        if (out.lastChar() === "(") {
          out.write("*");
        } else {
          out.space();
          out.write("*");
        }
        lastWasFunction = false;
        i += 1;
        continue;
      }

      if (BINARY_OPS.has(token.value)) {
        out.space();
        out.write(token.value);
        out.space();
        lastWasFunction = false;
        i += 1;
        continue;
      }

      out.write(token.value);
      lastWasFunction = false;
      i += 1;
      continue;
    }

    out.space();
    out.write(token.value);
    lastWasFunction = token.kind === "word" && FUNCTION_NAMES.has(token.upper);
    i += 1;
  }

  return out.toString();
}
