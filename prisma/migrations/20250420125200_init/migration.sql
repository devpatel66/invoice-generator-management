-- CreateTable
CREATE TABLE "Order" (
    "order_id" SERIAL NOT NULL,
    "razorpay_order_id" TEXT NOT NULL,
    "receipt" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "amount_due" INTEGER NOT NULL,
    "amount_paid" INTEGER NOT NULL,
    "attempts" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("order_id")
);
