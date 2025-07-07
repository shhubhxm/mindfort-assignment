'use client';

import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { ForceGraphMethods } from 'react-force-graph-2d';

// Dynamic client-only import
const ForceGraph2D = dynamic(
  () => import('react-force-graph-2d').then((mod) => mod.default),
  { ssr: false }
) as unknown as React.ForwardRefExoticComponent<
  React.PropsWithoutRef<any> & React.RefAttributes<ForceGraphMethods>
>;

export default function GraphPage() {
  const fgRef = useRef<ForceGraphMethods | null>(null);
  const [data, setData] = useState({ nodes: [], links: [] });

  useEffect(() => {
    fetch('/api/graph')
      .then((res) => res.json())
      .then((json) => {
        // Hardcoded colors by type
        const typeColorMap: Record<string, string> = {
          vulnerability: 'lightblue',
          service: 'green',
          owasp: 'red',
          severity: 'orange',
          cwe: 'yellow',
          cve: 'purple',
          package: 'cyan',
        };

        json.nodes.forEach((n: any) => {
          const rawType = (n.type || '').toString().toLowerCase();
          const normalizedType =
            rawType === 'finding' ? 'vulnerability' :
            rawType === 'svc' ? 'service' :
            rawType;

          n.type = normalizedType;
          n.color = typeColorMap[normalizedType] || 'gray';
          n.label = n.label || n.id; // ✅ Fallback if label is missing
          n.__deg = 0;
        });

        json.edges.forEach((l: any) => {
          const source = json.nodes.find((n: any) => n.id === l.source);
          const target = json.nodes.find((n: any) => n.id === l.target);
          if (source) source.__deg++;
          if (target) target.__deg++;
        });

        setData({ nodes: json.nodes, links: json.edges });

        // Auto zoom
        setTimeout(() => {
          if (fgRef.current) fgRef.current.zoomToFit(400);
        }, 300);
      });
  }, []);

  return (
    <div style={{ height: '100vh', background: '#111' }}>
      {/* Legend */}
      <div
        style={{
          position: 'absolute',
          top: 20,
          left: 20,
          color: '#fff',
          zIndex: 10,
          fontSize: 14,
          lineHeight: '1.6',
        }}
      >
        <div><span style={{ color: 'lightblue' }}>⬤</span> Vulnerability</div>
        <div><span style={{ color: 'green' }}>⬤</span> Service</div>
        <div><span style={{ color: 'red' }}>⬤</span> OWASP</div>
        <div><span style={{ color: 'orange' }}>⬤</span> Severity</div>
        <div><span style={{ color: 'yellow' }}>⬤</span> CWE</div>
        <div><span style={{ color: 'purple' }}>⬤</span> CVE</div>
        <div><span style={{ color: 'cyan' }}>⬤</span> Package</div>
      </div>

      {/* Graph */}
      <ForceGraph2D
        ref={fgRef}
        graphData={data}
        nodeLabel={(node: any) => node.label || node.id} // ✅ Always show something
        nodeColor={(node: any) => node.color}
        nodeRelSize={6}
        nodeVal={(node: any) => node.__deg || 1}
        linkLabel={(link: any) => link.label || `${link.source} → ${link.target}`}
        linkDirectionalArrowLength={3.5}
        linkDirectionalArrowRelPos={1}
        linkWidth={1.5}
        linkColor={() => 'rgba(255,255,255,0.6)'}
      />
    </div>
  );
}
