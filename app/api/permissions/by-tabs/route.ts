import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { MENU_ITEMS, FEATURE_PERMISSIONS } from '@/lib/permissions';

interface FeaturePermission {
  key: string;
  name: string;
  icon: string;
}

interface TabPermissionGroup {
  value: string;
  label: string;
  icon: string;
  href: string;
  adminOnly: boolean;
  description: string;
  features: FeaturePermission[];
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔷 Menu Permissions API - GET request received');
    const user = getUserFromRequest(request);
    if (!user) {
      console.log('❌ Menu Permissions API - Unauthorized');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('✅ Menu Permissions API - User authenticated');

    // Get all menu items with their features
    const tabPermissions: TabPermissionGroup[] = MENU_ITEMS.map(item => {
      const tabKey = item.href.split('/').pop() as keyof typeof FEATURE_PERMISSIONS;
      const features = FEATURE_PERMISSIONS[tabKey] || [];
      
      return {
        value: item.permission,
        label: item.label,
        icon: item.icon,
        href: item.href,
        adminOnly: item.adminOnly || false,
        description: `Access to ${item.label} tab`,
        features,
      };
    });

    console.log('✅ Menu Permissions API - Generated', tabPermissions.length, 'tab permission groups with features');
    tabPermissions.forEach(tab => {
      console.log(`   📍 ${tab.label}: ${tab.features.length} features`);
    });

    return NextResponse.json({
      tab_permissions: tabPermissions,
      menu_items: MENU_ITEMS.length
    });
  } catch (error) {
    console.error('❌ Error fetching menu permissions:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
