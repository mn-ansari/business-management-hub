import { NextRequest, NextResponse } from 'next/server';
import { MENU_ITEMS } from '@/lib/permissions';

export async function GET(request: NextRequest) {
  try {
    // Return menu items with their permission requirements
    const menuItems = MENU_ITEMS.filter(item => !item.adminOnly).map(item => ({
      href: item.href,
      icon: item.icon,
      label: item.label,
      permission: item.permission,
    }));

    return NextResponse.json({
      menu_items: menuItems,
      admin_items: MENU_ITEMS.filter(item => item.adminOnly)
    });
  } catch (error) {
    console.error('Error fetching menu items:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
