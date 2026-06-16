#!/bin/bash
# 세션 시작 시 이미지 생성 자동 재개 (컨테이너 재시작 대응)
REPO=/home/user/SORI
cd "$REPO" || exit 0

COUNT=$(ls public/images/words/ 2>/dev/null | wc -l)
if [ "$COUNT" -ge 3052 ]; then
  exit 0  # 이미 완료
fi

# tmux 세션이 이미 살아있으면 (드물게 재시작 없이 이어지는 경우) 중복 실행 방지
if tmux has-session -t imggen 2>/dev/null; then
  exit 0
fi

export GOOGLE_APPLICATION_CREDENTIALS="$REPO/gcp-key.json"
tmux new-session -d -s imggen -x 220 -y 50 "cd $REPO && bash scripts/supervisor-images.sh 2>&1 | tee /tmp/supervisor.log"
tmux new-window -t imggen -n commit "cd $REPO && bash scripts/commit-watcher.sh 2>&1 | tee /tmp/commit-watcher.log"

echo "{\"systemMessage\": \"이미지 생성 자동 재개됨 (현재 ${COUNT}/3052장)\"}"
