#!/bin/bash
# 이미지 생성 supervisor — 끊겨도 자동 재시작, 완료 시 커밋+푸시
# 실행: bash scripts/supervisor-images.sh > /tmp/supervisor.log 2>&1 &

cd /home/user/SORI
export GOOGLE_APPLICATION_CREDENTIALS="$(pwd)/gcp-key.json"
TOTAL=3052
COMMIT_INTERVAL=50   # 새 이미지 N장마다 커밋
LAST_COMMITTED=$(ls public/images/words/ | wc -l)

git config user.email noreply@anthropic.com
git config user.name Claude

auto_commit() {
  local count=$(ls public/images/words/ | wc -l)
  if [ "$count" -gt "$LAST_COMMITTED" ]; then
    git add public/images/words/
    git commit -m "feat: 단어 이미지 자동 커밋 — 총 ${count}장

https://claude.ai/code/session_01DkegYDZvRc5EVtZJgSJ3CX" 2>/dev/null
    for i in 1 2 3 4; do
      git push -u origin claude/speech-therapy-saas-design-Jns4A && break
      echo "[$(date)] push 재시도 $i"; sleep $((2 ** i))
    done
    echo "[$(date)] 커밋+푸시 완료: ${count}장"
    LAST_COMMITTED=$count
  fi
}

echo "[$(date)] Supervisor 시작 — 목표 ${TOTAL}장"

while true; do
  CURRENT=$(ls public/images/words/ | wc -l)
  echo "[$(date)] 현재 ${CURRENT}/${TOTAL}장 — 생성 시작"

  # 생성 실행 (완료까지 대기)
  npx tsx scripts/generate-word-images.ts
  EXIT_CODE=$?

  CURRENT=$(ls public/images/words/ | wc -l)
  echo "[$(date)] 생성기 종료 (exit ${EXIT_CODE}) — ${CURRENT}장"

  # 커밋
  auto_commit

  # 목표 달성 시 종료
  if [ "$CURRENT" -ge "$TOTAL" ]; then
    echo "[$(date)] ✅ 완료! 총 ${CURRENT}장 생성됨"
    break
  fi

  echo "[$(date)] 10초 후 재시작..."
  sleep 10
done
