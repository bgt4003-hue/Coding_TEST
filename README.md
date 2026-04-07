# EAM/CMMS 화면 프로토타입 실행 가이드 (초보자용)

`/workspace/Coding_TEST` 경로는 **제 작업 환경(서버 컨테이너) 기준**이었습니다.
사용자 PC에서는 경로가 다를 수 있으니, 아래 순서대로 진행해 주세요.

---

## 0) 먼저 폴더 위치 찾기

### 방법 A: 이미 폴더를 만든 경우
터미널에서 아래 명령으로 현재 위치를 확인합니다.

```bash
pwd
```

그리고 파일 목록에서 `index.html`이 보이는 위치로 이동하세요.

```bash
ls
cd "실제_프로젝트_폴더경로"
ls
```

> `ls` 했을 때 `index.html`, `styles.css`, `README.md` 가 보이면 맞는 폴더입니다.

### 방법 B: 폴더가 아예 없는 경우(처음부터 다시 만들기)

```bash
mkdir -p ~/Coding_TEST
cd ~/Coding_TEST
```

그 다음 저장된 `index.html`, `styles.css` 파일을 이 폴더에 넣어주세요.

---

## 1) 서버 없이 바로 여는 가장 쉬운 방법

파일 탐색기에서 `index.html`을 더블클릭하면 브라우저로 바로 열립니다.

- 장점: 제일 쉬움
- 단점: 나중에 API 연동/모듈 로딩 시 제한이 생길 수 있음

---

## 2) 권장 방법: 로컬 웹서버로 실행

프로젝트 폴더(= `index.html` 있는 폴더)에서 실행:

```bash
python3 -m http.server 5500
```

브라우저 접속:

```text
http://localhost:5500/index.html
```

서버 종료:

```text
Ctrl + C
```

---

## 3) 실행이 안 될 때 체크리스트

1. `python3`가 없는 경우
   - macOS: `python3 --version` 확인
   - Windows: `py -m http.server 5500`로 시도
2. 포트 충돌(5500 이미 사용 중)
   - `python3 -m http.server 8080`
   - 접속 주소를 `http://localhost:8080/index.html` 로 변경
3. 폴더 문제
   - 현재 위치 확인: `pwd`
   - 파일 확인: `ls`
   - `index.html` 없으면 폴더를 잘못 들어간 것

---

## 포함된 파일
- `index.html`: 대시보드 샘플 화면
- `styles.css`: 다크 테마 스타일

## 현재 화면에서 볼 수 있는 것
- 좌측 사이드바(11개 메뉴)
- 상단 헤더(공장/기간/검색/알림/사용자)
- KPI 카드 6개
- 차트 자리(placeholder) 4개
- 하단 테이블 2개(오늘 예정 작업, 긴급 작업오더)

## 다음 단계(원하면 이어서 가능)
1. 차트를 실제 데이터로 연결 (Chart.js/Recharts)
2. 테이블 정렬/필터/엑셀 다운로드 추가
3. 메뉴 클릭 시 페이지 전환(React Router)
4. 점검관리/작업오더/고장관리 상세 화면 확장
