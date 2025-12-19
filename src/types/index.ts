export interface Certificate {
  id: string;
  name: string;
  domain: string;
  issuer: string;
  status: 'active' | 'expired' | 'expiring_soon';
  expiryDate: string;
  issuedDate: string;
  algorithm: string;
  serialNumber: string;
}

export interface SSHKey {
  id: string;
  keyOwner: string;
  fingerprint: string;
  lastUsed: string;
  trustLevel: 'high' | 'medium' | 'low';
  keyType: string;
  createdAt: string;
  servers: Server[];
}

export interface Server {
  name: string;
  ip: string;
}

export interface CodeSigningKey {
  id: string;
  keyAlias: string;
  algorithm: string;
  protectionLevel: 'HSM' | 'Software';
  createdAt: string;
  lastUsed: string;
  expiryDate: string;
  usage: string;
  status: 'active' | 'expired';
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  actionType: string;
  targetResource: string;
  metadata: Record<string, any>;
}

export type ActionType =
  | 'certificate_renewed'
  | 'certificate_viewed'
  | 'certificate_updated'
  | 'certificate_exported'
  | 'certificate_auto_renewed'
  | 'certificate_expiry_warning'
  | 'certificate_discovery'
  | 'ssh_key_used'
  | 'ssh_key_created'
  | 'ssh_key_revoked'
  | 'ssh_key_updated'
  | 'code_signing_key_created'
  | 'code_signing_key_used'
  | 'code_signing_key_updated'
  | 'code_signing_key_exported'
  | 'code_signing_key_rotated'
  | 'access_review_completed'
  | 'compliance_scan_completed'
  | 'settings_modified'
  | 'failed_authentication'
  | 'health_check_failed'
  | 'report_generated'
  | 'automated_cleanup';

export interface FilterState {
  search?: string;
  domain?: string;
  trustLevel?: 'high' | 'medium' | 'low' | '';
  protectionLevel?: 'HSM' | 'Software' | '';
  actionType?: ActionType | '';
  dateFrom?: string;
  dateTo?: string;
}

export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

export type ViewMode = 'table' | 'grid';
