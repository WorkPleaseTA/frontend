# WorkManager — 프론트엔드 API 연동 가이드

## 서비스 개요

업장(가게) 관리 앱. 사장님(OWNER)과 직원(STAFF)이 함께 쓰는 앱으로,
스케줄 관리 / 대타 신청 / 실시간 채팅 / 공유 TODO / AI 기능을 제공한다.

---

## 기본 설정

### Base URL

```
Production: https://workmanager.store
Local:      http://localhost:8080
```

### CORS

React Native는 브라우저가 아니므로 CORS 제약 없음. 별도 설정 불필요.

### 공통 응답 형식

모든 API는 아래 형태로 응답한다.

```json
{
  "success": true,
  "data": { ... }
}
```

실패 시:

```json
{
  "success": false,
  "code": "ERROR_CODE",
  "message": "에러 메시지"
}
```

---

## 인증 (JWT)

### 토큰 구조

- **accessToken**: API 요청 시 Authorization 헤더에 Bearer로 전달
- **refreshToken**: accessToken 만료 시 재발급에 사용. 앱 로컬에 안전하게 저장 (AsyncStorage 등)

### 요청 헤더

```
Authorization: Bearer {accessToken}
```

### axios 인터셉터 권장 구현

```js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({ baseURL: 'https://workmanager.store' });

// 요청마다 accessToken 자동 삽입
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// accessToken 만료(401) 시 refreshToken으로 자동 재발급
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      const { data } = await axios.post('/auth/reissue', { refreshToken });
      await AsyncStorage.setItem('accessToken', data.data.accessToken);
      await AsyncStorage.setItem('refreshToken', data.data.refreshToken);
      error.config.headers.Authorization = `Bearer ${data.data.accessToken}`;
      return api.request(error.config);
    }
    return Promise.reject(error);
  }
);
```

---

## 앱 플로우 (화면 진입 순서)

```
회원가입 → 로그인 → 가게 등록(OWNER) 또는 초대코드로 합류(STAFF)
→ 홈(내 스케줄 + 매장 스케줄) → 대타 → 채팅 → TODO → AI
```

---

## API 상세

### 1. Auth (인증)

#### 회원가입

```
POST /auth/signup
Body: { loginId, password, name, role }
role: "OWNER" | "STAFF"
응답: 201 Created, data: null
```

#### 로그인

```
POST /auth/login
Body: { loginId, password }
응답: { accessToken, refreshToken }
→ 두 토큰 모두 AsyncStorage에 저장
```

#### 토큰 재발급

```
POST /auth/reissue
Body: { refreshToken }
응답: { accessToken, refreshToken }
→ 인터셉터에서 자동 처리 권장
```

#### 로그아웃

```
POST /auth/logout
Header: Authorization (필수)
→ 서버에서 Redis refreshToken 삭제. 로컬 토큰도 함께 삭제할 것.
```

---

### 2. Store (가게)

#### 가게 등록 (OWNER 전용)

```
POST /stores
Body: { name, address }
응답: { storeId, name, inviteCode }
→ inviteCode를 직원에게 전달해 합류시킴
```

#### 가게 합류 (STAFF 전용)

```
POST /stores/join
Body: { inviteCode }
응답: 200 OK
→ 합류 시 서버에서 단체 채팅방 + DM 채팅방 자동 생성됨
```

#### 내 가게 목록 조회

```
GET /stores/me
응답: [{ storeId, name, role, staffList: [{ storeMemberId, name, workDays }] }]
→ 앱 진입 시 storeId를 이 API로 가져와서 전역 상태에 저장할 것
→ storeMemberId: 이후 대타/채팅 등 대부분 API에서 사용하는 핵심 식별자
```

**중요**: 서버 내부적으로 userId가 아닌 storeMemberId 단위로 동작한다.
로그인 후 반드시 이 API를 호출해 storeId와 storeMemberId를 저장해둘 것.

---

### 3. 고정 스케줄 (OWNER 관리)

고정 스케줄은 **요일 반복 패턴 템플릿**이다. 날짜/월 개념 없음.
달력 표시 시 프론트가 날짜 → 요일 변환 후 해당 요일 스케줄을 찾아 표시한다.

#### 고정 스케줄 조회 (달력용)

```
GET /stores/{storeId}/fixed-schedules?dayOfWeek=MONDAY
dayOfWeek: MONDAY | TUESDAY | WEDNESDAY | THURSDAY | FRIDAY | SATURDAY | SUNDAY
응답: [{ scheduleId, storeMemberId, staffName, dayOfWeek, startTime, endTime }]
→ dayOfWeek 생략 시 전 요일 반환
```

#### 고정 스케줄 편집 화면용 조회 (편집 UI 전용)

```
GET /stores/{storeId}/fixed-schedules/edit-view?dayOfWeek=MONDAY
응답: [{ storeMemberId, staffName, hasSchedule, scheduleId?, startTime?, endTime? }]
→ 편집 화면에서 전 직원 목록 + 등록 여부를 한 번에 보여줄 때 사용
→ 달력 표시용으로는 사용하지 말 것
```

#### 고정 스케줄 등록 (strict create, 중복 시 409)

```
POST /stores/{storeId}/fixed-schedules
Body: { schedules: [{ storeMemberId, dayOfWeek, startTime, endTime }] }
```

#### 고정 스케줄 저장 (upsert, 있으면 수정 없으면 생성)

```
PUT /stores/{storeId}/fixed-schedules
Body: { schedules: [{ storeMemberId, dayOfWeek, startTime, endTime }] }
→ 편집 화면 저장 버튼에 이 API 사용 권장
```

#### 고정 스케줄 삭제

```
DELETE /stores/{storeId}/fixed-schedules/{scheduleId}
```

---

### 4. 스케줄 조회

#### 오늘 내 스케줄 (STAFF 홈 화면용)

```
GET /schedule/my/today?storeId={storeId}
응답: { storeId, storeName, startTime, endTime, isSubstitute }
isSubstitute: true이면 대타로 확정된 스케줄
→ 고정 스케줄보다 work_schedule이 우선. 없으면 오늘 요일의 고정 스케줄 반환.
```

#### 매장 전직원 일별 스케줄 (캘린더 특정 날짜 탭)

```
GET /stores/{storeId}/schedules?date=2026-06-10
date 형식: yyyy-MM-dd
응답: [{ storeMemberId, staffName, startTime, endTime, isSubstitute }]
→ 우선순위: work_schedule(대타 포함) > fixed_schedule
→ isSubstitute: true인 항목이 있으면 해당 날짜에 대타가 발생한 것
→ 대타 요청자(본인 시간대를 넘긴 사람)는 응답에서 제외됨
```

---

### 5. 대타

대타 플로우는 2단계다.

```
1단계: 후보 조회 (AI 정렬) → 사용자가 후보 선택 + 메시지 작성
2단계: 대타 요청 생성 (선택한 후보 ID 포함)
```

#### [1단계] AI 대타 후보 조회

```
GET /substitute/candidates?storeId=1&date=2026-06-10&startTime=09:00:00&endTime=18:00:00
→ StaffAvailability 기반으로 후보 조회 → GPT가 시간 적합도 순 정렬
→ DB 저장 없음 (순수 조회)
→ 후보 없으면 빈 배열 반환
응답: { candidates: [{ storeMemberId, staffName, availableTimes: [...] }] }
```

#### [2단계] 대타 요청 생성

```
POST /substitute/requests
Body: {
  storeId,
  requestDate,                      // yyyy-MM-dd
  startTime,                        // HH:mm:ss
  endTime,                          // HH:mm:ss
  message,                          // 요청 메시지
  selectedStoreMemberIds: [...]      // 1단계에서 선택한 후보 storeMemberId 배열
}
→ 선택된 후보마다 SubstituteCandidate 생성 (WAITING 상태)
```

#### 내 대타 요청 목록 (내가 보낸 요청 현황)

```
GET /substitute/requests/my?storeId={storeId}
응답: [{ requestId, requestDate, startTime, endTime, message, candidates: [{ candidateId, staffName, status }], createdAt }]
status: WAITING | ACCEPTED | DECLINED
```

#### 들어온 대타 요청 (나에게 온 요청 알림)

```
GET /substitute/requests/incoming?storeId={storeId}
응답: [{ candidateId, requesterName, requestDate, startTime, endTime, message, myStatus, requestStatus, createdAt }]
→ myStatus: 내 수락/거절 여부
→ requestStatus: 요청 전체 상태 (누군가 이미 수락했으면 ACCEPTED)
```

#### 대타 수락

```
POST /substitute/candidates/{candidateId}/accept
→ 수락 시 자동으로:
   - 내 work_schedules에 해당 날짜 스케줄 생성 (isSubstitute: true)
   - 나머지 WAITING 후보 전부 DECLINED 처리
   - 매장 일별 스케줄 API에서 즉시 반영됨
```

#### 대타 거절

```
POST /substitute/candidates/{candidateId}/decline
→ 내 candidateId만 DECLINED. 다른 후보는 영향 없음.
```

#### 대타 가능 시간 등록 (STAFF 본인)

```
POST /substitute/availability
Body: { storeId, dayOfWeek, startTime, endTime }
→ 고정 스케줄 또는 기존 가능 시간과 겹치면 409
→ 이 데이터가 AI 후보 조회의 기반이 됨
```

#### 대타 가능 시간 삭제

```
DELETE /substitute/availability/{availabilityId}
```

#### 대타 가능 시간 그리드 조회 (그리드 UI용)

```
GET /substitute/availability/grid?storeId={storeId}
응답: 전 직원의 고정 스케줄 + 대타 가능 시간 통합 뷰
```

---

### 6. 채팅

채팅은 **HTTP API + WebSocket(STOMP)** 혼합 구조다.

- 채팅방 목록, 메시지 조회, 읽음 처리: HTTP REST
- 메시지 전송 및 수신: WebSocket STOMP

채팅방은 **자동 생성**된다. 직접 생성 API 없음.

- 가게 생성 시 → 단체(GROUP) 채팅방 자동 생성
- 직원 합류 시 → 기존 멤버 각각과 1:1(DIRECT) 채팅방 자동 생성

#### 채팅방 목록 조회

```
GET /chat/rooms?storeId={storeId}
응답: [{ roomId, roomType(GROUP|DIRECT), name, lastMessage, unreadCount }]
```

#### 메시지 조회 (커서 기반 페이징)

```
GET /chat/rooms/{roomId}/messages?size=30
→ 최초 진입: cursor 없이 요청 → 최신 30개
→ 이전 메시지 로드: 가장 오래된 messageId를 cursor로 전달
GET /chat/rooms/{roomId}/messages?cursor={oldestMessageId}&size=30
응답: [{ messageId, content, senderName, storeMemberId, isMine, createdAt }]
isMine: -1L로 브로드캐스트됨. 클라이언트에서 본인 storeMemberId와 비교해서 판단.
```

#### 읽음 처리

```
POST /chat/rooms/{roomId}/read
Body: { lastMessageId }
→ 채팅방 진입 시 또는 메시지 수신 시 호출. unreadCount 초기화됨.
```

#### WebSocket 연결 (메시지 전송/수신)

**라이브러리**: `@stomp/stompjs` + `react-native-url-polyfill`

```js
import { Client } from '@stomp/stompjs';

const stompClient = new Client({
  brokerURL: 'wss://workmanager.store/ws',
  connectHeaders: {
    Authorization: `Bearer ${accessToken}`,  // STOMP CONNECT 프레임에 JWT 포함
  },
  onConnect: () => {
    // 채팅방 구독
    stompClient.subscribe(`/topic/chat/${roomId}`, (message) => {
      const msg = JSON.parse(message.body);
      // msg: { messageId, content, senderName, storeMemberId, isMine(-1L), createdAt }
    });
  },
});

stompClient.activate();

// 메시지 전송
stompClient.publish({
  destination: `/app/chat/${roomId}`,
  body: JSON.stringify({ content: '메시지 내용' }),
});
```

**주의사항**:

- WebSocket URL은 ws:// 가 아닌 wss:// (TLS)
- JWT는 HTTP Authorization 헤더가 아닌 STOMP CONNECT 프레임 헤더에 포함
- `isMine` 필드는 브로드캐스트 시 항상 `-1L`로 옴. 수신된 `storeMemberId`와 내 `storeMemberId`를 비교해서 본인 메시지 여부 판단할 것.

---

### 7. TODO

매장 단위 공유 TODO. 같은 매장 멤버면 누구든 완료/삭제 가능.

#### TODO 추가

```
POST /todos
Body: { storeId, content }
응답: { todoId, content, isDone, createdAt }
→ AI가 추출한 TODO 저장 시에도 이 API 사용 (AI API는 저장 안 함)
```

#### TODO 목록 조회

```
GET /todos?storeId={storeId}
응답: [{ todoId, content, isDone, creatorName, createdAt }]
→ 최신순 정렬
```

#### TODO 완료 토글

```
PATCH /todos/{todoId}/done
응답: { todoId, content, isDone, ... }
→ true → false → true 반복 가능 (idempotent)
```

#### TODO 삭제

```
DELETE /todos/{todoId}
```

---

### 8. AI

#### 채팅 → TODO 추출

```
POST /ai/todos/extract
Body: { roomId }
응답: { suggestions: ["할 일 1", "할 일 2", ...] }
→ 채팅방 최근 50개 메시지를 GPT(gpt-4o-mini)가 분석해 TODO 후보 반환
→ 서버에 저장되지 않음. 사용자가 선택 후 POST /todos로 각각 저장해야 함.
```

**권장 UX**: suggestions 목록을 체크박스로 표시 → 선택한 항목만 POST /todos 순차 호출

---

## 역할별 접근 제한

| 기능 | OWNER | STAFF |
| --- | --- | --- |
| 가게 등록 | O | X |
| 가게 합류 | X | O |
| 고정 스케줄 CRUD | O | X |
| 고정 스케줄 조회 | O | O |
| 대타 요청/수락 | X | O |
| 채팅 | O | O |
| TODO | O | O |
| AI TODO 추출 | O | O |

---

## 시간 형식

| 필드 | 형식 | 예시 |
| --- | --- | --- |
| date | yyyy-MM-dd | 2026-06-10 |
| time | HH:mm:ss | 09:00:00 |
| dayOfWeek | 영문 대문자 | MONDAY |
| datetime | ISO 8601 | 2026-06-10T09:00:00 |

---

## 자주 쓰는 ID 정리

| 변수명 | 의미 | 획득 방법 |
| --- | --- | --- |
| `storeId` | 가게 ID | GET /stores/me |
| `storeMemberId` | 해당 가게에서의 나 | GET /stores/me 응답 내 staffList |
| `roomId` | 채팅방 ID | GET /chat/rooms |
| `candidateId` | 대타 후보 ID | GET /substitute/requests/incoming |