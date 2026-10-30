import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
import { ROOT } from "../lib/paths.js";

const BEGIN = "// EDIT-BEGIN";
const END = "// EDIT-END";
export function bodyOf(source: string): string[] {
  const a = source.indexOf(BEGIN), b = source.indexOf(END);
  if (a < 0 || b <= a || source.indexOf(BEGIN, a + BEGIN.length) !== -1 || source.indexOf(END, b + END.length) !== -1) throw new Error("작성 구역 표시가 손상됐습니다. 파일의 EDIT-BEGIN / EDIT-END를 각각 한 개씩 유지하세요.");
  const body = source.slice(a + BEGIN.length, b).replace(/^\r?\n/, "").replace(/\r?\n$/, "");
  return body ? body.split(/\r?\n/) : [];
}
export function withBody(source: string, lines: string[]): string {
  bodyOf(source);
  return source.slice(0, source.indexOf(BEGIN) + BEGIN.length) + "\n" + lines.join("\n") + "\n" + source.slice(source.indexOf(END));
}
export const numbered = (lines: string[]) => lines.length ? lines.map((line, i) => `${String(i + 1).padStart(2)} │ ${line}`).join("\n") : "(빈 작성 구역)";

export class Draft {
  lines: string[];
  private history: string[][] = [];
  constructor(public original: string) { this.lines = bodyOf(original); }
  replace(lines: string[]) { this.history.push([...this.lines]); this.lines = [...lines]; }
  set(line: number, code: string) {
    if (!Number.isInteger(line) || line < 1 || line > this.lines.length) throw new Error(`줄 번호는 1~${this.lines.length}입니다. 새 줄은 :insert 번호 코드로 넣으세요.`);
    const next = [...this.lines]; next[line - 1] = code; this.replace(next);
  }
  insert(line: number, code: string) {
    if (!Number.isInteger(line) || line < 1 || line > this.lines.length + 1) throw new Error(`삽입 위치는 1~${this.lines.length + 1}입니다.`);
    const next = [...this.lines]; next.splice(line - 1, 0, code); this.replace(next);
  }
  delete(first: number, last = first) {
    if (!Number.isInteger(first) || !Number.isInteger(last) || first < 1 || last < first || last > this.lines.length) throw new Error("삭제할 줄 범위를 확인하세요. 예: :delete 2 또는 :delete 2 4");
    const next = [...this.lines]; next.splice(first - 1, last - first + 1); this.replace(next);
  }
  undo() { const previous = this.history.pop(); if (!previous) throw new Error("더 되돌릴 편집이 없습니다."); this.lines = previous; }
  get source() { return withBody(this.original, this.lines); }
}

export type CodeIssue = { file: string; line?: number; bodyLine?: number; message: string };
export function validate(file: string, source: string): CodeIssue[] {
  const lines = bodyOf(source);
  const duplicate = lines.findIndex(line => /^\s*(export\b|import\b)/.test(line));
  if (duplicate >= 0) return [{ file, bodyLine: duplicate + 1, message: "함수 안에 함수 선언문 또는 import/export를 다시 넣었습니다. 위의 함수 틀은 이미 제공됩니다. 작성 구역에는 return …; 같은 함수 안의 실행 코드만 넣으세요. :set 줄번호 코드로 이 줄을 교체하세요." }];
  if (!lines.some(line => line.trim())) return [{ file, message: "작성 구역이 비어 있습니다. 실행할 코드를 입력하세요." }];
  const config = ts.readConfigFile(path.join(ROOT, "tsconfig.json"), ts.sys.readFile);
  const options = ts.parseJsonConfigFileContent(config.config, ts.sys, ROOT).options;
  const host = ts.createCompilerHost(options);
  const original = host.getSourceFile.bind(host);
  const normalize = (p: string) => path.resolve(p).replace(/\\/g, "/").toLowerCase();
  host.getSourceFile = (name, languageVersion, onError, shouldCreateNewSourceFile) => normalize(name) === normalize(file)
    ? ts.createSourceFile(name, source, languageVersion, true)
    : original(name, languageVersion, onError, shouldCreateNewSourceFile);
  const program = ts.createProgram([file], { ...options, noEmit: true, incremental: false }, host);
  const bodyStart = source.slice(0, source.indexOf(BEGIN)).split(/\r?\n/).length;
  return ts.getPreEmitDiagnostics(program).slice(0, 8).map(d => {
    const at = d.file && d.start !== undefined ? d.file.getLineAndCharacterOfPosition(d.start).line + 1 : undefined;
    const current = d.file && normalize(d.file.fileName) === normalize(file);
    const guidance: Record<number, string> = {
      1005: "괄호·따옴표·문장 끝 기호가 빠졌는지 확인하세요.",
      1109: "실행할 표현식이 완성되지 않았습니다. 작성한 줄의 값을 확인하세요.",
      1184: "함수 틀을 다시 입력하지 마세요. 함수 안의 실행 코드만 작성합니다.",
      2304: "이 이름을 찾을 수 없습니다. 입력 변수 이름과 철자를 확인하세요.",
      2322: "반환값 또는 대입값의 타입이 맞지 않습니다. 이 함수가 반환해야 하는 객체·배열·글의 형태를 확인하세요.",
      2339: "없는 속성을 사용했습니다. 답을 await로 기다렸는지, content 철자가 맞는지 확인하세요.",
      2355: "결과를 반환하는 return 코드가 필요합니다.",
      2739: "반환한 객체에 필요한 속성이 빠져 있습니다. role과 content 등 문제의 결과 모양을 확인하세요.",
    };
    return {
      file: d.file?.fileName ?? file, line: at,
      bodyLine: current && (d.code === 2355 || d.code === 2366) ? 1 : current && at && at > bodyStart ? Math.min(at - bodyStart, lines.length || 1) : undefined,
      message: `${guidance[d.code] ? guidance[d.code] + "\n원문: " : ""}TS${d.code}: ${ts.flattenDiagnosticMessageText(d.messageText, " ")}`,
    };
  });
}

export function saveDraft(file: string, draft: Draft) {
  if (fs.readFileSync(file, "utf8") !== draft.original) throw new Error("편집 중 파일이 외부에서 바뀌었습니다. :cancel 후 :edit으로 다시 열어 주세요. 저장된 파일은 보존했습니다.");
  const backups = path.join(path.dirname(file), ".backups");
  fs.mkdirSync(backups, { recursive: true });
  fs.writeFileSync(path.join(backups, `${path.basename(file)}-${Date.now()}.bak`), draft.original);
  fs.writeFileSync(file, draft.source);
}
