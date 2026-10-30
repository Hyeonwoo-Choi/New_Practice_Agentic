/** 문제 데이터와 MD 문제집의 단계·제목·기대 결과를 맞추는 유지보수 도구. */
import fs from "node:fs";
import path from "node:path";
import { ROOT } from "../lib/paths.js";
import { steps } from "./steps.js";

const dir = path.join(ROOT, "docs", "course");
fs.mkdirSync(dir, { recursive: true });
const explanations = [
  '메시지 하나는 객체입니다. role은 말한 주체를 표시하고 content는 글을 담습니다. 여기서 user는 사용자, assistant는 모델, system은 개발자가 정한 기본 지침입니다. 예를 들어 `{ name: "민수" }`가 이름을 담듯 메시지 객체에는 role과 content를 담습니다.',
  '`push`는 기존 배열을 바꿉니다. `[...old, newItem]`은 기존 내용을 펼쳐 새 배열을 만듭니다. 예를 들어 `[...[1, 2], 3]`은 `[1, 2, 3]`입니다. 이번 과제에서는 전달받은 history를 바꾸면 실패합니다.',
  '`async` 함수는 나중에 결과가 나오는 Promise를 반환합니다. `await`를 쓰면 그 결과를 받은 뒤 다음 줄을 실행합니다. 이번 함수는 fetchReply를 인자로 받습니다. 호출하려면 fetchReply()처럼 괄호가 필요합니다.',
  'chat은 메시지 배열을 받아 assistant 메시지 하나를 돌려주는 이 프로젝트의 함수입니다. buildSystemPrompt()는 연습용 방 목록과 업무 지침을 글로 만듭니다. 실제 API 키는 필요 없습니다. 연습 모델은 인원과 “저렴” 같은 표현에 반응하며 날짜별 빈방 조회나 예약 처리는 하지 않습니다.',
  'system은 새 대화를 시작할 때 한 번 넣습니다. 다음 질문에서도 같은 기록 전체를 보내므로 system이 다시 전달됩니다. 질문마다 system 메시지를 추가하는 것은 아닙니다. 배열을 함수 밖에 하나만 만들면 여러 대화가 같은 배열을 사용하게 됩니다.',
  '“그중”을 이해하려면 앞에서 추천한 방 목록이 필요합니다. 첫 답을 화면에 표시하기만 하고 기록에 넣지 않으면 다음 호출은 그 목록을 못 봅니다. assistant라는 별도 저장소는 없습니다. 같은 messages 배열 안에서 모델의 말임을 나타내는 role입니다.',
  '이번에는 새 함수를 처음부터 만드는 대신 주어진 결함을 고칩니다. 첫 질문의 화면 출력만 정상이어도 후속 질문은 실패할 수 있습니다. 검사는 답의 문구뿐 아니라 반환한 기록과 실제 모델에 전달된 메시지 순서를 확인합니다.',
  'Map은 사용자 ID로 값을 넣고 꺼내는 저장소입니다. `const prices = new Map<string, number>(); prices.set("apple", 100); prices.get("apple");`의 결과는 100, 없는 키는 undefined입니다. 이번 값은 숫자가 아니라 Message[]입니다. 사용자별 Map은 createChatService 안, say 밖에 두어야 같은 서비스의 다음 호출에도 유지됩니다.',
];
for (let i = 0; i < steps.length; i++) {
  const s = steps[i];
  const prev = i ? `${steps[i - 1].id}.md` : "00-start.md";
  const next = i + 1 < steps.length ? `${steps[i + 1].id}.md` : "09-finish.md";
  const nextTitle = i + 1 < steps.length ? steps[i + 1].title : "완성한 서비스 실행하기";
  const text = `# ${i + 1}. ${s.title}

**문제집 ${i + 1}/8 · 풀이 파일: practice/${s.id}.ts**

## 해결할 문제

${s.problem}

## 나와야 하는 결과

${s.expected}

검사는 제시된 예뿐 아니라 다른 입력도 넣습니다. 예시 답을 문자열로 고정해서 반환하면 통과하지 못합니다.

## 이 문제에 필요한 설명

${explanations[i]}

## 터미널에서 작성하기

터미널에는 **${i + 1}/8 · ${s.title}**이 보여야 합니다. 다르면 :back 또는 현재 단계의 :next로 번호를 맞추세요. :next는 현재 단계와 이전 단계 검사를 통과해야 이동합니다.

1. :show로 현재 코드와 작성할 함수를 확인합니다.
2. :edit을 입력합니다. 함수 **안의 코드만** 입력합니다. import, 아래 함수 선언, 함수 바깥 중괄호는 입력하지 않습니다.
3. 여러 줄을 입력해도 됩니다. 입력이 끝나면 별도 줄에 :save를 입력합니다. 이 코드는 기존 함수 본문 전체를 교체합니다.
4. 잘못 입력했다면 저장 전에 :cancel로 취소하고 :edit부터 다시 합니다.

자동으로 제공되는 함수 선언:

\`\`\`ts
${s.signature}
\`\`\`

작성할 본문의 시작 상태:

\`\`\`ts
${s.starter}
\`\`\`

위 시작 상태는 ${i === 6 ? "일부러 결함이 있는 코드입니다. 원인을 고쳐야" : "미완성 코드입니다. 실제 구현으로 교체해야"} 합니다. 별도 예상 답안이나 설명문은 작성하지 않습니다.

## 실행하고 점검하기

학습 터미널에서 다음을 입력하세요. PowerShell 명령이 아니라 학습 프로그램의 명령입니다.

\`\`\`text
:check
\`\`\`

- 성공: 1번부터 현재 ${i + 1}번까지 ✔가 나옵니다.
- 실패: ✘ 뒤의 기대값·실제값 또는 실패 이유를 읽고 해당 코드를 고칩니다. 이전 단계가 실패했다면 :back으로 돌아가 고친 뒤 다시 순서대로 진행합니다.
- 한 번에 통과하지 않아도 괜찮습니다. **코드 수정 → 저장 → 검사**를 반복합니다.

막히면 이 챕터 안에서 해결할 힌트: ${s.hint}

## 다음 단계로 이동

검사가 통과하면 터미널에서 :next를 입력합니다. 다음 단계가 표시되면 아래 링크를 누르세요. 마지막 실습에서는 “모든 실습을 통과했습니다”가 표시됩니다.

---

[← 이전 챕터](${prev})

[다음 챕터: ${nextTitle} →](${next})
`;
  fs.writeFileSync(path.join(dir, s.id + ".md"), text);
}
