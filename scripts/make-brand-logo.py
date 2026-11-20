# -*- coding: utf-8 -*-
"""Thin wrapper: the generator lives in the shared kit C:/DEV/bni-brand-logo (rule, sizes, registry).

  python scripts/make-brand-logo.py Event        -> writes public/brand/bni-event-logo.png via the kit
After running, copy the kit's regenerated BniBrandLogo.tsx to components/brand/ (this script does it for you).
"""
import os, shutil, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KIT = os.environ.get("BNI_BRAND_LOGO_KIT", "C:/DEV/bni-brand-logo")
if not os.path.exists(os.path.join(KIT, "make_logo.py")):
    sys.exit(f"logo kit not found at {KIT} - copy it from the hq Drive (…/hub-store/logo/kit/) or set BNI_BRAND_LOGO_KIT")
rc = subprocess.call([sys.executable, os.path.join(KIT, "make_logo.py"), *sys.argv[1:], "--web-dir", os.path.join(ROOT, "public", "brand")])
if rc == 0:
    shutil.copyfile(os.path.join(KIT, "BniBrandLogo.tsx"), os.path.join(ROOT, "components", "brand", "BniBrandLogo.tsx"))
    print("components/brand/BniBrandLogo.tsx synced from the kit")
sys.exit(rc)
