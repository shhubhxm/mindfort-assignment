import findingsRaw from '../data/findings.json';
import type { Finding } from '@/types/finding';

/**
 * Returns a Markdown summary of vulnerable components shared across services.
 */
export function getSharedVulnerabilitiesSummary(): string {
  const findings = findingsRaw as Finding[];
  const componentMap: Record<string, Set<string>> = {};

  findings.forEach((f) => {
    const pkg = f.vulnerability?.package ?? (f as any)?.package;
    const service =
      f.asset?.service ??
      f.asset?.image?.split(':')[0] ??
      f.asset?.path?.split('/')[1];

    if (pkg && service) {
      const key = `${pkg.name}@${pkg.version}`;
      if (!componentMap[key]) {
        componentMap[key] = new Set();
      }
      componentMap[key].add(service);
    }
  });

  const shared: string[] = [];

  for (const [component, services] of Object.entries(componentMap)) {
    if (services.size > 1) {
      shared.push(`- **${component}** is used by: ${Array.from(services).join(', ')}`);
    }
  }

  if (shared.length === 0) {
    return 'No components were shared across multiple services in the findings.';
  }

  return `### Shared Vulnerable Components Found:\n${shared.join('\n')}`;
}

/**
 * Returns a narrative risk insight if shared vulnerable components are found.
 */
export function getCompositeRiskInsight(findings: Finding[]): string | null {
  const componentToServices: Record<string, Set<string>> = {};

  findings.forEach((f) => {
    const service =
      f.asset?.service ??
      f.asset?.image?.split(':')[0] ??
      f.asset?.path?.split('/')[1];
    const pkg = f.vulnerability?.package ?? (f as any)?.package;

    if (!service || !pkg?.name || !pkg?.version) return;

    const key = `${pkg.name}@${pkg.version}`;
    if (!componentToServices[key]) {
      componentToServices[key] = new Set();
    }
    componentToServices[key].add(service);
  });

  const sharedComponents = Object.entries(componentToServices).filter(
    ([_, services]) => services.size > 1
  );

  if (sharedComponents.length === 0) return null;

  const insights = sharedComponents.map(([component, services]) => {
    const serviceList = Array.from(services).join(', ');
    return ` The component **${component}** is used by multiple services: **${serviceList}**. If an attacker compromises one service, they may pivot laterally to others via this shared component, forming a multi-stage attack chain.`;
  });

  return `Yes. Composite risks detected:\n\n${insights.join('\n\n')}`;
}
