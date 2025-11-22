import datetime

import pytest


class FakePaymentIntent:
    """Simple stand-in for stripe.PaymentIntent.retrieve result."""

    def __init__(self, status, amount, metadata):
        self.id = "pi_test"
        self.status = status
        self.amount = amount
        self.metadata = metadata


def _expected_amount(price_per_night: float, check_in: str, check_out: str) -> int:
    start = datetime.datetime.strptime(check_in, "%Y-%m-%d").date()
    end = datetime.datetime.strptime(check_out, "%Y-%m-%d").date()
    nights = (end - start).days
    return int(round(price_per_night * nights * 100))


def test_booking_succeeds_with_matching_payment_intent(
    client, register_user, create_place, monkeypatch
):
    owner = register_user()
    place = create_place(owner=owner)["place"]
    guest = register_user()

    check_in, check_out = "2030-01-01", "2030-01-03"  # 2 nights
    expected_amount = _expected_amount(place["price"], check_in, check_out)

    def fake_retrieve(payment_intent_id):
        metadata = {
            "user_id": guest["id"],
            "place_id": place["id"],
            "check_in_date": check_in,
            "check_out_date": check_out,
            "expected_amount_cents": str(expected_amount),
        }
        return FakePaymentIntent(status="succeeded", amount=expected_amount, metadata=metadata)

    monkeypatch.setattr("app.api.v1.bookings.stripe.PaymentIntent.retrieve", fake_retrieve)

    resp = client.post(
        "/api/v1/bookings/",
        headers=guest["headers"],
        json={
            "place_id": place["id"],
            "check_in_date": check_in,
            "check_out_date": check_out,
            "payment_intent_id": "pi_test",
        },
    )

    assert resp.status_code == 201, resp.get_json()
    data = resp.get_json()
    assert data["place_id"] == place["id"]
    assert data["status"] == "pending"
    assert data["total_price"] == pytest.approx(expected_amount / 100.0)


def test_booking_rejects_amount_mismatch(client, register_user, create_place, monkeypatch):
    owner = register_user()
    place = create_place(owner=owner)["place"]
    guest = register_user()

    check_in, check_out = "2030-02-10", "2030-02-12"  # 2 nights
    expected_amount = _expected_amount(place["price"], check_in, check_out)

    def fake_retrieve(payment_intent_id):
        metadata = {
            "user_id": guest["id"],
            "place_id": place["id"],
            "check_in_date": check_in,
            "check_out_date": check_out,
            "expected_amount_cents": str(expected_amount),
        }
        # Intentionally wrong amount to trigger rejection
        return FakePaymentIntent(status="succeeded", amount=expected_amount - 500, metadata=metadata)

    monkeypatch.setattr("app.api.v1.bookings.stripe.PaymentIntent.retrieve", fake_retrieve)

    resp = client.post(
        "/api/v1/bookings/",
        headers=guest["headers"],
        json={
            "place_id": place["id"],
            "check_in_date": check_in,
            "check_out_date": check_out,
            "payment_intent_id": "pi_test",
        },
    )

    assert resp.status_code == 400
    assert "amount" in resp.get_json().get("error", "").lower()
