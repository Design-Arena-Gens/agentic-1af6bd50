import { randomUUID } from "crypto";

export type SignupStatus = "pending_approval" | "approved" | "rejected";

export type ResidentSignupRequest = {
  id: string;
  fullName: string;
  mobile: string; // 10-digit string
  state: string;
  city: string;
  community: string;
  block: string;
  flatNumber: string;
  createdAt: number;
  status: SignupStatus;
};

export type Resident = {
  id: string;
  fullName: string;
  mobile: string;
  state: string;
  city: string;
  community: string;
  block: string;
  flatNumber: string;
  createdAt: number;
};

export type OtpSession = {
  mobile: string;
  code: string;
  expiresAt: number;
};

export type DocumentItem = {
  id: string;
  ownerResidentId: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  data: Buffer; // Note: ephemeral, for demo only
  status: "queued" | "printed";
  createdAt: number;
};

class InMemoryStore {
  signupRequests: Map<string, ResidentSignupRequest> = new Map();
  residentsByMobile: Map<string, Resident> = new Map();
  otpsByMobile: Map<string, OtpSession> = new Map();
  documentsById: Map<string, DocumentItem> = new Map();

  createSignup(req: Omit<ResidentSignupRequest, "id" | "createdAt" | "status">): ResidentSignupRequest {
    const id = randomUUID();
    const record: ResidentSignupRequest = {
      id,
      ...req,
      createdAt: Date.now(),
      status: "pending_approval",
    };
    this.signupRequests.set(id, record);
    return record;
  }

  listSignupRequests(filter?: { status?: SignupStatus; community?: string }) {
    const items = Array.from(this.signupRequests.values());
    return items.filter((x) => {
      if (filter?.status && x.status !== filter.status) return false;
      if (filter?.community && x.community !== filter.community) return false;
      return true;
    });
  }

  approveSignup(id: string): Resident | null {
    const record = this.signupRequests.get(id);
    if (!record) return null;
    record.status = "approved";
    const resident: Resident = {
      id: randomUUID(),
      fullName: record.fullName,
      mobile: record.mobile,
      state: record.state,
      city: record.city,
      community: record.community,
      block: record.block,
      flatNumber: record.flatNumber,
      createdAt: Date.now(),
    };
    this.residentsByMobile.set(resident.mobile, resident);
    this.signupRequests.set(id, record);
    return resident;
  }

  rejectSignup(id: string) {
    const record = this.signupRequests.get(id);
    if (!record) return false;
    record.status = "rejected";
    this.signupRequests.set(id, record);
    return true;
  }

  findResidentByMobile(mobile: string) {
    return this.residentsByMobile.get(mobile) || null;
  }

  setOtpSession(mobile: string, code: string, ttlMs: number) {
    this.otpsByMobile.set(mobile, { mobile, code, expiresAt: Date.now() + ttlMs });
  }

  verifyOtp(mobile: string, code: string) {
    const s = this.otpsByMobile.get(mobile);
    if (!s) return false;
    const ok = s.code === code && Date.now() <= s.expiresAt;
    if (ok) this.otpsByMobile.delete(mobile);
    return ok;
  }

  addDocument(input: Omit<DocumentItem, "id" | "status" | "createdAt">) {
    const id = randomUUID();
    const doc: DocumentItem = {
      id,
      ...input,
      status: "queued",
      createdAt: Date.now(),
    };
    this.documentsById.set(id, doc);
    return doc;
  }

  listDocumentsForResident(residentId: string) {
    return Array.from(this.documentsById.values()).filter((d) => d.ownerResidentId === residentId);
  }

  listDocumentsForCommunity(community: string) {
    // naive: lookup resident ids in that community
    const residentIds = new Set(
      Array.from(this.residentsByMobile.values())
        .filter((r) => r.community === community)
        .map((r) => r.id)
    );
    return Array.from(this.documentsById.values()).filter((d) => residentIds.has(d.ownerResidentId));
  }

  markPrinted(docId: string) {
    const d = this.documentsById.get(docId);
    if (!d) return false;
    d.status = "printed";
    this.documentsById.set(docId, d);
    return true;
  }
}

// Singleton per runtime
export const store = new InMemoryStore();
