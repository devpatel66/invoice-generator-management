-- CreateTable
CREATE TABLE "Bank" (
    "bank_id" SERIAL NOT NULL,
    "bank_name" TEXT NOT NULL,
    "account_number" TEXT NOT NULL,
    "account_holder_name" TEXT NOT NULL,
    "bank_address" TEXT,
    "ifsc_code" TEXT NOT NULL,
    "swift_code" TEXT,
    "user_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bank_pkey" PRIMARY KEY ("bank_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Bank_account_number_key" ON "Bank"("account_number");

-- AddForeignKey
ALTER TABLE "Bank" ADD CONSTRAINT "Bank_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;
