#!/usr/bin/env bash
# Claude Code Hook → Slack 알림 스크립트
# stdin으로 hook input JSON을 받아 Slack Incoming Webhook으로 전송

set -euo pipefail

# 환경변수 확인 (CLAUDE_ENV_FILE에서 주입되지 않은 경우 .env.local에서 직접 로드)
if [ -z "${SLACK_WEBHOOK_URL:-}" ]; then
  ENV_FILE="${CLAUDE_PROJECT_DIR:-.}/.env.local"
  if [ -f "$ENV_FILE" ]; then
    SLACK_WEBHOOK_URL=$(grep '^SLACK_WEBHOOK_URL=' "$ENV_FILE" | cut -d'=' -f2-)
  fi
fi

if [ -z "${SLACK_WEBHOOK_URL:-}" ]; then
  exit 0
fi

# stdin에서 hook JSON 읽기
INPUT=$(cat)

EVENT=$(echo "$INPUT" | jq -r '.hook_event_name // empty')
PROJECT=$(basename "${CLAUDE_PROJECT_DIR:-unknown}")

CHANNEL="#starter-kit-noti"
USERNAME="Claude Code"

if [ "$EVENT" = "Notification" ]; then
  TITLE=$(echo "$INPUT" | jq -r '.title // "알림"')
  MESSAGE=$(echo "$INPUT" | jq -r '.message // ""')
  ICON=":lock:"
  STATUS="권한 요청"
  TEXT="*[${PROJECT}]* ${STATUS}\n${TITLE}: ${MESSAGE}"

elif [ "$EVENT" = "Stop" ]; then
  RAW=$(echo "$INPUT" | jq -r '.last_assistant_message // "작업 완료"')
  # 100자 제한
  SUMMARY="${RAW:0:100}"
  if [ ${#RAW} -gt 100 ]; then
    SUMMARY="${SUMMARY}..."
  fi
  ICON=":white_check_mark:"
  STATUS="작업 완료"
  TEXT="*[${PROJECT}]* ${STATUS}\n${SUMMARY}"

else
  exit 0
fi

PAYLOAD=$(jq -n \
  --arg channel "$CHANNEL" \
  --arg username "$USERNAME" \
  --arg text "$TEXT" \
  --arg icon_emoji "$ICON" \
  '{channel: $channel, username: $username, text: $text, icon_emoji: $icon_emoji}')

curl -s -o /dev/null -X POST \
  --data-urlencode "payload=$PAYLOAD" \
  "$SLACK_WEBHOOK_URL"
