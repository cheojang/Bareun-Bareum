#!/bin/bash
# 커밋 워처 — tmux 독립 윈도우에서 2분마다 새 이미지를 커밋+푸시.
# Claude 턴과 독립적으로 동작해 stop hook 의존성 제거.
cd /home/user/SORI
git config user.email noreply@anthropic.com
git config user.name Claude

while true; do
  # 목표 달성 시에도 마지막 커밋 한 번 더 하고 계속 (생성 supervisor가 종료 판단)
  UNTRACKED=$(git status --porcelain public/images/words/ | grep -c '^??')
  if [ "$UNTRACKED" -gt 0 ]; then
    # git lock 있으면 이번 주기 건너뜀
    if [ ! -f .git/index.lock ]; then
      COUNT=$(ls public/images/words/ | wc -l)
      git add public/images/words/
      git commit -m "feat: 단어 이미지 자동 커밋 — 총 ${COUNT}장

https://claude.ai/code/session_01DkegYDZvRc5EVtZJgSJ3CX" >/dev/null 2>&1
      for i in 1 2 3 4; do
        git push -u origin claude/speech-therapy-saas-design-Jns4A >/dev/null 2>&1 && break
        sleep $((2 ** i))
      done
      echo "[$(date '+%H:%M:%S')] 커밋+푸시 완료: ${COUNT}장"
    else
      echo "[$(date '+%H:%M:%S')] git lock 존재 — 다음 주기 대기"
    fi
  else
    echo "[$(date '+%H:%M:%S')] 신규 이미지 없음"
  fi
  sleep 120
done
