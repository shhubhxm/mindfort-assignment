import findingsRaw from '../data/findings.json';
import type { Finding } from '../types/finding';

const findings = findingsRaw as Finding[];

type Node = {
  id: string;
  type: string;
  label: string;
};

type Edge = {
  source: string;
  target: string;
  label: string;
};

const nodeMap = new Map<string, Node>();
const edgeSet = new Set<string>();

function addNode(node: Node) {
  if (!nodeMap.has(node.id)) {
    nodeMap.set(node.id, node);
  }
}

function addEdge(edge: Edge) {
  const key = `${edge.source}->${edge.label}->${edge.target}`;
  if (!edgeSet.has(key)) {
    edgeSet.add(key);
  }
}

export function buildGraph(): { nodes: Node[]; edges: Edge[] } {
  const pkgToServices: Record<string, Set<string>> = {};

  findings.forEach((finding) => {
    const { finding_id, vulnerability: v, asset, package: pkg } = finding;

    // Finding node
    addNode({ id: finding_id, type: 'finding', label: v.title });

    // Service node and relation
    if (asset?.service) {
      const serviceId = `service-${asset.service}`;
      addNode({ id: serviceId, type: 'service', label: asset.service });
      addEdge({ source: finding_id, target: serviceId, label: 'affects' });
    }

    // OWASP node
    if (v.owasp_id) {
      const owaspId = `owasp-${v.owasp_id}`;
      addNode({ id: owaspId, type: 'owasp', label: v.owasp_id });
      addEdge({ source: finding_id, target: owaspId, label: 'is_type' });
    }

    // Severity node
    if (v.severity) {
      const sevId = `sev-${v.severity}`;
      addNode({ id: sevId, type: 'severity', label: v.severity });
      addEdge({ source: finding_id, target: sevId, label: 'has_severity' });
    }

    // CWE
    if (v.cwe_id) {
      const cweId = `cwe-${v.cwe_id}`;
      addNode({ id: cweId, type: 'cwe', label: v.cwe_id });
      addEdge({ source: finding_id, target: cweId, label: 'has_cwe' });
    }

    // CVE
    if (v.cve_id) {
      const cveId = `cve-${v.cve_id}`;
      addNode({ id: cveId, type: 'cve', label: v.cve_id });
      addEdge({ source: finding_id, target: cveId, label: 'has_cve' });
    }

    // Package
    if (pkg) {
      const pkgId = `pkg-${pkg.name}@${pkg.version}`;
      addNode({ id: pkgId, type: 'package', label: `${pkg.name}@${pkg.version}` });
      addEdge({ source: finding_id, target: pkgId, label: 'uses_package' });

      if (asset?.service) {
        const serviceId = `service-${asset.service}`;
        pkgToServices[pkgId] ??= new Set();
        pkgToServices[pkgId].add(serviceId);
      }
    }
  });

  //  Add inferred edges between services sharing a package
  Object.entries(pkgToServices).forEach(([pkgId, services]) => {
    const serviceList = Array.from(services);
    for (let i = 0; i < serviceList.length; i++) {
      for (let j = i + 1; j < serviceList.length; j++) {
        addEdge({
          source: serviceList[i],
          target: serviceList[j],
          label: 'shares_component_with',
        });
      }
    }
  });

  return {
    nodes: Array.from(nodeMap.values()),
    edges: Array.from(edgeSet).map((key) => {
      const [source, label, target] = key.split('->');
      return { source, label, target };
    }),
  };
}
