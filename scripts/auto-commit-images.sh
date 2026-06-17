#!/bin/bash
# 단어 이미지 자동 커밋 루프
# 이미지 생성 스크립트와 병행 실행 — 5분마다 신규 이미지를 커밋·푸시
cd /home/user/SORI
git config user.email noreply@anthropic.com
git config user.name Claude

while true; do
  sleep 20

  UNTRACKED=$(git status --short public/images/words/ | grep "^??" | wc -l)
  if [ "$UNTRACKED" -gt 0 ]; then
    COUNT=$(ls public/images/words/ | wc -l)
    git add public/images/words/*.webp 2>/dev/null || true
    git commit -m "feat: 단어 이미지 자동 커밋 — 총 ${COUNT}장

https://claude.ai/code/session_01DkegYDZvRc5EVtZJgSJ3CX"

    for i in 1 2 3 4; do
      git push -u origin claude/speech-therapy-saas-design-Jns4A && break
      echo "push 재시도 $i"; sleep $((2 ** i))
    done
    echo "[$(date)] 커밋+푸시 완료: ${COUNT}장"
  else
    echo "[$(date)] 신규 이미지 없음 (건너뜀)"
  fi

  # 생성 프로세스 종료 시 루프 탈출
  if ! pgrep -f "generate-word-images" > /dev/null; then
    echo "[$(date)] 생성 프로세스 종료 감지 — 마지막 커밋 수행"
    UNTRACKED=$(git status --short public/images/words/ | grep "^??" | wc -l)
    if [ "$UNTRACKED" -gt 0 ]; then
      COUNT=$(ls public/images/words/ | wc -l)
      git add public/images/words/*.webp 2>/dev/null || true
      git commit -m "feat: 단어 이미지 최종 커밋 — 총 ${COUNT}장

https://claude.ai/code/session_01DkegYDZvRc5EVtZJgSJ3CX"
      for i in 1 2 3 4; do
        git push -u origin claude/speech-therapy-saas-design-Jns4A && break
        echo "push 재시도 $i"; sleep $((2 ** i))
      done
      echo "[$(date)] 최종 커밋+푸시 완료: ${COUNT}장"
    fi
    break
  fi
done
echo "[$(date)] auto-commit-images.sh 종료"
