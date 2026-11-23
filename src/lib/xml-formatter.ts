export type XmlIndent = 2 | 4 | "tab";

export type XmlNode =
  | { type: "element"; name: string; attrs: string; selfClosing: boolean; children: XmlNode[] }
  | { type: "text"; value: string }
  | { type: "raw"; value: string };

export type XmlResult =
  | { ok: true; output: string; stats: { elements: number; attributes: number; depth: number; bytes: number } }
  | { ok: false; error: string; line: number; column: number };

class XmlError extends Error {
  offset: number;
  constructor(message: string, offset: number) {
    super(message);
    this.offset = offset;
  }
}

export function offsetToLineColumn(text: string, offset: number): { line: number; column: number } {
  let line = 1;
  let last = -1;
  const end = Math.min(offset, text.length);
  for (let i = 0; i < end; i++) {
    if (text.charCodeAt(i) === 10) {
      line++;
      last = i;
    }
  }
  return { line, column: end - last };
}

const NAME_START = /[A-Za-z_:\u00C0-\uFFFF]/;
const NAME_CHAR = /[A-Za-z0-9_:.\-\u00B7\u00C0-\uFFFF]/;

function readName(src: string, pos: number): number {
  if (pos >= src.length || !NAME_START.test(src[pos])) {
    throw new XmlError("Expected a valid tag or attribute name", pos);
  }
  let i = pos + 1;
  while (i < src.length && NAME_CHAR.test(src[i])) i++;
  return i;
}

function validateEntities(text: string, base: number) {
  const re = /&([^;\s&<]*)(;?)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const body = m[1];
    const ok =
      m[2] === ";" &&
      (/^(amp|lt|gt|quot|apos)$/.test(body) || /^#[0-9]+$/.test(body) || /^#x[0-9A-Fa-f]+$/.test(body));
    if (!ok) {
      throw new XmlError(
        `Invalid entity "&${body}${m[2]}". Use &amp; for a literal ampersand`,
        base + m.index,
      );
    }
  }
}

/** Parse XML text into a light tree. Throws XmlError on malformed input. */
export function parseXml(src: string): { nodes: XmlNode[]; elements: number; attributes: number; depth: number } {
  const root: XmlNode[] = [];
  const stack: { name: string; offset: number; children: XmlNode[] }[] = [];
  let current = root;
  let i = 0;
  let elements = 0;
  let attributes = 0;
  let depth = 0;
  let rootCount = 0;
  let sawRootText = false;

  while (i < src.length) {
    if (src[i] !== "<") {
      const next = src.indexOf("<", i);
      const end = next === -1 ? src.length : next;
      const text = src.slice(i, end);
      if (text.includes("]]>")) throw new XmlError('"]]>" is not allowed in text', i + text.indexOf("]]>"));
      validateEntities(text, i);
      if (stack.length === 0 && text.trim() !== "") {
        sawRootText = true;
        throw new XmlError("Text is not allowed outside the root element", i + text.search(/\S/));
      }
      if (text.trim() !== "") current.push({ type: "text", value: text });
      i = end;
      continue;
    }
    if (src.startsWith("<!--", i)) {
      const end = src.indexOf("-->", i + 4);
      if (end === -1) throw new XmlError("Comment is not closed (missing -->)", i);
      const body = src.slice(i + 4, end);
      if (body.includes("--")) throw new XmlError('"--" is not allowed inside a comment', i + 4 + body.indexOf("--"));
      current.push({ type: "raw", value: src.slice(i, end + 3) });
      i = end + 3;
      continue;
    }
    if (src.startsWith("<![CDATA[", i)) {
      if (stack.length === 0) throw new XmlError("CDATA is not allowed outside the root element", i);
      const end = src.indexOf("]]>", i + 9);
      if (end === -1) throw new XmlError("CDATA section is not closed (missing ]]>)", i);
      current.push({ type: "raw", value: src.slice(i, end + 3) });
      i = end + 3;
      continue;
    }
    if (src.startsWith("<?", i)) {
      const end = src.indexOf("?>", i + 2);
      if (end === -1) throw new XmlError("Processing instruction is not closed (missing ?>)", i);
      const target = src.slice(i + 2, end).match(/^[A-Za-z_:][\w:.\-]*/);
      if (!target) throw new XmlError("Processing instruction needs a target name", i);
      if (target[0].toLowerCase() === "xml" && (i !== 0 || src.slice(0, i).length !== 0)) {
        throw new XmlError("The XML declaration must be at the very start of the document", i);
      }
      current.push({ type: "raw", value: src.slice(i, end + 2) });
      i = end + 2;
      continue;
    }
    if (src.startsWith("<!", i)) {
      if (!/^<!DOCTYPE/i.test(src.slice(i, i + 9))) throw new XmlError("Unexpected markup declaration", i);
      if (stack.length > 0) throw new XmlError("DOCTYPE is only allowed before the root element", i);
      let j = i + 9;
      let bracket = 0;
      let quote = "";
      for (; j < src.length; j++) {
        const c = src[j];
        if (quote) {
          if (c === quote) quote = "";
        } else if (c === '"' || c === "'") quote = c;
        else if (c === "[") bracket++;
        else if (c === "]") bracket--;
        else if (c === ">" && bracket <= 0) break;
      }
      if (j >= src.length) throw new XmlError("DOCTYPE is not closed (missing >)", i);
      current.push({ type: "raw", value: src.slice(i, j + 1) });
      i = j + 1;
      continue;
    }
    if (src.startsWith("</", i)) {
      const nameEnd = readName(src, i + 2);
      const name = src.slice(i + 2, nameEnd);
      let j = nameEnd;
      while (j < src.length && /\s/.test(src[j])) j++;
      if (src[j] !== ">") throw new XmlError("Expected > to finish the closing tag", j);
      const open = stack.pop();
      if (!open) throw new XmlError(`Unexpected closing tag </${name}> with no matching opening tag`, i);
      if (open.name !== name) {
        const p = offsetToLineColumn(src, open.offset);
        throw new XmlError(
          `Closing tag </${name}> does not match <${open.name}> opened on line ${p.line}, column ${p.column}`,
          i,
        );
      }
      current = stack.length ? stack[stack.length - 1].children : root;
      i = j + 1;
      continue;
    }

    // Opening or self-closing tag
    const tagStart = i;
    const nameEnd = readName(src, i + 1);
    const name = src.slice(i + 1, nameEnd);
    let j = nameEnd;
    const attrNames = new Set<string>();
    const attrParts: string[] = [];
    let selfClosing = false;
    for (;;) {
      const wsStart = j;
      while (j < src.length && /\s/.test(src[j])) j++;
      if (j >= src.length) throw new XmlError(`Tag <${name}> is not closed (missing >)`, tagStart);
      if (src[j] === ">") {
        j++;
        break;
      }
      if (src[j] === "/") {
        if (src[j + 1] !== ">") throw new XmlError("Expected > after / in a self-closing tag", j + 1);
        selfClosing = true;
        j += 2;
        break;
      }
      if (j === wsStart) throw new XmlError("Attributes must be separated by whitespace", j);
      const aEnd = readName(src, j);
      const aName = src.slice(j, aEnd);
      if (attrNames.has(aName)) throw new XmlError(`Duplicate attribute "${aName}" on <${name}>`, j);
      attrNames.add(aName);
      let k = aEnd;
      while (k < src.length && /\s/.test(src[k])) k++;
      if (src[k] !== "=") throw new XmlError(`Attribute "${aName}" needs a value (="...")`, k);
      k++;
      while (k < src.length && /\s/.test(src[k])) k++;
      const q = src[k];
      if (q !== '"' && q !== "'") throw new XmlError(`Value of attribute "${aName}" must be in quotes`, k);
      const close = src.indexOf(q, k + 1);
      if (close === -1) throw new XmlError(`Value of attribute "${aName}" is not closed`, k);
      const val = src.slice(k + 1, close);
      if (val.includes("<")) throw new XmlError('"<" is not allowed inside an attribute value', k + 1 + val.indexOf("<"));
      validateEntities(val, k + 1);
      attrParts.push(`${aName}=${q}${val}${q}`);
      attributes++;
      j = close + 1;
    }
    if (stack.length === 0) {
      rootCount++;
      if (rootCount > 1) throw new XmlError("Only one root element is allowed", tagStart);
    }
    elements++;
    const node: XmlNode = {
      type: "element",
      name,
      attrs: attrParts.length ? " " + attrParts.join(" ") : "",
      selfClosing,
      children: [],
    };
    current.push(node);
    if (!selfClosing) {
      stack.push({ name, offset: tagStart, children: node.children });
      current = node.children;
      depth = Math.max(depth, stack.length);
    } else {
      depth = Math.max(depth, stack.length + 1);
    }
    i = j;
  }

  if (stack.length) {
    const open = stack[stack.length - 1];
    throw new XmlError(`Element <${open.name}> is never closed`, open.offset);
  }
  if (rootCount === 0 && !sawRootText) throw new XmlError("No root element found", 0);
  return { nodes: root, elements, attributes, depth };
}

function indentUnit(indent: XmlIndent): string {
  return indent === "tab" ? "\t" : " ".repeat(indent);
}

function serialize(nodes: XmlNode[], level: number, unit: string, out: string[]) {
  const pad = unit.repeat(level);
  for (const n of nodes) {
    if (n.type === "raw") out.push(pad + n.value);
    else if (n.type === "text") out.push(pad + n.value.trim().replace(/\s*\n\s*/g, " "));
    else if (n.selfClosing || n.children.length === 0) {
      out.push(n.selfClosing ? `${pad}<${n.name}${n.attrs}/>` : `${pad}<${n.name}${n.attrs}></${n.name}>`);
    } else if (n.children.length === 1 && n.children[0].type === "text") {
      out.push(`${pad}<${n.name}${n.attrs}>${(n.children[0] as { value: string }).value.trim()}</${n.name}>`);
    } else {
      out.push(`${pad}<${n.name}${n.attrs}>`);
      serialize(n.children, level + 1, unit, out);
      out.push(`${pad}</${n.name}>`);
    }
  }
}

function minifyNodes(nodes: XmlNode[]): string {
  return nodes
    .map((n) => {
      if (n.type === "raw") return n.value;
      if (n.type === "text") return n.value.trim().replace(/\s*\n\s*/g, " ");
      if (n.selfClosing) return `<${n.name}${n.attrs}/>`;
      return `<${n.name}${n.attrs}>${minifyNodes(n.children)}</${n.name}>`;
    })
    .join("");
}

export function formatXml(
  src: string,
  opts: { indent?: XmlIndent; minify?: boolean } = {},
): XmlResult {
  try {
    const tree = parseXml(src);
    const output = opts.minify
      ? minifyNodes(tree.nodes)
      : (() => {
          const out: string[] = [];
          serialize(tree.nodes, 0, indentUnit(opts.indent ?? 2), out);
          return out.join("\n");
        })();
    return {
      ok: true,
      output,
      stats: {
        elements: tree.elements,
        attributes: tree.attributes,
        depth: tree.depth,
        bytes: new TextEncoder().encode(output).length,
      },
    };
  } catch (e) {
    if (e instanceof XmlError) {
      const { line, column } = offsetToLineColumn(src, e.offset);
      return { ok: false, error: e.message, line, column };
    }
    throw e;
  }
}
