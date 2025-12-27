# Roadmap Dashboard

로드맵 관리 대시보드 애플리케이션

## 기술 스택

- FastAPI
- SQLAlchemy
- SQLite
- Jinja2 Templates
- PyWebView (데스크탑 앱)

## 설치

```bash
pip install -r requirements.txt
```

## 실행 방법

### 웹 서버로 실행

```bash
uvicorn app.main:app --reload
```

서버가 실행되면 http://localhost:8000 에서 접속할 수 있습니다.

### 데스크탑 앱으로 실행 (개발 모드)

```bash
python desktop.py
```

## 데스크탑 앱 빌드

Python 없이 실행 가능한 독립 실행 파일을 생성합니다.

### macOS

```bash
# 의존성 설치
pip install -r requirements.txt

# 앱 빌드
pyinstaller desktop.spec

# 결과물: dist/Roadmap Dashboard.app
# 실행: 더블클릭 또는
open dist/Roadmap\ Dashboard.app
```

### Windows

```powershell
# 의존성 설치
pip install -r requirements.txt

# 앱 빌드
pyinstaller desktop.spec

# 결과물: dist\Roadmap Dashboard\Roadmap Dashboard.exe
# 실행: 더블클릭 또는
dist\Roadmap Dashboard\Roadmap Dashboard.exe
```

### 빌드 참고사항

- macOS용 앱은 macOS에서, Windows용 앱은 Windows에서 빌드해야 합니다
- 가상환경을 사용하면 앱 크기를 줄일 수 있습니다
- 빌드 결과물은 `dist/` 폴더에 생성됩니다
