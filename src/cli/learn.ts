import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import { spawn } from "node:child_process";
import { ROOT } from "../lib/paths.js";
import { steps, sourceFor } from "../course/steps.js";

const work = path.resolve(process.env.COURSE_WORK_DIR ?? path.join(ROOT, "practice"));
const stateFile = path.resolve(process.env.COURSE_PROGRESS_FILE ?? path.join(ROOT, "progress", "course.json"));
fs.mkdirSync(work, { recursive: true });
let index = 0;
let finalRun = false;
try {
  const state = JSON.parse(fs.readFileSync(stateFile, "utf8"));
  if (Number.isInteger(state.index) && state.index >= 0 && state.index <= steps.length) index = state.index;
  finalRun = index === steps.length && state.finalRun === true;
} catch { /* 처음 실행할 때는 첫 실습부터 시작한다. */ }
const persist = () => {
  fs.mkdirSync(path.dirname(stateFile), { recursive: true });
  fs.writeFileSync(stateFile, JSON.stringify({ index, finalRun, updatedAt: new Date().toISOString() }, null, 2) + "\n");
};
const file = () => path.join(work, steps[index].id + ".ts");
function show() {
  if (index === steps.length) {
    console.log("\n모든 실습을 통과했습니다.");
    console.log(finalRun ? "최종 서비스 실행도 통과했습니다. :run으로 다시 실행하거나 :quit으로 종료하세요." : "마지막 과제: :run으로 직접 만든 서비스를 실행하세요.");
    console.log("만든 것: 메시지 생성 → 기록 관리 → 모델 호출 → 이어 묻기 → 사용자별 대화.");
    console.log("문제집 docs/course/09-finish.md에서 최종 실행 과제를 확인하세요.");
    console.log("U02 이후는 아직 제공되지 않습니다. :back으로 마지막 실습 복습, :quit으로 종료할 수 있습니다.");
    return;
  }
  if (!fs.existsSync(file())) fs.writeFileSync(file(), sourceFor(steps[index]));
  const s = steps[index];
  console.log(`\n━━ ${index + 1}/${steps.length} · ${s.title} ━━\n문제: ${s.problem}\n기대 결과: ${s.expected}\n작성 파일: ${file()}`);
  console.log(`문제집: docs/course/${s.id}.md`);
  console.log("\n작성할 함수:");
  console.log(fs.readFileSync(file(), "utf8"));
  console.log(":edit → 함수 안의 코드 입력 → :save → :check → :next");
  console.log("통과 후 :next를 입력하고, MD 맨 아래의 다음 챕터를 여세요. 두 곳의 단계 번호가 같아야 합니다.");
}
const help = () => console.log("\n:show 문제와 현재 코드 | :edit 함수 안 코드 입력 | :save 저장 | :cancel 입력 취소\n:check 검사 | :hint 힌트 | :next 통과 후 다음 실습 | :back 이전 실습 | :run 최종 대화 시연 | :quit 종료\n함수 이름과 EDIT 표시 주석은 유지하세요.\n여기는 학습 프로그램입니다. npm이나 셸 명령을 실행하는 곳이 아닙니다.");

async function check(demo = false): Promise<boolean> {
  console.log("현재 단계와 이전 단계들을 다시 검사합니다 (연습용 모델, 네트워크 없음).");
  return new Promise((resolve) => {
    const child = spawn(process.execPath, ["--import", "tsx", "src/course/verify.ts", String(Math.min(index, steps.length - 1)), ...(demo ? ["--demo"] : [])], {
      cwd: ROOT, env: { ...process.env, LLM_MODE: "fake", COURSE_WORK_DIR: work }, stdio: ["ignore", "inherit", "inherit"],
    });
    const timer = setTimeout(() => { console.log("검사 시간 초과: 무한 반복 또는 끝나지 않는 Promise를 확인하세요."); child.kill(); }, 15000);
    child.on("error", (e) => { clearTimeout(timer); console.log(e.message); resolve(false); });
    child.on("close", (code) => { clearTimeout(timer); resolve(code === 0); });
  });
}

console.log("터미널 실습 · 코드 입력과 검사를 여기서 합니다. :help로 명령 확인");
show();
let buffer: string[] | null = null;
let editOriginal = "";
const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: Boolean(process.stdin.isTTY) });
if (process.stdin.isTTY) rl.setPrompt("실습> ");
rl.prompt();
for await (const raw of rl) {
  const cmd = raw.trim();
  if (buffer !== null) {
    if (cmd === ":cancel" || cmd === ":quit") { buffer = null; console.log("입력 취소. 기존 파일은 그대로입니다."); if (cmd === ":quit") break; }
    else if (cmd === ":save") {
      const current = fs.readFileSync(file(), "utf8");
      if (current !== editOriginal) console.log("입력 중 파일이 외부에서 바뀌었습니다. :cancel 후 :edit으로 다시 시작하세요.");
      else if (!buffer.some((s) => s.trim())) console.log("빈 코드는 저장하지 않습니다. 코드를 입력하거나 :cancel 하세요.");
      else {
        const start = current.indexOf("// EDIT-BEGIN"), end = current.indexOf("// EDIT-END");
        if (start < 0 || end <= start) console.log("EDIT 표시가 없습니다. :cancel 후 파일 구조를 확인하세요.");
        else {
          const backupDir = path.join(work, ".backups");
          fs.mkdirSync(backupDir, { recursive: true });
          fs.writeFileSync(path.join(backupDir, `${steps[index].id}-${Date.now()}.ts.bak`), current);
          fs.writeFileSync(file(), current.slice(0, start + "// EDIT-BEGIN".length) + "\n" + buffer.join("\n") + "\n" + current.slice(end));
          buffer = null;
          console.log("저장했습니다. :check로 검사하세요. 이전 코드는 practice/.backups에 보관했습니다.");
        }
      }
    } else if (cmd.startsWith(":")) console.log("입력 중에는 :save, :cancel, :quit만 사용합니다. 함수 전체가 아니라 함수 안의 코드를 입력하세요.");
    else buffer.push(raw);
  } else if (cmd === ":quit") break;
  else if (cmd === ":help") help();
  else if (cmd === ":show") show();
  else if (cmd === ":edit" && index < steps.length) {
    editOriginal = fs.readFileSync(file(), "utf8"); buffer = [];
    console.log("함수 안의 코드를 처음부터 입력/붙여넣기 하세요. 이 입력이 기존 함수 본문을 교체합니다.\nimport, 함수 선언, 바깥 중괄호는 입력하지 마세요. 여러 줄 입력 후 별도 줄에 :save. 취소는 :cancel.");
  } else if (cmd === ":hint" && index < steps.length) console.log(steps[index].hint);
  else if (cmd === ":check") { if (await check()) console.log(index < steps.length ? "통과. :next를 입력하면 다음 실습입니다." : "전체 재검사 통과. :run으로 최종 대화를 실행하세요."); }
  else if (cmd === ":run") {
    if (index < steps.length - 1) console.log("최종 대화는 8단계에서 사용자별 서비스를 작성한 뒤 실행할 수 있습니다.");
    else if (await check(true)) { finalRun = true; persist(); console.log("최종 실행 통과. 현재 제공된 실습을 모두 마쳤습니다."); }
  }
  else if (cmd === ":next" && index < steps.length) {
    if (await check()) { index++; finalRun = false; persist(); show(); }
    else console.log("아직 이동하지 않았습니다. 표시된 단계의 코드를 고친 뒤 다시 검사하세요.");
  } else if (cmd === ":back") { index = Math.max(0, index - 1); finalRun = false; persist(); show(); }
  else if (cmd) help();
  rl.prompt();
}
rl.close();
console.log("종료했습니다. 다음에 npm run learn을 실행하면 같은 단계에서 이어갑니다. 저장하지 않은 입력은 반영되지 않습니다.");
