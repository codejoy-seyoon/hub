# BNI Korea Hub

`hub-bnikorea.com` 한 도메인 아래에서 여러 섹션을 통합 운영하는 모노레포입니다.

## 구조

```
hub/
├── index.html      # 허브 랜딩(메인) 페이지
├── store/          # /store  — 온라인 스토어
├── training/       # /training — 교육 프로그램
└── ebook/          # /ebook  — 전자책 뷰어
```

각 섹션은 정적(static) 사이트로, 도메인 경로에 그대로 매핑됩니다.

| 경로 | 폴더 |
|------|------|
| hub-bnikorea.com/ | `index.html` |
| hub-bnikorea.com/store | `store/` |
| hub-bnikorea.com/training | `training/` |
| hub-bnikorea.com/ebook | `ebook/` |

## 출처 (통합 이력)

이 저장소는 아래 3개 저장소의 파일을 복사해 새로 시작했습니다 (커밋 이력 미보존).

- store ← `seyoonbyun/louisvuitton`
- training ← `seyoonbyun/training`
- ebook ← `seyoonbyun/ebook` (ebook-personal 버전)

기존 저장소들은 archive 처리하여 백업으로 보관합니다.

## 로컬 미리보기

```bash
python -m http.server 8000
# http://localhost:8000
```
