#!/bin/bash
# 세션 시작 시 이미지 생성 + TTS pre-warm 자동 재개 (컨테이너 재시작 대응)
REPO=/home/user/SORI
cd "$REPO" || exit 0
export GOOGLE_APPLICATION_CREDENTIALS="$REPO/gcp-key.json"

IMG_COUNT=$(ls public/images/words/ 2>/dev/null | wc -l)
IMG_DONE=0
[ "$IMG_COUNT" -ge 3052 ] && IMG_DONE=1

TTS_DONE=0
grep -q '^완료 —' /tmp/tts-prewarm.log 2>/dev/null && TTS_DONE=1

if [ "$IMG_DONE" = 1 ] && [ "$TTS_DONE" = 1 ]; then
  exit 0  # 둘 다 완료
fi

if ! tmux has-session -t imggen 2>/dev/null; then
  tmux new-session -d -s imggen -x 220 -y 50 -n holder "sleep 1"
fi

WINDOWS=$(tmux list-windows -t imggen -F '#{window_name}')
MSG=""

if [ "$IMG_DONE" = 0 ] && ! echo "$WINDOWS" | grep -qx supervisor; then
  tmux new-window -t imggen -n supervisor "cd $REPO && bash scripts/supervisor-images.sh 2>&1 | tee /tmp/supervisor.log"
  MSG="이미지 생성 재개(${IMG_COUNT}/3052)"
fi
if [ "$IMG_DONE" = 0 ] && ! echo "$WINDOWS" | grep -qx commit; then
  tmux new-window -t imggen -n commit "cd $REPO && bash scripts/commit-watcher.sh 2>&1 | tee /tmp/commit-watcher.log"
fi
if [ "$TTS_DONE" = 0 ] && ! echo "$WINDOWS" | grep -qx tts; then
  tmux new-window -t imggen -n tts "cd $REPO && npx tsx scripts/tts-prewarm.ts 2>&1 | tee -a /tmp/tts-prewarm.log"
  MSG="${MSG:+$MSG, }TTS pre-warm 재개"
fi

[ -n "$MSG" ] && echo "{\"systemMessage\": \"자동 재개됨: ${MSG}\"}"
exit 0
