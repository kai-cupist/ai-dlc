# 요구사항 명확화 질문

제공된 요구사항 문서를 분석한 결과, 아래 사항들에 대한 추가 확인이 필요합니다.
각 질문의 `[Answer]:` 태그 뒤에 선택한 알파벳을 입력해 주세요.
선택지 중 맞는 것이 없으면 마지막 옵션(Other)을 선택하고 설명을 추가해 주세요.

## Question 1
백엔드 기술 스택으로 어떤 언어/프레임워크를 사용할 예정인가요?

A) Java + Spring Boot
B) Node.js + Express/NestJS
C) Python + FastAPI/Django
D) Go + Gin/Echo
E) Other (please describe after [Answer]: tag below)

[Answer]: 

## Question 2
프론트엔드 기술 스택으로 어떤 프레임워크를 사용할 예정인가요?

A) React (Create React App / Vite)
B) Next.js (React 기반 풀스택)
C) Vue.js
D) Angular
E) Other (please describe after [Answer]: tag below)

[Answer]: 

## Question 3
데이터베이스로 어떤 것을 사용할 예정인가요?

A) PostgreSQL
B) MySQL / MariaDB
C) SQLite (개발/프로토타입용)
D) MongoDB (NoSQL)
E) Other (please describe after [Answer]: tag below)

[Answer]: 

## Question 4
배포 환경은 어떻게 계획하고 있나요?

A) AWS (EC2, ECS, Lambda 등)
B) 로컬 서버 / 온프레미스
C) Docker 컨테이너 (배포 환경 미정, 컨테이너화만 우선)
D) 배포는 나중에 고려 (로컬 개발 환경 우선)
E) Other (please describe after [Answer]: tag below)

[Answer]: 

## Question 5
매장 규모 및 동시 사용자 수를 어느 정도로 예상하나요?

A) 소규모 - 단일 매장, 테이블 10개 이하
B) 중규모 - 단일 매장, 테이블 10~50개
C) 대규모 - 다중 매장 지원, 매장당 테이블 50개 이상
D) MVP는 단일 매장 소규모로 시작하고 추후 확장 고려
E) Other (please describe after [Answer]: tag below)

[Answer]: 

## Question 6
API 설계 방식은 어떤 것을 선호하나요?

A) REST API
B) GraphQL
C) REST API + WebSocket (실시간 기능용)
D) REST API + SSE (요구사항에 명시된 대로)
E) Other (please describe after [Answer]: tag below)

[Answer]: 

## Question 7
메뉴 이미지 관리는 어떻게 할 예정인가요?

A) 외부 이미지 URL 직접 입력 (별도 저장소 사용 안 함)
B) 로컬 파일 시스템에 업로드
C) AWS S3 등 클라우드 스토리지에 업로드
D) MVP에서는 이미지 URL 직접 입력, 추후 업로드 기능 추가
E) Other (please describe after [Answer]: tag below)

[Answer]: 

## Question 8
고객용 인터페이스와 관리자용 인터페이스를 어떻게 구성할 예정인가요?

A) 하나의 프론트엔드 앱에서 경로(route)로 분리
B) 완전히 별도의 프론트엔드 앱 2개로 분리
C) 고객용은 모바일 웹 최적화, 관리자용은 데스크톱 웹으로 별도 구성
D) Other (please describe after [Answer]: tag below)

[Answer]: 

## Question 9
테스트 전략은 어떻게 가져갈 예정인가요?

A) 단위 테스트 중심 (백엔드 비즈니스 로직)
B) 단위 테스트 + API 통합 테스트
C) 단위 테스트 + 통합 테스트 + E2E 테스트 (Cypress/Playwright 등)
D) MVP에서는 테스트 최소화, 핵심 로직만 단위 테스트
E) Other (please describe after [Answer]: tag below)

[Answer]: 

## Question 10: Security Extension
이 프로젝트에 보안 확장 규칙을 적용할까요?

A) 예 — 모든 SECURITY 규칙을 차단 제약으로 적용 (프로덕션급 애플리케이션에 권장)
B) 아니오 — 모든 SECURITY 규칙 건너뛰기 (PoC, 프로토타입, 실험적 프로젝트에 적합)
C) Other (please describe after [Answer]: tag below)

[Answer]: 
