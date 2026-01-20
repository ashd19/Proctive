import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Receipt,
  Plus,
  Loader,
  Clock,
  CheckCircle,
  DollarSign,
} from "lucide-react";
import toast from "react-hot-toast";
import { useServices } from "../../services/useServices";
import { useWalletStore } from "../../store/walletStore";
import {
  InsuranceClaim,
  ClaimStatus,
  InsuranceClaimsService,
} from "../../services/insuranceClaimsService";
import { MedicalRecord } from "../../services/patientRecordsService";

export default function PatientClaims() {
  const { services, loading: servicesLoading } = useServices();
  const { address } = useWalletStore();

  const [claims, setClaims] = useState<InsuranceClaim[]>([]);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Helper to trigger MetaMask connect prompt
  const connectWallet = async () => {
    if ((window as any).ethereum) {
      try {
        await (window as any).ethereum.request({
          method: "eth_requestAccounts",
        });
        // small refresh to let app re-read connected account
        window.location.reload();
      } catch (err: any) {
        toast.error(err?.message || "Connection request rejected");
      }
    } else {
      toast.error("MetaMask not found");
    }
  };

  useEffect(() => {
    async function loadData() {
      if (!services.insuranceClaims || !services.patientRecords || !address) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [patientClaims, patientRecords] = await Promise.all([
          services.insuranceClaims.getPatientClaims(address),
          services.patientRecords.getPatientRecords(address),
        ]);

        setClaims(patientClaims.sort((a, b) => b.submittedAt - a.submittedAt));
        setRecords(patientRecords);
      } catch (error: any) {
        console.error("Error loading claims:", error);
        toast.error(error.message || "Failed to load claims");
      } finally {
        setLoading(false);
      }
    }

    if (!servicesLoading) {
      loadData();
    }
  }, [
    services.insuranceClaims,
    services.patientRecords,
    address,
    servicesLoading,
  ]);

  if (servicesLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  const pendingClaims = claims.filter(
    (c) =>
      c.status === ClaimStatus.PENDING || c.status === ClaimStatus.UNDER_REVIEW,
  );
  const approvedClaims = claims.filter(
    (c) => c.status === ClaimStatus.APPROVED || c.status === ClaimStatus.PAID,
  );
  const totalApproved = approvedClaims.reduce(
    (sum, c) => sum + Number(c.approvedAmount),
    0,
  );

  return (
    <div className="p-8">
      {/* Show connect helper when wallet not connected */}
      {!address && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded flex items-center justify-between">
          <div className="text-sm text-slate-700">
            Wallet not connected. Click Connect to choose an account & network
            (Localhost:8545).
          </div>
          <div>
            <button onClick={connectWallet} className="btn-primary">
              Connect Wallet
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Insurance Claims
            </h1>
            <p className="text-slate-600">
              Submit and track your insurance claims
            </p>
          </div>
          <button
            onClick={() => setShowSubmitModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Submit Claim
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Receipt className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-slate-900">Total Claims</h3>
            </div>
            <p className="text-3xl font-bold text-slate-900">{claims.length}</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-amber-100 p-2 rounded-lg">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className="font-semibold text-slate-900">Pending</h3>
            </div>
            <p className="text-3xl font-bold text-slate-900">
              {pendingClaims.length}
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-green-100 p-2 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="font-semibold text-slate-900">Approved</h3>
            </div>
            <p className="text-3xl font-bold text-slate-900">
              {approvedClaims.length}
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-emerald-100 p-2 rounded-lg">
                <DollarSign className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-slate-900">Total Approved</h3>
            </div>
            <p className="text-3xl font-bold text-slate-900">
              ${(totalApproved / 1e18).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Claims List */}
        {claims.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-slate-200">
            <Receipt className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              No claims submitted yet
            </h3>
            <p className="text-slate-600 mb-6">
              Submit your first insurance claim to get started
            </p>
            <button
              onClick={() => setShowSubmitModal(true)}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Submit Claim
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {claims.map((claim) => (
              <motion.div
                key={claim.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-slate-900">
                        Claim #{claim.id}
                      </h3>
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full ${InsuranceClaimsService.getClaimStatusColor(
                          claim.status,
                        )}`}
                      >
                        {InsuranceClaimsService.getClaimStatusName(
                          claim.status,
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      <span>
                        Submitted{" "}
                        {new Date(
                          claim.submittedAt * 1000,
                        ).toLocaleDateString()}
                      </span>
                      <span>•</span>
                      <span>{claim.hospitalName}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-slate-900">
                      ${(Number(claim.claimAmount) / 1e18).toFixed(2)}
                    </div>
                    {claim.status === ClaimStatus.APPROVED && (
                      <div className="text-sm text-green-600 font-medium">
                        Approved: $
                        {(Number(claim.approvedAmount) / 1e18).toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <span className="text-sm font-semibold text-slate-700">
                      Diagnosis:{" "}
                    </span>
                    <span className="text-sm text-slate-900">
                      {claim.diagnosis}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-slate-700">
                      Treatment:{" "}
                    </span>
                    <span className="text-sm text-slate-900">
                      {claim.treatment}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-slate-700">
                      Service Date:{" "}
                    </span>
                    <span className="text-sm text-slate-900">
                      {new Date(
                        claim.dateOfService * 1000,
                      ).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-slate-700">
                      Linked Records:{" "}
                    </span>
                    <span className="text-sm text-slate-900">
                      {claim.recordIds.length}
                    </span>
                  </div>
                </div>

                {claim.notes && (
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm font-semibold text-slate-700">
                      Notes:{" "}
                    </span>
                    <span className="text-sm text-slate-900">
                      {claim.notes}
                    </span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Submit Claim Modal */}
      <SubmitClaimModal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        onSuccess={() => {
          setShowSubmitModal(false);
          if (services.insuranceClaims && address) {
            services.insuranceClaims.getPatientClaims(address).then(setClaims);
          }
        }}
        services={services}
        records={records}
        userAddress={address || ""}
      />
    </div>
  );
}

function SubmitClaimModal({
  isOpen,
  onClose,
  onSuccess,
  services,
  records,
  userAddress,
}: any) {
  const [submitting, setSubmitting] = useState(false);
  const [insuranceProviders, setInsuranceProviders] = useState<
    { address: string; name: string }[]
  >([]);
  const [formData, setFormData] = useState({
    insuranceProvider: "",
    policyNumber: "",
    claimType: "0",
    claimAmount: "",
    diagnosis: "",
    treatment: "",
    hospitalName: "",
    dateOfService: "",
    selectedRecords: [] as number[],
  });
  const [modalRecords, setModalRecords] = useState<MedicalRecord[]>(
    records || [],
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    async function loadInsuranceProviders() {
      if (!services.vitalChainCore) return;
      try {
        const count = Number(await services.vitalChainCore.getInsuranceCount());
        const providers: { address: string; name: string }[] = [];
        for (let i = 0; i < count; i++) {
          const addr = await services.vitalChainCore.insuranceAddresses(i);
          const info = await services.vitalChainCore.insuranceProviders(addr);
          if (info.isActive) {
            providers.push({ address: addr, name: info.name });
          }
        }
        setInsuranceProviders(providers);
      } catch (err: any) {
        console.error("Failed to load insurance providers", err);
        toast.error(err?.message || "Could not load insurance providers");
      }
    }

    loadInsuranceProviders();
  }, [services.vitalChainCore]);

  useEffect(() => {
    setModalRecords(records || []);
  }, [records]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setSelectedFile(f);
  };
  // Local-only upload: create a temporary local record (no IPFS) and link it
  const handleLocalFileUpload = async () => {
    const f = selectedFile;
    if (!f) {
      toast.error("Please choose a file to upload from your device");
      return;
    }

    try {
      setUploading(true);

      const tempId = Date.now();
      const newRecord: MedicalRecord = {
        id: tempId,
        patient: userAddress || "",
        createdBy: userAddress || "",
        recordType: 0,
        ipfsHash: "",
        encryptedKey: "",
        metadataHash: "",
        createdAt: Math.floor(Date.now() / 1000),
        updatedAt: Math.floor(Date.now() / 1000),
        isActive: true,
        metadata: {
          title: f.name,
          description: `Local upload: ${f.name}`,
          recordType: "File",
          hospitalName: "",
          doctorName: "",
          tags: [],
        },
      };

      (newRecord as any).file = f;
      (newRecord as any).fileUrl = URL.createObjectURL(f);

      setModalRecords((prev) => [newRecord, ...prev]);
      setFormData((fd) => ({
        ...fd,
        selectedRecords: [...fd.selectedRecords, newRecord.id],
      }));

      toast.success(`Added local file: ${f.name} and linked to claim`);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err: any) {
      console.error("Local upload failed:", err);
      toast.error(err?.message || "Failed to add local file");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!services.insuranceClaims) {
      toast.error("Services not initialized");
      return;
    }

    if (!formData.insuranceProvider) {
      toast.error("Please select an insurance provider");
      return;
    }

    if (formData.selectedRecords.length === 0) {
      toast.error("Please link at least one medical record");
      return;
    }

    try {
      setSubmitting(true);
      toast.loading("Submitting claim to blockchain...");

      const claimAmountWei = (
        parseFloat(formData.claimAmount) * 1e18
      ).toString();
      const dateOfService = Math.floor(
        new Date(formData.dateOfService).getTime() / 1000,
      );

      // First create the claim
      const claimId = await services.insuranceClaims.createClaim(
        formData.policyNumber || "POL-DEFAULT",
        parseInt(formData.claimType),
        claimAmountWei,
        formData.selectedRecords,
        formData.hospitalName,
        formData.diagnosis,
        formData.treatment,
        dateOfService,
      );

      // Then submit it
      await services.insuranceClaims.submitClaimById(claimId);

      toast.dismiss();
      toast.success("✓ Claim submitted successfully! Claim ID: " + claimId);
      onSuccess();

      // Reset form
      setFormData({
        insuranceProvider: "",
        policyNumber: "",
        claimType: "0",
        claimAmount: "",
        diagnosis: "",
        treatment: "",
        hospitalName: "",
        dateOfService: "",
        selectedRecords: [],
      });
    } catch (error: any) {
      toast.dismiss();
      console.error("Submit error:", error);
      toast.error(error.message || "Failed to submit claim");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
      >
        <h2 className="text-2xl font-bold text-slate-900 mb-6">
          Submit Insurance Claim
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Insurance Provider *
            </label>
            <select
              value={formData.insuranceProvider}
              onChange={(e) =>
                setFormData({ ...formData, insuranceProvider: e.target.value })
              }
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              required
            >
              <option value="">Select Insurance Provider</option>
              {insuranceProviders.map((provider) => (
                <option key={provider.address} value={provider.address}>
                  {provider.name ||
                    `${provider.address.slice(0, 6)}...${provider.address.slice(
                      -4,
                    )}`}{" "}
                  ({provider.address.slice(0, 6)}...{provider.address.slice(-4)}
                  )
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Policy Number (Optional)
              </label>
              <input
                type="text"
                value={formData.policyNumber}
                onChange={(e) =>
                  setFormData({ ...formData, policyNumber: e.target.value })
                }
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="POL-123456"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Claim Type *
              </label>
              <select
                value={formData.claimType}
                onChange={(e) =>
                  setFormData({ ...formData, claimType: e.target.value })
                }
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                required
              >
                <option value="0">Hospitalization</option>
                <option value="1">Outpatient</option>
                <option value="2">Surgery</option>
                <option value="3">Medication</option>
                <option value="4">Diagnostic</option>
                <option value="5">Maternity</option>
                <option value="6">Dental</option>
                <option value="7">Vision</option>
                <option value="8">Mental Health</option>
                <option value="9">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Claim Amount ($) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.claimAmount}
                onChange={(e) =>
                  setFormData({ ...formData, claimAmount: e.target.value })
                }
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="1000.00"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Date of Service *
              </label>
              <input
                type="date"
                value={formData.dateOfService}
                max={new Date().toISOString().split("T")[0]}
                onChange={(e) =>
                  setFormData({ ...formData, dateOfService: e.target.value })
                }
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Hospital Name *
            </label>
            <input
              type="text"
              value={formData.hospitalName}
              onChange={(e) =>
                setFormData({ ...formData, hospitalName: e.target.value })
              }
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="City General Hospital"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Diagnosis *
            </label>
            <textarea
              value={formData.diagnosis}
              onChange={(e) =>
                setFormData({ ...formData, diagnosis: e.target.value })
              }
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="Describe the diagnosis..."
              rows={2}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Treatment Description *
            </label>
            <textarea
              value={formData.treatment}
              onChange={(e) =>
                setFormData({ ...formData, treatment: e.target.value })
              }
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="Describe the treatment received..."
              rows={2}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Link Medical Records * ({formData.selectedRecords.length}{" "}
              selected)
            </label>

            {/* Simple local file upload (adds a temporary local record and links it) */}
            <div className="flex items-center gap-2 mb-3">
              <input
                ref={fileInputRef}
                type="file"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="text-sm"
              />
              <button
                type="button"
                onClick={() => handleLocalFileUpload?.()}
                disabled={uploading}
                className="btn-secondary"
              >
                {uploading ? "Uploading..." : "Upload & Link"}
              </button>
            </div>

            {modalRecords.length === 0 ? (
              <div className="border border-slate-300 rounded-lg p-4 text-center text-slate-600 space-y-3">
                <p>No medical records available yet.</p>
                <p className="text-sm text-slate-500">
                  Use the upload control above to add a file from your device
                  and link it to this claim.
                </p>
              </div>
            ) : (
              <div className="max-h-40 overflow-y-auto border border-slate-300 rounded-lg p-2">
                {modalRecords.map((record: MedicalRecord) => (
                  <label
                    key={record.id}
                    className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.selectedRecords.includes(record.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            selectedRecords: [
                              ...formData.selectedRecords,
                              record.id,
                            ],
                          });
                        } else {
                          setFormData({
                            ...formData,
                            selectedRecords: formData.selectedRecords.filter(
                              (id) => id !== record.id,
                            ),
                          });
                        }
                      }}
                      className="rounded"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium">
                        {record.metadata.title}
                      </div>
                      {(record as any).fileUrl && (
                        <a
                          href={(record as any).fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-slate-500"
                        >
                          Preview file
                        </a>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 btn-primary flex items-center justify-center gap-2"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Receipt className="w-5 h-5" />
                  Submit Claim
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
