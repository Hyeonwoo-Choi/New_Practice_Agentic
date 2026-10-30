# U01 작성 위치 안내

**설명은 .md, 실행할 코드는 .ts, 명령은 터미널에 씁니다.** 이 문서는 읽기만 하세요.

## 지금 할 일을 고르세요

| 할 일 | 바로 열기 | 정확히 할 일 |
|---|---|---|
| 개념 이해 | [개념](03-concept.md) | 공책 비유와 메시지 개수 표 읽기 |
| 작동하는 코드 보기 | [첫 호출](example/ex1-single-call.ts) → [이어 묻기](example/ex2-followup.ts) | 읽고 터미널에서 실행 |
| 문법을 바꿔 보며 연습 | [자유 연습장](example/scratch.ts) | 맨 아래 연습 구역에 코드 작성 |
| 실행 전 예상 기록 | [예측](predictions.md) | P1: 같은 줄의 콜론 뒤에 예상값과 이유 작성 |
| 기본 코드 구현 | [내 대화 코드](work/conversation.ts) | TODO(U01-1), TODO(U01-2) 안에 작성 |
| 응용 구현 | [내 응용 코드](work/apply.ts) | TODO(U01-3) 안에 작성 |
| 배운 내용 설명 | [회고](reflection.md) | 번호 아래의 (여기에 적기)를 내 문장으로 교체 |
| 자료에 대한 의견 | [피드백](FEEDBACK.md) | 실제 시간, 막힌 곳, 개선 의견 작성 |

work 링크가 열리지 않으면 프로젝트 루트 터미널에서 아래를 실행하세요. 기존 작업은 덮어쓰지 않습니다.

```powershell
npm run begin -- u01
```

## VS Code에서 이동하기

1. 문서를 열고 Ctrl+Shift+V로 미리보기를 여세요. 미리보기의 파일 링크를 누르면 이동합니다.
2. 원문에서는 링크에 마우스를 올려 표시되는 링크 열기 안내를 따르세요. 보통 Ctrl+클릭입니다.
3. 코드 파일에서 Ctrl+F로 TODO(U01-1) 같은 표시를 찾으세요. 해당 함수의 중괄호 안이 작성 위치입니다.
4. 터미널은 상단 Terminal → New Terminal로 열고 위치가 D:\dev\New_Practice_Agentic인지 확인하세요.

## 폴더 이름을 이렇게 읽으세요

| 폴더·파일 | 용도 | 내가 수정하나? |
|---|---|---|
| 01~08로 시작하는 .md | 설명서 | 읽기만 |
| example/ | 작동하는 견본 | 읽기. 자유 실험은 scratch.ts에서 |
| work/ | 검사할 내 코드 | 여기서 구현 |
| start/ | work를 만들 때 복사하는 원본 | 수정하지 않음 |
| experiments/ | 일부러 틀린 견본 | 수정하지 않고 실패 관찰 |
| hints/ | 단계별 도움말 | 읽기만 |
| predictions.md | 실행 전 예상과 실행 후 비교 | 작성 |
| reflection.md | 실습 뒤 내 말로 설명 | 작성 |
| FEEDBACK.md | 학습 자료에 대한 의견 | 작성 |

## 처음부터 따라가기

| 순서 | 열기 | 작성·실행할 것 | 끝났다는 기준 |
|---|---|---|---|
| 1 | [문제](01-problem.md) → [기초](02-prereq.md) → [개념](03-concept.md) | 읽기만 | “그중”에 이전 추천이 필요한 이유 이해 |
| 2 | [예제 안내](04-example.md) | 출력 예상 후 두 예제 실행 | 답 받기와 답 저장의 차이 확인 |
| 3 | [예측](predictions.md) | P1·P2·P3에 예상값과 이유 작성 | 세 줄 작성 |
| 4 | [구현 안내](05-implement.md) | work/conversation.ts의 TODO 1·2 구현 | 기본 검사 5개 통과 |
| 5 | [실험](06-experiments.md) | P4 작성 → e1 실행 → 회고 3 작성 | 기록에서 실패 원인 찾음 |
| 6 | [응용](07-apply.md) | work/apply.ts의 TODO 3 구현 | 응용 검사 통과 |
| 7 | [설명 기준](08-recall-explain.md) | 회고 1·2·3·5·7 작성 | 각 칸에 내 설명 2~4문장 |
| 8 | [피드백](FEEDBACK.md) | 실제 시간과 불편한 점 작성 | 개선할 점 기록 |

e2, P5, 회고 4·6은 선택입니다. 모든 파일을 한 번에 채우지 않아도 됩니다.

## 터미널에 입력하는 명령

아래 명령은 코드나 예측 파일에 붙이지 말고 터미널에 한 줄씩 입력하세요.

```powershell
# 자유 연습장 실행 (검사와는 별개)
npx tsx units/u01-messages/example/scratch.ts

# 기본 코드 검사
npm run check -- u01

# 내 코드로 두 번 대화
npm run play -- u01

# 응용 검사
npm run check -- u01 --apply

# 학습 화면
npm run view
```

주의: npm run play --u01이 아니라 **npm run play -- u01**입니다. -- 앞뒤를 띄워야 단원 이름이 전달됩니다.

---

**챕터 2 / 13 · 작성 위치 안내**

[← 이전 챕터: 단원 소개](README.md)

**[다음 챕터: 문제 만나기 →](01-problem.md)**

두 번째 질문에 이전 답이 필요한 이유를 생각하세요.
