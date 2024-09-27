-- CreateTable
CREATE TABLE "Dati" (
    "id" SERIAL NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "ram_total" TEXT NOT NULL,
    "ram_free" TEXT NOT NULL,
    "ram_used" TEXT NOT NULL,
    "ram_usage" TEXT NOT NULL,
    "cpu_usage" TEXT NOT NULL,
    "disk_total" TEXT NOT NULL,
    "disk_free" TEXT NOT NULL,
    "disk_used" TEXT NOT NULL,
    "disk_usage" TEXT NOT NULL,
    "ram_stressed" BOOLEAN NOT NULL DEFAULT false,
    "cpu_stressed" BOOLEAN NOT NULL DEFAULT false,
    "disk_stressed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Dati_pkey" PRIMARY KEY ("id")
);
