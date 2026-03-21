export type CaseStatus = "open" | "under_review" | "closed" | "won" | "lost";
export type CaseCategory =
  | "investment_fraud"
  | "romance_scam"
  | "phishing"
  | "ecommerce_fraud"
  | "rental_fraud"
  | "other";
export type ConsentType =
  | "terms_of_service"
  | "privacy_policy"
  | "data_sharing_legal_team"
  | "cookie_consent";

export type UserRole = "client" | "admin" | "supervisor";

export interface Profile {
  id: string;
  alias: string;
  avatar_url: string | null;
  is_verified: boolean;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Case {
  id: string;
  creator_id: string;
  title: string;
  accused_company: string;
  description: string;
  category: CaseCategory;
  status: CaseStatus;
  is_public: boolean;
  private_token: string;
  created_at: string;
  updated_at: string;
  // relations
  profiles?: Pick<Profile, "alias">;
  claims?: { count: number }[];
}

export interface Claim {
  id: string;
  case_id: string;
  user_id: string;
  amount_defrauded: number;
  testimony: string;
  share_with_legal: boolean;
  created_at: string;
  updated_at: string;
}

export interface Evidence {
  id: string;
  claim_id: string;
  user_id: string;
  storage_path: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  created_at: string;
}

export interface ConsentLog {
  id: string;
  user_id: string;
  consent_type: ConsentType;
  document_version: string;
  accepted: boolean;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "created_at" | "updated_at">;
        Update: Partial<Omit<Profile, "id" | "created_at" | "updated_at">>;
      };
      cases: {
        Row: Case;
        Insert: Omit<Case, "id" | "private_token" | "created_at" | "updated_at">;
        Update: Partial<Omit<Case, "id" | "creator_id" | "created_at" | "updated_at">>;
      };
      claims: {
        Row: Claim;
        Insert: Omit<Claim, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Claim, "id" | "case_id" | "user_id" | "created_at" | "updated_at">>;
      };
      evidences: {
        Row: Evidence;
        Insert: Omit<Evidence, "id" | "created_at">;
        Update: Partial<Omit<Evidence, "id" | "claim_id" | "user_id" | "created_at">>;
      };
      consent_logs: {
        Row: ConsentLog;
        Insert: Omit<ConsentLog, "id" | "created_at">;
        Update: never;
      };
    };
  };
}
