import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // 检查是否是访问管理后台
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // 如果是访问登录页面，直接放行
    if (request.nextUrl.pathname === '/admin/login') {
      return NextResponse.next()
    }

    // 检查是否已登录
    const isLoggedIn = request.cookies.get('isAdminLoggedIn')?.value === 'true'

    if (!isLoggedIn) {
      // 未登录则重定向到登录页面
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/admin/:path*',
} 