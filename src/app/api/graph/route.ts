import { NextResponse } from 'next/server';
import { buildGraph } from '@/lib/graph';

export async function GET() {
  console.log(' /api/graph endpoint hit');
  const graph = buildGraph();
  return NextResponse.json(graph);
}
