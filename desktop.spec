# -*- mode: python ; coding: utf-8 -*-
"""
PyInstaller spec file for Roadmap Dashboard Desktop App

빌드 명령어:
    pyinstaller desktop.spec

결과물:
    dist/Roadmap Dashboard.app (macOS)
    dist/Roadmap Dashboard.exe (Windows)
"""

import sys
from pathlib import Path

block_cipher = None

# 프로젝트 루트 디렉토리
ROOT_DIR = Path(SPECPATH)

a = Analysis(
    ['desktop.py'],
    pathex=[str(ROOT_DIR)],
    binaries=[],
    datas=[
        # 템플릿과 정적 파일 포함
        ('templates', 'templates'),
        ('static', 'static'),
        # 데이터베이스는 앱 실행 시 사용자 디렉토리에 생성하도록 변경 권장
        # ('roadmap.db', '.'),  # 필요시 주석 해제
    ],
    hiddenimports=[
        'uvicorn.logging',
        'uvicorn.loops',
        'uvicorn.loops.auto',
        'uvicorn.protocols',
        'uvicorn.protocols.http',
        'uvicorn.protocols.http.auto',
        'uvicorn.protocols.websockets',
        'uvicorn.protocols.websockets.auto',
        'uvicorn.lifespan',
        'uvicorn.lifespan.on',
    ],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name='Roadmap Dashboard',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    console=False,  # GUI 앱이므로 콘솔 숨김
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)

coll = COLLECT(
    exe,
    a.binaries,
    a.zipfiles,
    a.datas,
    strip=False,
    upx=True,
    upx_exclude=[],
    name='Roadmap Dashboard',
)

# macOS용 .app 번들 생성
if sys.platform == 'darwin':
    app = BUNDLE(
        coll,
        name='Roadmap Dashboard.app',
        icon=None,  # 아이콘 파일이 있다면: 'icon.icns'
        bundle_identifier='com.roadmap.dashboard',
        info_plist={
            'NSHighResolutionCapable': 'True',
            'CFBundleShortVersionString': '1.0.0',
        },
    )
