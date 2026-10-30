# S3. HTTP · JSON · API (보충)

> **읽고 확인하는 보충 문서입니다.** 확인 질문은 말이나 개인 노트로 답하면 됩니다. 코드로 연습하려면 [자유 연습장](../../units/u01-messages/example/scratch.ts)을 사용하세요. 이 문서에 실행 코드를 쓰지 않습니다.


모델을 부른다는 것은 **인터넷의 서버에 요청(request)을 보내고 응답(response)을 받는 것**입니다. 이 프로젝트의 `chat()` 이 대신해 주지만, 안에서 무슨 일이 일어나는지는 알아야 합니다.

## 요청과 응답

| | 누가 | 내용 |
|---|---|---|
| 요청 | 우리 코드(클라이언트) | 어디로(URL), 어떻게(POST), 무엇을(본문 JSON), 누구냐(인증 키) |
| 응답 | 모델 서버 | 상태 코드(200 은 성공) + 본문 JSON |

`fetch` 가 JavaScript 에서 요청을 보내는 함수입니다 (`await fetch(...)`).

## JSON: 글로 된 객체

```json
{ "model": "x", "messages": [{ "role": "user", "content": "hi" }] }
```

네트워크로는 **글자**만 오갑니다. 그래서:

- 객체 → 글자: `JSON.stringify(obj)`
- 글자 → 객체: `JSON.parse(text)`

## 이 프로젝트의 chat() 이 보내는 것 (개념)

```
POST {LLM_BASE_URL}/chat/completions
인증: Bearer {LLM_API_KEY}
본문: { "model": ..., "messages": [ ...대화 전체... ] }
응답: { "choices": [ { "message": { "role": "assistant", "content": "..." } } ] }
```

여기서 두 가지를 눈여겨보세요.

1. 본문에 **`messages` 전체**가 들어 있습니다. 서버는 요청마다 독립입니다. (U01 의 핵심)
2. 응답에 들어 있는 것은 **assistant 메시지 하나**입니다.

## API 키

- 서버가 "이 요청은 누구의 것인가" 를 아는 방법이고, 쓴 만큼 비용이 청구됩니다.
- 코드 파일에 직접 적으면 공유·저장 과정에서 유출됩니다. **환경변수 / `.env` 에 두고 코드에는 쓰지 않습니다.**
- 이 프로젝트의 기본값(fake)은 키가 필요 없습니다. `.env` 는 `.gitignore` 에 들어 있어 git 에 올라가지 않습니다.

## 확인 문제

1. 요청 본문에서 `messages` 를 빼고 질문 한 줄만 보내면 서버는 이전 질문을 알까? (모른다)
2. `JSON.parse` 의 입력은 객체인가, 글자인가? (글자)

---

[← S2 async/await](s2-async-await.md)

[다음 챕터: U01 시작 →](../../units/u01-messages/README.md)
