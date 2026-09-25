import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('https://opensky-network.org/api/states/all', {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'FlightAI-Proxy/1.0'
      },
      next: { revalidate: 10 }
    });
    
    if (!res.ok) {
      return NextResponse.json({ error: `Failed to fetch OpenSky data: ${res.statusText}` }, { status: res.status });
    }
    
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Flights Proxy Error:", error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
