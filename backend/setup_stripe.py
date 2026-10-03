"""Idempotent Stripe catalog setup for Hearth ($5/mo, $40/yr subscription)."""
import os
import stripe
from dotenv import load_dotenv

load_dotenv()
stripe.api_key = os.environ.get("STRIPE_SECRET_KEY") or "sk_test_emergent"

PRODUCT = {
    "emergent_product_id": "hearth_sanctuary",
    "name": "Hearth Sanctuary",
    "tax_code": "txcd_10103001",  # SaaS / digital subscription
    "prices": [
        {"lookup_key": "hearth_monthly", "amount": 500, "currency": "usd", "interval": "month"},
        {"lookup_key": "hearth_yearly", "amount": 4000, "currency": "usd", "interval": "year"},
    ],
}


def get_or_create_product(entry):
    for p in stripe.Product.list(active=True).auto_paging_iter():
        if p.to_dict().get("metadata", {}).get("emergent_product_id") == entry["emergent_product_id"]:
            return p
    return stripe.Product.create(
        name=entry["name"],
        tax_code=entry.get("tax_code"),
        metadata={"managed_by": "emergent", "emergent_product_id": entry["emergent_product_id"]},
    )


def main():
    product = get_or_create_product(PRODUCT)
    print("Product:", product.id)
    for pr in PRODUCT["prices"]:
        existing = stripe.Price.list(lookup_keys=[pr["lookup_key"]], active=True, limit=1).data
        if existing and (existing[0].unit_amount != pr["amount"] or existing[0].currency != pr["currency"]):
            stripe.Price.modify(existing[0].id, active=False)
            existing = []
        if not existing:
            stripe.Price.create(
                product=product.id,
                unit_amount=pr["amount"],
                currency=pr["currency"],
                lookup_key=pr["lookup_key"],
                transfer_lookup_key=True,
                recurring={"interval": pr["interval"]},
            )
            print("Created price:", pr["lookup_key"])
        else:
            print("Price exists:", pr["lookup_key"])
    acct = stripe.Account.retrieve()
    print("Account country:", acct.get("country"))


if __name__ == "__main__":
    main()
