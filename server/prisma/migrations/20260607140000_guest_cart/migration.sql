-- Guest cart for anonymous browse/add-to-cart (FR-165, FR-166)

CREATE TABLE "guest_carts" (
    "id" TEXT NOT NULL,
    "session_token" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guest_carts_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "guest_carts_session_token_key" ON "guest_carts"("session_token");
CREATE INDEX "guest_carts_session_token_status_idx" ON "guest_carts"("session_token", "status");

CREATE TABLE "guest_cart_items" (
    "id" TEXT NOT NULL,
    "guest_cart_id" TEXT NOT NULL,
    "offering_code" TEXT NOT NULL,
    "schedule_ref" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unit_price" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guest_cart_items_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "guest_cart_items_guest_cart_id_idx" ON "guest_cart_items"("guest_cart_id");

ALTER TABLE "guest_cart_items" ADD CONSTRAINT "guest_cart_items_guest_cart_id_fkey"
    FOREIGN KEY ("guest_cart_id") REFERENCES "guest_carts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
