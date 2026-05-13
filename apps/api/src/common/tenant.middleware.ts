import { Injectable, NestMiddleware, NotFoundException } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';

declare module 'express-serve-static-core' {
  interface Request {
    schoolId?: string;
    schoolSubdomain?: string;
  }
}

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private prisma: PrismaService) {}

  async use(req: Request, _res: Response, next: NextFunction) {
    const host = (req.headers['x-forwarded-host'] as string) || req.headers.host || '';
    const headerOverride = req.headers['x-school-subdomain'] as string | undefined;

    const subdomain = headerOverride ?? this.parseSubdomain(host);
    if (!subdomain) return next();

    const school = await this.prisma.school.findUnique({
      where: { subdomain },
      select: { id: true, subdomain: true, isActive: true },
    });
    if (!school || !school.isActive) {
      throw new NotFoundException(`Unknown or inactive school: ${subdomain}`);
    }

    req.schoolId = school.id;
    req.schoolSubdomain = school.subdomain;
    next();
  }

  private parseSubdomain(host: string): string | null {
    const cleaned = host.replace(/:\d+$/, '');
    const parts = cleaned.split('.');
    if (parts.length < 3) return null;
    const sub = parts[0];
    if (sub === 'www' || sub === 'api' || sub === 'localhost') return null;
    return sub;
  }
}
