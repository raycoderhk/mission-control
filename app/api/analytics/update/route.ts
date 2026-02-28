import { NextResponse } from 'next/server';
import { writeFile, readFile } from 'fs/promises';
import path from 'path';

/**
 * Analytics Update Endpoint
 * 
 * POST endpoint for OpenClaw Gateway to push usage data
 * This allows real-time analytics without polling
 * 
 * Usage from Gateway:
 * curl -X POST https://misson-dashboard.zeabur.app/api/analytics/update \
 *   -H "Content-Type: application/json" \
 *   -H "Authorization: Bearer YOUR_WEBHOOK_SECRET" \
 *   -d '{"apiUsage": {...}, "agents": {...}}'
 */

export async function POST(request: Request) {
  try {
    // Verify webhook secret (if configured)
    const authHeader = request.headers.get('authorization');
    const webhookSecret = process.env.ANALYTICS_WEBHOOK_SECRET;
    
    if (webhookSecret && authHeader !== `Bearer ${webhookSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse incoming data
    const data = await request.json();
    
    // Validate required fields
    if (!data.apiUsage && !data.agents && !data.system) {
      return NextResponse.json(
        { error: 'No valid data provided' },
        { status: 400 }
      );
    }

    // Read existing analytics
    const analyticsPath = path.join(process.cwd(), 'data', 'analytics.json');
    let existingAnalytics = {};
    
    try {
      const existing = await readFile(analyticsPath, 'utf-8');
      existingAnalytics = JSON.parse(existing);
    } catch (error) {
      console.log('No existing analytics file, creating new one');
    }

    // Merge with existing data
    const updatedAnalytics = {
      ...existingAnalytics,
      ...data,
      lastUpdated: new Date().toISOString(),
    };

    // Write updated analytics
    await writeFile(
      analyticsPath,
      JSON.stringify(updatedAnalytics, null, 2),
      'utf-8'
    );

    console.log('✅ Analytics updated via webhook');
    
    return NextResponse.json({
      success: true,
      message: 'Analytics updated successfully',
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error updating analytics:', error);
    return NextResponse.json(
      { error: 'Failed to update analytics' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Analytics Update Endpoint',
    usage: 'POST with JSON data to update analytics',
    example: {
      apiUsage: {
        provider: 'Aliyun Coding Plan',
        current: {
          today: 1245,
          thisMonth: 15678,
          remaining: 74322,
          percentageUsed: 17.4,
        },
      },
      agents: {
        active: 4,
        list: ['Jarvis', 'Coding Agent', 'Research Agent', 'Admin Agent'],
      },
    },
  });
}
