import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    console.log('🔷 Permissions API - GET request received');
    const user = getUserFromRequest(request);
    if (!user) {
      console.log('❌ Permissions API - No user found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('✅ Permissions API - User authenticated');

    // Get all permissions grouped by category
    const [permissions]: any = await pool.query(
      `SELECT * FROM permissions 
       ORDER BY category ASC, permission_name ASC`
    );

    console.log('✅ Permissions API - Found', permissions.length, 'permissions');

    // Group by category
    const grouped = permissions.reduce((acc: any, perm: any) => {
      const category = perm.category || 'Other';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(perm);
      return acc;
    }, {});

    return NextResponse.json({
      permissions: permissions,
      grouped: grouped
    });
  } catch (error) {
    console.error('❌ Error fetching permissions:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
