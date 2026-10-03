"""Backend API tests for Hearth tenant + Stripe flows."""
import os
import time
import random
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://2e487701-473c-4d87-bae1-502ee19d067f.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"


@pytest.fixture(scope="module")
def s():
    sess = requests.Session()
    sess.headers.update({"Content-Type": "application/json"})
    return sess


# ---- Health ----
def test_root(s):
    r = s.get(f"{API}/")
    assert r.status_code == 200
    assert r.json().get("status") == "ok"


# ---- Tenants list / get ----
def test_list_tenants_has_seeds(s):
    r = s.get(f"{API}/tenants")
    assert r.status_code == 200
    slugs = {t["slug"] for t in r.json()["tenants"]}
    for seed in ("adriana", "miller", "lofi-nest"):
        assert seed in slugs, f"missing seed {seed}"


def test_get_adriana_no_pin_hash(s):
    r = s.get(f"{API}/tenants/adriana")
    assert r.status_code == 200
    data = r.json()
    assert data["hasPinSet"] is True
    assert "familyPinHash" not in data["tenant"]
    assert data["tenant"]["slug"] == "adriana"


# ---- Verify PIN ----
def test_verify_pin_success(s):
    r = s.post(f"{API}/tenants/adriana/verify-pin", json={"pin": "1984"})
    assert r.status_code == 200
    assert r.json()["success"] is True


def test_verify_pin_wrong(s):
    r = s.post(f"{API}/tenants/adriana/verify-pin", json={"pin": "0000"})
    assert r.status_code == 401


# ---- Create tenant ----
UNIQUE_SLUG = f"testspace-{int(time.time())}-{random.randint(100,999)}"


def test_create_tenant_unique(s):
    r = s.post(f"{API}/tenants", json={
        "slug": UNIQUE_SLUG,
        "sanctuaryName": "Pytest Space",
        "familyPin": "4321",
        "activeTheme": "sage_garden",
        "modulesEnabled": ["recipes"],
        "ownerEmail": "pytest@t.com",
        "planType": "yearly",
    })
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["success"] is True
    assert body["tenant"]["slug"] == UNIQUE_SLUG
    assert "adminSetupUrl" in body
    # Verify persistence
    g = s.get(f"{API}/tenants/{UNIQUE_SLUG}")
    assert g.status_code == 200
    assert g.json()["tenant"]["sanctuaryName"] == "Pytest Space"


def test_create_duplicate_409(s):
    r = s.post(f"{API}/tenants", json={
        "slug": UNIQUE_SLUG, "sanctuaryName": "dup"
    })
    assert r.status_code == 409


# ---- Update tenant ----
def test_update_tenant(s):
    # Ensure link-circle-1 exists; create if missing
    g = s.get(f"{API}/tenants/link-circle-1")
    if g.status_code == 404:
        s.post(f"{API}/tenants", json={"slug": "link-circle-1", "sanctuaryName": "LC1"})
    r = s.put(f"{API}/tenants/link-circle-1", json={
        "sanctuaryName": "Link Circle Updated",
        "activeTheme": "lofi_dark",
    })
    assert r.status_code == 200, r.text
    g = s.get(f"{API}/tenants/link-circle-1")
    assert g.json()["tenant"]["sanctuaryName"] == "Link Circle Updated"
    assert g.json()["tenant"]["activeTheme"] == "lofi_dark"


# ---- Stripe checkout ----
def test_create_checkout_yearly(s):
    r = s.post(f"{API}/payments/checkout", json={
        "planType": "yearly",
        "origin_url": BASE_URL,
        "metadata": {
            "slug": f"stripetest-{int(time.time())}",
            "sanctuaryName": "Stripe Test",
            "familyPin": "4321",
            "activeTheme": "sage_garden",
            "modulesEnabled": '["recipes"]',
            "ownerEmail": "t@t.com",
        },
    })
    assert r.status_code == 200, r.text
    data = r.json()
    assert "checkout_url" in data and data["checkout_url"].startswith("https://")
    assert "stripe.com" in data["checkout_url"] or "checkout.stripe" in data["checkout_url"]
    assert "session_id" in data
    # status should be pending before payment
    st = s.get(f"{API}/payments/status/{data['session_id']}")
    assert st.status_code == 200
    assert st.json()["payment_status"] == "pending"
