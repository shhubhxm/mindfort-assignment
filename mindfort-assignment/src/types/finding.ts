export interface Finding {
  finding_id: string;
  scanner: string;
  scan_id: string;
  timestamp: string;
  vulnerability: {
    owasp_id: string;
    cwe_id: string;
    title: string;
    severity: string;
    description: string;
    vector: string;
    cve_id?: string;
    package?: {
      name: string;
      version: string;
    };
  };
  asset: {
    type: string;
    url?: string;
    path?: string;
    image?: string;
    service?: string;
    cluster?: string;
    registry?: string;
    repo?: string;
  };
  package?: {
    ecosystem: string;
    name: string;
    version: string;
  };
}
