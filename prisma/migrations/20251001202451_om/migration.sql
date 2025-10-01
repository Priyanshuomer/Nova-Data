-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "contactNumber" TEXT,
    "aadhaarVerified" BOOLEAN NOT NULL DEFAULT false,
    "aadhaarNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Doctor" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "parentName" TEXT,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "permanentAddress" TEXT,
    "currentPracticeAddress" TEXT NOT NULL,
    "contactNumber" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emergencyContact" TEXT,
    "aadhaarNumber" TEXT,
    "mbbsVerified" BOOLEAN NOT NULL DEFAULT false,
    "pgDegree" BOOLEAN NOT NULL DEFAULT false,
    "superSpecialization" BOOLEAN NOT NULL DEFAULT false,
    "internshipComplete" BOOLEAN NOT NULL DEFAULT false,
    "fellowshipCert" BOOLEAN NOT NULL DEFAULT false,
    "registrationNo" TEXT,
    "registrationType" TEXT,
    "registrationIssuedBy" TEXT,
    "registrationCouncil" TEXT,
    "registrationValidTill" TIMESTAMP(3),
    "affiliationLetterUploaded" BOOLEAN NOT NULL DEFAULT false,
    "experienceCertUploaded" BOOLEAN NOT NULL DEFAULT false,
    "practiceLicenseUploaded" BOOLEAN NOT NULL DEFAULT false,
    "languagesKnown" TEXT,
    "noPendingCases" BOOLEAN NOT NULL DEFAULT false,
    "ethicsCompliance" BOOLEAN NOT NULL DEFAULT false,
    "indemnityInsurance" BOOLEAN NOT NULL DEFAULT false,
    "policeVerification" BOOLEAN NOT NULL DEFAULT false,
    "onboardingAgreement" BOOLEAN NOT NULL DEFAULT false,
    "consentGoogleMeet" BOOLEAN NOT NULL DEFAULT false,
    "eSignEnabled" BOOLEAN NOT NULL DEFAULT false,
    "bankName" TEXT,
    "accountNumber" TEXT,
    "ifscCode" TEXT,
    "chequeVerified" BOOLEAN NOT NULL DEFAULT false,
    "gstRegistration" TEXT,
    "docsCollected" BOOLEAN NOT NULL DEFAULT false,
    "validatedNMC" BOOLEAN NOT NULL DEFAULT false,
    "backgroundCheck" BOOLEAN NOT NULL DEFAULT false,
    "committeeApproved" BOOLEAN NOT NULL DEFAULT false,
    "committeeStatus" TEXT,
    "verificationOfficer" TEXT,
    "verificationDate" TIMESTAMP(3),
    "docxUrl" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Doctor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_UserDoctors" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_UserDoctors_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "Doctor_registrationNo_idx" ON "Doctor"("registrationNo");

-- CreateIndex
CREATE INDEX "Doctor_aadhaarNumber_idx" ON "Doctor"("aadhaarNumber");

-- CreateIndex
CREATE INDEX "_UserDoctors_B_index" ON "_UserDoctors"("B");

-- AddForeignKey
ALTER TABLE "_UserDoctors" ADD CONSTRAINT "_UserDoctors_A_fkey" FOREIGN KEY ("A") REFERENCES "Doctor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserDoctors" ADD CONSTRAINT "_UserDoctors_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
