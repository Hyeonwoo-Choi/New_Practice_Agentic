/** 아직 구현하지 않은 곳에서 던지는 교육용 오류. 검사 화면이 이 메시지를 그대로 보여 준다 */
export class LearnerTodoError extends Error {
  constructor(
    public todoId: string,
    hint: string,
  ) {
    super(`아직 구현하지 않았습니다 (TODO ${todoId}). ${hint}`);
    this.name = "LearnerTodoError";
  }
}
export const notImplemented = (todoId: string, hint: string): never => {
  throw new LearnerTodoError(todoId, hint);
};
