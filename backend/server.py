import os
import json
import time
from datetime import datetime, timezone
from typing import Optional, List

import bcrypt
import stripe
from dotenv import load_dotenv
from fastapi import FastAPI, APIRouter, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from pymongo import MongoClient

load_dotenv()

# ----------------- DB ----------------- #
mongo = MongoClient(os.environ["MONGO_URL"])
db = mongo[os.environ.get("DB_NAME", "hearth")]
tenants_col = db["tenants"]
payments_col = db["payment_transactions"]
tenants_col.create_index("slug", unique=True)

# ----------------- Stripe ----------------- #
stripe.api_key = os.environ.get("STRIPE_SECRET_KEY") or "sk_test_emergent"
STRIPE_WEBHOOK_SECRET = os.environ.get("STRIPE_WEBHOOK_SECRET", "")

# Hearth is a digital subscription (SaaS). In an SMP-supported country Stripe
# can manage tax end-to-end, so we default to "full" and fall back gracefully.
TAX_MODE = "full"

LOOKUP_KEYS = {"monthly": "hearth_monthly", "yearly": "hearth_yearly"}

# ----------------- Helpers ----------------- #

def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def hash_pin(pin: str) -> str:
    return bcrypt.hashpw(pin.encode(), bcrypt.gensalt()).decode()


def check_pin(pin: str, pin_hash: str) -> bool:
    try:
        return bcrypt.checkpw(pin.encode(), pin_hash.encode())
    except Exception:
        return False


def clean_slug(raw: str) -> str:
    import re
    return re.sub(r"[^a-z0-9\-_]", "-", raw.lower().strip().lstrip("@"))


def safe_tenant(doc: dict) -> dict:
    return {
        "slug": doc["slug"],
        "ownerId": doc.get("ownerId", ""),
        "sanctuaryName": doc.get("sanctuaryName", ""),
        "activeTheme": doc.get("activeTheme", "sanctuary_warm"),
        "modulesEnabled": doc.get("modulesEnabled", []),
        "outboundLinks": doc.get("outboundLinks", {}),
        "subscriptionStatus": doc.get("subscriptionStatus", "active"),
        "planType": doc.get("planType", "yearly"),
        "ownerEmail": doc.get("ownerEmail", ""),
        "createdAt": doc.get("createdAt", ""),
    }


def provision_tenant(data: dict) -> dict:
    slug = clean_slug(data.get("slug", ""))
    if not slug:
        raise ValueError("slug required")
    existing = tenants_col.find_one({"slug": slug})
    if existing:
        return existing

    pin = str(data.get("familyPin") or "1984")
    pin = pin if len(pin) == 4 and pin.isdigit() else "1984"

    modules = data.get("modulesEnabled")
    if isinstance(modules, str):
        try:
            modules = json.loads(modules)
        except Exception:
            modules = []
    if not isinstance(modules, list) or not modules:
        modules = ["scripture", "recipes", "albums", "music", "planner", "thoughts"]

    doc = {
        "slug": slug,
        "ownerId": f"owner-{int(time.time()*1000)}",
        "sanctuaryName": (data.get("sanctuaryName") or f"{slug.capitalize()}'s Sanctuary").strip(),
        "familyPinHash": hash_pin(pin),
        "activeTheme": data.get("activeTheme") or "sanctuary_warm",
        "modulesEnabled": modules,
        "outboundLinks": data.get("outboundLinks") or {},
        "subscriptionStatus": "active",
        "planType": "monthly" if data.get("planType") == "monthly" else "yearly",
        "ownerEmail": data.get("ownerEmail") or "",
        "createdAt": now_iso(),
    }
    tenants_col.insert_one(doc)
    return doc


def seed_tenants():
    seeds = [
        {"slug": "adriana", "sanctuaryName": "Adriana's Home", "familyPin": "1984",
         "activeTheme": "sanctuary_warm",
         "modulesEnabled": ["scripture", "recipes", "albums", "music", "planner", "thoughts"],
         "outboundLinks": {"googlePhotosUrl": "https://photos.app.goo.gl/adriana-family-cookouts"},
         "ownerEmail": "adriana@familyhearth.me", "planType": "yearly"},
        {"slug": "miller", "sanctuaryName": "The Miller Family Sanctuary", "familyPin": "2024",
         "activeTheme": "sage_garden", "modulesEnabled": ["recipes", "albums", "music", "planner"],
         "outboundLinks": {}, "ownerEmail": "miller.family@gmail.com", "planType": "monthly"},
        {"slug": "lofi-nest", "sanctuaryName": "The Lo-Fi Hearth", "familyPin": "1234",
         "activeTheme": "lofi_dark", "modulesEnabled": ["music", "thoughts", "albums"],
         "outboundLinks": {}, "ownerEmail": "nest@lofi.dev", "planType": "yearly"},
    ]
    for s in seeds:
        if not tenants_col.find_one({"slug": s["slug"]}):
            provision_tenant(s)


seed_tenants()

# ----------------- App ----------------- #
app = FastAPI(title="Hearth API")
api = APIRouter(prefix="/api")

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=".*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@api.get("/")
def root():
    return {"status": "ok", "service": "hearth"}


# ---------- Tenant routes ---------- #

@api.get("/tenants")
def list_tenants():
    items = []
    for t in tenants_col.find():
        items.append({
            "slug": t["slug"],
            "sanctuaryName": t.get("sanctuaryName", ""),
            "activeTheme": t.get("activeTheme", "sanctuary_warm"),
            "modulesCount": len(t.get("modulesEnabled", [])),
            "planType": t.get("planType", "yearly"),
            "subscriptionStatus": t.get("subscriptionStatus", "active"),
            "createdAt": t.get("createdAt", ""),
        })
    return {"tenants": items}


@api.get("/tenants/{slug}")
def get_tenant(slug: str):
    t = tenants_col.find_one({"slug": clean_slug(slug)})
    if not t:
        raise HTTPException(404, f"Sanctuary '@{clean_slug(slug)}' not found")
    return {"tenant": safe_tenant(t), "hasPinSet": bool(t.get("familyPinHash"))}


class PinBody(BaseModel):
    pin: str


@api.post("/tenants/{slug}/verify-pin")
def verify_pin(slug: str, body: PinBody):
    t = tenants_col.find_one({"slug": clean_slug(slug)})
    if not t:
        raise HTTPException(404, "Sanctuary not found")
    if check_pin(body.pin, t.get("familyPinHash", "")):
        return {"success": True, "message": "Welcome to the sanctuary"}
    raise HTTPException(401, "Incorrect 4-digit PIN")


class CreateTenantBody(BaseModel):
    slug: str
    sanctuaryName: str
    familyPin: Optional[str] = "1984"
    activeTheme: Optional[str] = "sanctuary_warm"
    modulesEnabled: Optional[List[str]] = None
    outboundLinks: Optional[dict] = None
    planType: Optional[str] = "yearly"
    ownerEmail: Optional[str] = ""


@api.post("/tenants")
def create_tenant(body: CreateTenantBody):
    slug = clean_slug(body.slug)
    if not slug or not body.sanctuaryName:
        raise HTTPException(400, "Slug and Sanctuary Name are required")
    if tenants_col.find_one({"slug": slug}):
        raise HTTPException(409, f"Slug '@{slug}' is already taken. Please choose another.")
    doc = provision_tenant(body.model_dump())
    return {
        "success": True,
        "tenant": safe_tenant(doc),
        "adminSetupUrl": f"/@{slug}?role=owner&ownerKey={doc['ownerId']}",
        "message": f"Sanctuary @{slug} successfully provisioned!",
    }


class UpdateTenantBody(BaseModel):
    sanctuaryName: Optional[str] = None
    familyPin: Optional[str] = None
    activeTheme: Optional[str] = None
    modulesEnabled: Optional[List[str]] = None
    outboundLinks: Optional[dict] = None


@api.put("/tenants/{slug}")
def update_tenant(slug: str, body: UpdateTenantBody):
    slug = clean_slug(slug)
    t = tenants_col.find_one({"slug": slug})
    if not t:
        raise HTTPException(404, "Sanctuary not found")
    updates = {}
    if body.sanctuaryName:
        updates["sanctuaryName"] = body.sanctuaryName.strip()
    if body.activeTheme:
        updates["activeTheme"] = body.activeTheme
    if isinstance(body.modulesEnabled, list):
        updates["modulesEnabled"] = body.modulesEnabled
    if body.outboundLinks:
        updates["outboundLinks"] = {**t.get("outboundLinks", {}), **body.outboundLinks}
    if body.familyPin and len(body.familyPin) == 4 and body.familyPin.isdigit():
        updates["familyPinHash"] = hash_pin(body.familyPin)
    if updates:
        tenants_col.update_one({"slug": slug}, {"$set": updates})
    t = tenants_col.find_one({"slug": slug})
    return {"success": True, "tenant": safe_tenant(t)}


# ---------- Stripe payments ---------- #

class CheckoutRequest(BaseModel):
    planType: str = Field("yearly")
    origin_url: str
    metadata: Optional[dict] = None


@api.post("/payments/checkout")
def create_checkout(req: CheckoutRequest):
    lookup = LOOKUP_KEYS.get(req.planType, LOOKUP_KEYS["yearly"])
    prices = stripe.Price.list(lookup_keys=[lookup], active=True, limit=1).data
    if not prices:
        raise HTTPException(500, f"Price not found: {lookup}. Run setup_stripe.py.")
    price = prices[0]

    meta = {k: str(v) for k, v in (req.metadata or {}).items()}
    meta["planType"] = req.planType

    kwargs = dict(
        line_items=[{"price": price.id, "quantity": 1}],
        mode="subscription",
        success_url=f"{req.origin_url}/payment/success?session_id={{CHECKOUT_SESSION_ID}}",
        cancel_url=f"{req.origin_url}/payment/cancel",
        metadata=meta,
    )

    if TAX_MODE == "full":
        try:
            session = stripe.checkout.Session.create(**kwargs, managed_payments={"enabled": True})
        except stripe.error.InvalidRequestError as e:
            msg = (getattr(e, "user_message", "") or "").lower()
            if "managed payments" in msg or "ineligible" in msg:
                session = stripe.checkout.Session.create(
                    **kwargs, automatic_tax={"enabled": True}, billing_address_collection="required"
                )
            else:
                raise
    else:
        session = stripe.checkout.Session.create(
            **kwargs, automatic_tax={"enabled": True}, billing_address_collection="required"
        )

    payments_col.insert_one({
        "session_id": session.id,
        "lookup_key": lookup,
        "plan_type": req.planType,
        "metadata": meta,
        "amount": (price.unit_amount or 0),
        "currency": price.currency,
        "status": "initiated",
        "payment_status": "pending",
        "created_at": now_iso(),
        "updated_at": now_iso(),
    })
    return {"checkout_url": session.url, "session_id": session.id}


def _mark_paid(session_obj):
    payments_col.update_one(
        {"session_id": session_obj["id"], "payment_status": {"$ne": "paid"}},
        {"$set": {
            "status": "completed",
            "payment_status": session_obj.get("payment_status", "paid"),
            "stripe_subscription_id": session_obj.get("subscription"),
            "updated_at": now_iso(),
        }},
    )
    # Provision the sanctuary from the stored metadata (idempotent).
    rec = payments_col.find_one({"session_id": session_obj["id"]})
    meta = (rec or {}).get("metadata", {})
    if meta.get("slug"):
        try:
            provision_tenant(meta)
        except Exception as e:
            print("provision on payment failed:", e)


@api.get("/payments/status/{session_id}")
def payment_status(session_id: str):
    rec = payments_col.find_one({"session_id": session_id})
    if not rec:
        raise HTTPException(404, "Transaction not found")
    if rec.get("payment_status") != "paid":
        try:
            s = stripe.checkout.Session.retrieve(session_id)
            if s.payment_status == "paid" or s.status == "complete":
                _mark_paid(s)
                rec = payments_col.find_one({"session_id": session_id})
        except stripe.error.StripeError:
            pass
    return {
        "session_id": rec["session_id"],
        "status": rec["status"],
        "payment_status": rec["payment_status"],
        "slug": rec.get("metadata", {}).get("slug", ""),
    }


@api.post("/stripe/webhook")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig = request.headers.get("stripe-signature", "")
    try:
        event = stripe.Webhook.construct_event(payload, sig, STRIPE_WEBHOOK_SECRET)
    except Exception:
        raise HTTPException(400, "Invalid signature")
    obj, t = event["data"]["object"], event["type"]
    if t == "checkout.session.completed":
        _mark_paid(obj)
    elif t == "checkout.session.async_payment_succeeded":
        _mark_paid(obj)
    elif t in ("checkout.session.async_payment_failed", "checkout.session.expired"):
        payments_col.update_one({"session_id": obj["id"]},
            {"$set": {"status": "failed", "payment_status": "failed", "updated_at": now_iso()}})
    return {"status": "ok"}


app.include_router(api)
